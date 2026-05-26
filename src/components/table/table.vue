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
                        :data-left-offset="
                            getColumnOffsetLeft(idxCol, CELL_TIME_ITEM_WIDTH)
                        "
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
import { computed, onMounted, ref } from "vue";
import newCard from "./newCard.vue";
import { CELL_WIDTH } from "@/constants";
import { getColumnOffsetLeft } from "@/utils/bookingHelpers";
import { useBooking } from "@/composable/useBooking";

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

const {
    isSelecting,
    newOrder,
    isShowNewCard,
    onMouseDown,
    onMouseMove,
    onMouseUp,
} = useBooking(filteredTables, CELL_TABLE_ITEM_HEIGHT, CELL_TIME_ITEM_WIDTH);

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
