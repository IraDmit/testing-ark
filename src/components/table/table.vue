<template>
    <div
        class="table"
        ref="table"
        :style="{ '--gridTemplateColumns': gridColumns }"
        @mousemove="onMouseMove"
        @mousedown="onMouseDown"
        @mouseup="onMouseUp"
        @mouseleave="onMouseUp"
    >
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
        <template v-for="(table, idxCol) in preparedTables" :key="table.id">
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
                        :data-left-offset="getColumnOffsetLeft(idxCol)"
                        :data-time="time.value"
                        :data-table-id="table.id"
                        :data-table-number="table.number"
                        :data-table-capacity="table.capacity"
                    ></div>
                </div>
            </div>
        </template>
        <newCard
            :date="selectDate"
            :top="newOrder.y"
            :left="newOrder.x"
            :tables="newOrder.tables"
            :time="newOrder.time"
            v-if="isShowNewCard"
            @close="isShowNewCard = false"
            :is-drawing="isSelecting"
        />
    </div>
</template>

<script setup lang="ts">
import type { Restaurant, Table } from "@/interfaces/RestaurantResponse";
import tableCard from "../table/tableCard.vue";
import { toMinutes } from "@/utils/formatTime";
import { useTableLayout } from "@/composable/useTableLayout";
import type { Zones } from "@/interfaces/tableLayout";
import { computed, onMounted, reactive, ref, useTemplateRef } from "vue";
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

const getColumnOffsetLeft = (idx: number) => {
    return CELL_TIME_ITEM_WIDTH.value + idx * CELL_WIDTH;
};

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
    () => `32px repeat(${filteredTables.value.length}, ${CELL_WIDTH}px)`,
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

const isSelecting = ref(false);

const newOrder = ref({
    x: 0,
    y: 0,
    tables: new Map([]) as Map<string, Pick<Table, "capacity" | "number">>,
    date: props.selectDate,
    time: {
        start: 0,
        end: 0,
    },
});

let startPos = ref({
    y: 0,
    x: 0,
    start_time: 0,
    end_time: 0,
    start_table: { number: "", capacity: "" },
    end_table: { number: "", capacity: "", x: 0 },
});

const isShowNewCard = ref(false);

const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    isShowNewCard.value = true;

    const target = e.target as HTMLElement;

    const time = Number(target.getAttribute("data-time"));
    const tableNumber = target.getAttribute("data-table-number");
    const tableCapacity = target.getAttribute("data-table-capacity");
    const leftOffset = target.getAttribute("data-left-offset");

    if (!time || !tableNumber) return;

    isSelecting.value = true;

    startPos.value = {
        y: target.offsetTop + CELL_TABLE_ITEM_HEIGHT.value,
        x: Number(leftOffset),
        start_time: time,
        end_time: time + CELL_MINUTES,
        start_table: { number: tableNumber, capacity: tableCapacity! },
        end_table: {
            number: tableNumber,
            capacity: tableCapacity!,
            x: (target.offsetParent as HTMLElement).offsetLeft,
        },
    };

    newOrder.value.x = startPos.value.x;
    newOrder.value.y = startPos.value.y;
    newOrder.value.time = { start: time, end: time + CELL_MINUTES };
    newOrder.value.tables = new Map([
        [tableNumber, { capacity: Number(tableCapacity), number: tableNumber }],
    ]);
};

const onMouseMove = (e: MouseEvent) => {
    if (!isSelecting.value) return;

    const target = e.target as HTMLElement;

    const time = Number(target.getAttribute("data-time"));
    const tableId = target.getAttribute("data-table-id");

    if (!time || !tableId) return;

    const startTableIndex = filteredTables.value.findIndex(
        (t) => t.number === startPos.value.start_table.number,
    );
    const currentTableIndex = filteredTables.value.findIndex(
        (t) => String(t.id) === tableId,
    );

    if (!startTableIndex || !currentTableIndex) return;

    const minIdx = Math.min(startTableIndex, currentTableIndex);
    const maxIdx = Math.max(startTableIndex, currentTableIndex);

    newOrder.value.tables = new Map(
        filteredTables.value
            .slice(minIdx, maxIdx + 1)
            .map((table) => [
                table.number,
                { number: table.number, capacity: table.capacity },
            ]),
    );
    const startTime = Math.min(time, startPos.value.start_time);
    const endTime = Math.max(time, startPos.value.start_time) + CELL_MINUTES;

    newOrder.value.time = { start: startTime, end: endTime };

    newOrder.value.x = getColumnOffsetLeft(minIdx);

    const yPos = target.offsetTop + CELL_TIME_ITEM_WIDTH.value;
    newOrder.value.y = Math.min(startPos.value.y, yPos);
};

const CELL_TIME_ITEM_WIDTH = ref(0);
const CELL_TABLE_ITEM_HEIGHT = ref(0);

onMounted(() => {
    CELL_TIME_ITEM_WIDTH.value = Number(
        document.querySelector(".table_column-time")?.clientWidth,
    );
    CELL_TABLE_ITEM_HEIGHT.value = Number(
        document.querySelector(".table_column-time")?.clientHeight,
    );
});

const onMouseUp = () => {
    isSelecting.value = false;
};
</script>

<style scoped lang="scss">
.table {
    position: relative;
    display: grid;
    grid-template-columns: var(--gridTemplateColumns);
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
