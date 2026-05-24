<template>
    <div class="table" :style="{ '--columnCount': filteredTables.length }">
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
        <template v-for="table in filteredTables" :key="table.id">
            <div class="table_column">
                <div class="table_column-title">
                    <span>
                        #<b>{{ table.number }}</b>
                        {{ table.capacity + " чел" }}
                    </span>
                    <span>{{ table.zone }}</span>
                </div>
                <div class="table_column-content">
                    <template
                        v-for="order in prepareTableData(
                            table.orders,
                            table.reservations,
                            startMinutes,
                            selectDate,
                            props.restaurant.timezone,
                        )"
                    >
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
                        :time="time.value"
                        :table="table.id"
                    ></div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { Restaurant, Table } from "@/interfaces/RestaurantResponse";
import tableCard from "../table/tableCard.vue";
import { toMinutes } from "@/utils/formatTime";
import { useTableLayout } from "@/composable/useTableLayout";
import type { Zones } from "@/interfaces/tableLayout";
import { computed } from "vue";

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

const filteredTables = computed(() => {
    return props.tables.filter((table) => {
        return props.selectZones.includes(table.zone);
    });
});

const { prepareTableData } = useTableLayout();

const timeSlots: TimeSlots[] = [];

const toLabel = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const startMinutes = toMinutes(
    props.restaurant.opening_time,
    props.restaurant.timezone,
);

const getTimeSlots = () => {
    console.log(props.restaurant.opening_time);
    const endMinutes = toMinutes(
        props.restaurant.closing_time,
        props.restaurant.timezone,
    );

    let current = startMinutes;
    console.log(current);
    console.log(startMinutes);

    if (current && endMinutes) {
        while (current < endMinutes) {
            timeSlots.push({
                label: toLabel(current),
                value: current,
            });

            current += 30;
        }

        if (timeSlots[timeSlots.length - 1]?.value !== endMinutes) {
            timeSlots.push({
                label: toLabel(endMinutes),
                value: endMinutes,
            });
        }
    }
};

getTimeSlots();
</script>

<style scoped lang="scss">
.table {
    display: grid;
    grid-template-columns: 32px repeat(var(--columnCount), 80px);
    position: relative;
    width: fit-content;
    height: fit-content;
    &_column {
        display: flex;
        flex-direction: column;

        &-time {
            font-family: var(--font-family);
            font-weight: 400;
            font-size: 11px;
            line-height: 127%;
            color: rgba(255, 255, 255, 0.48);
            height: 40px;

            &:first-of-type {
                height: 48px;
            }
        }
        &-item {
            height: 40px;
            border-right: 1px solid rgba(255, 255, 255, 0.16);
            border-top: 1px solid rgba(255, 255, 255, 0.16);
            &:last-of-type {
                border-bottom: 1px solid rgba(255, 255, 255, 0.16);
            }
        }

        &-title {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 48px;
            position: sticky;
            top: 15px;
            span {
                font-family: var(--font-family);
                font-weight: 400;
                font-size: 11px;
                line-height: 127%;
                color: rgba(255, 255, 255, 0.64);
                b {
                    font-weight: 600;
                    font-size: 13px;
                    line-height: 154%;
                    color: #fff;
                }
            }
        }
        &-content {
            position: relative;
        }
    }
    &_row-title {
        display: flex;
        flex-direction: column;
        position: sticky;
        left: 15px;
    }
}
</style>
