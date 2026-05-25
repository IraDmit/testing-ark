<template>
    <div
        class="table"
        ref="table"
        :style="{ gridTemplateColumns: gridColumns }"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @keydown.esc="isSelecting = false"
        @mouseup="onMouseUp"
    >
        <!-- @mouseleave="onMouseUp" -->
        <div class="table_row-title">
            <div class="table_column-time"></div>
            <div
                class="table_column-time"
                v-for="time in timeSlots"
                :key="time.value"
            >
                {{ time.label }}
            </div>
        </div>
        <template v-for="table in preparedTables" :key="table.id">
            <div class="table_column">
                <div class="table_column-title">
                    <span>
                        #<b>{{ table.number }}</b>
                        {{ table.capacity + " чел" }}
                    </span>
                    <span>{{ table.zone }}</span>
                </div>
                <div class="table_column-content">
                    <template v-for="order in table.orders" :key="order.raw.id">
                        <tableCard
                            :type="order.type"
                            :order="order.raw"
                            :meta="order.meta"
                            :time-zone="restaurant.timezone"
                        />
                    </template>
                    <div
                        class="table_column-item"
                        v-for="time in timeSlots"
                        :key="time.value"
                        :data-time="time.value"
                        :data-table-id="table.id"
                        :data-table-number="table.number"
                        :data-table-capacity="table.capacity"
                    ></div>
                </div>
            </div>
        </template>
        <newCard
            :top="newOrder.y"
            :left="newOrder.x"
            :height="newOrder.height"
            :width="newOrder.width"
            :tables="newOrder.tables || []"
            :time="newOrder.time"
            v-show="isSelecting"
        />
    </div>
</template>

<script setup lang="ts">
import type { Restaurant, Table } from "@/interfaces/RestaurantResponse";
import tableCard from "../table/tableCard.vue";
import { toMinutes } from "@/utils/formatTime";
import { useTableLayout } from "@/composable/useTableLayout";
import type { Zones } from "@/interfaces/tableLayout";
import { computed, ref, useTemplateRef } from "vue";
import newCard from "./newCard.vue";
import { CELL_MINUTES, CELL_WIDTH } from "@/constants";

const props = defineProps<{
    restaurant: Restaurant;
    tables: Table[];
    selectZones: Zones[];
    selectDate: string;
}>();

interface TimeSlots {
    label: string;
    value: number;
}

const { prepareTableData } = useTableLayout();

const filteredTables = computed(() => {
    return props.tables.filter((table) =>
        props.selectZones.includes(table.zone),
    );
});

const preparedTables = computed(() => {
    return filteredTables.value.map((table) => ({
        ...table,
        orders: prepareTableData(
            table.orders,
            table.reservations,
            startMinutes.value,
            props.selectDate,
            props.restaurant.timezone,
        ),
    }));
});

const gridColumns = computed(
    () => `32px repeat(${filteredTables.value.length}, 80px)`,
);

const toLabel = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const startMinutes = computed(() =>
    toMinutes(props.restaurant.opening_time, props.restaurant.timezone),
);

const timeSlots = computed<TimeSlots[]>(() => {
    const start = startMinutes.value;
    const end = toMinutes(
        props.restaurant.closing_time,
        props.restaurant.timezone,
    );

    if (!start || !end) return [];

    const slots: TimeSlots[] = [];
    let current = start;

    while (current < end) {
        slots.push({ label: toLabel(current), value: current });
        current += 30;
    }

    if (slots.at(-1)?.value !== end) {
        slots.push({ label: toLabel(end), value: end });
    }

    return slots;
});

const container = useTemplateRef("table");

const isSelecting = ref(false);

const newOrder = ref({
    x: 0,
    y: 0,
    tables: new Map([]) as Map<number, number>,
    date: props.selectDate,
    time: {
        start: 0,
        end: 0,
    },
});

let startPos = {
    y: 0,
    x: 0,
};

const onMouseDown = (e: MouseEvent) => {
    const rect = container?.value?.getBoundingClientRect();
    const target = e.target as HTMLElement;
    console.log(target);

    if (!container.value && target.attributes["data-time"].value) return;

    // const startTime =

    isSelecting.value = true;
    console.log(target.offsetTop, rect.left);
    console.log(target.offsetParent.offsetLeft, rect.top);
    startPos = {
        y: target.offsetTop + 48,
        x: target.offsetParent.offsetLeft,
    };

    newOrder.value.x = startPos.x;
    newOrder.value.y = startPos.y;
    newOrder.value.time = {
        start: Number(target.attributes["data-time"].value),
        end: +target.attributes["data-time"].value + CELL_MINUTES,
    };
    newOrder.value.tables.set(
        target.attributes["data-table-number"].value,
        target.attributes["data-table-capacity"].value,
    );
    console.log(newOrder.value);
};
const calculateData = () => {};

const onMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
        newOrder?.value?.tables?.has(
            target.attributes["data-table-number"].value,
        ) &&
        newOrder.value.time.start ===
            Number(target.attributes["data-time"].value)
    )
        return;

    if (!container.value || !isSelecting.value) return;

    const xPos = target.offsetParent.offsetLeft;
    const yPos = target.offsetTop + 48;
    newOrder.value = {
        x: Math.min(startPos.x, xPos),
        y: Math.min(startPos.y, yPos),
    };
    newOrder.value.tables.set(
        target.attributes["data-table-number"].value,
        target.attributes["data-table-capacity"].value,
    );
};

const onMouseUp = () => {
    isSelecting.value = false;
};
</script>

<style scoped lang="scss">
.table {
    display: grid;
    grid-template-columns:
        var(--table-time-column-width)
        repeat(var(--columnCount), var(--table-column-width));

    position: relative;

    width: fit-content;
    height: fit-content;

    &_column {
        display: flex;
        flex-direction: column;

        &-time {
            height: var(--table-row-height);

            font-family: var(--font-family);
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-regular);
            line-height: var(--line-height-normal);

            color: var(--color-text-muted);

            &:first-of-type {
                height: var(--table-header-height);
            }
        }

        &-item {
            height: var(--table-row-height);

            border-top: 1px solid var(--color-border-primary);
            border-right: 1px solid var(--color-border-primary);

            &:last-of-type {
                border-bottom: 1px solid var(--color-border-primary);
            }
        }

        &-title {
            position: sticky;
            top: 15px;
            z-index: var(--z-sticky);

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            height: var(--table-header-height);

            span {
                font-family: var(--font-family);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-regular);
                line-height: var(--line-height-normal);

                color: var(--color-text-secondary);

                b {
                    font-size: var(--font-size-sm);
                    font-weight: var(--font-weight-semibold);
                    line-height: var(--line-height-relaxed);

                    color: var(--color-text-primary);
                }
            }
        }

        &-content {
            position: relative;
        }
    }

    &_row-title {
        position: sticky;
        left: 15px;
        z-index: var(--z-sticky);

        display: flex;
        flex-direction: column;
    }
}
</style>
