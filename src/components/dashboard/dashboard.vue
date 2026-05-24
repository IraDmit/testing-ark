<template>
    <section>
        <h1 class="page-title">Бронирования</h1>

        <div class="page-panel">
            <p class="page-panel-title">Дата</p>
            <div class="page-panel-content">
                <div
                    class="single-date"
                    :class="{ active: selectDate === date }"
                    v-for="date in response.available_days"
                    :key="date"
                    @click="selectDate = date"
                >
                    <span>{{ getDate(date).date }}</span>
                    <span>{{ getDate(date).weekday }}</span>
                </div>
            </div>
        </div>
        <div class="page-panel">
            <p class="page-panel-title">Отображаемые зоны</p>
            <div class="page-panel-content">
                <div
                    class="single-zone"
                    :class="{ active: selectedZones?.includes(zone) }"
                    v-for="(zone, idx) in zones"
                    :key="'zone' + idx"
                    @click="addZone(zone)"
                >
                    {{ zone }}
                </div>
            </div>
        </div>

        <Table
            :restaurant="response.restaurant"
            :tables="response.tables"
            :select-zones="selectedZones"
            :select-date="selectDate"
        />
    </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Table from "../table/table.vue";
import response from "/public/restaurant-data.json";
import type { Zones } from "@/interfaces/tableLayout";

const selectDate = ref<string>(response.available_days[0]);

const zones: Zones[] = ["1 этаж", "2 этаж", "Банкетный зал"];
const selectedZones = ref<Zones[]>([]);

const addZone = (zone: Zones) => {
    if (selectedZones.value.includes(zone)) {
        selectedZones.value = selectedZones.value?.filter(
            (selectZone) => selectZone != zone,
        );
    } else {
        selectedZones.value?.push(zone);
    }
};

const getDate = (dateStr: string) => {
    const date = new Date(dateStr);

    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const top = date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
    });

    let bottom = "";

    if (isSameDay(date, today)) {
        bottom = "сегодня";
    } else if (isSameDay(date, tomorrow)) {
        bottom = "завтра";
    } else {
        bottom = date.toLocaleDateString("ru-RU", {
            weekday: "long",
        });
    }

    return {
        date: top,
        weekday: bottom,
    };
};
</script>

<style scoped lang="scss">
section {
    padding: 32px 0 32px 20px;
    display: flex;
    flex-direction: column;
    grid-gap: 16px;
}

.page {
    &-title {
        font-family: var(--font-family);
        font-weight: 700;
        font-size: 20px;
        line-height: 140%;
        color: #fff;
    }
    &-panel {
        display: flex;
        flex-direction: column;
        grid-gap: 4px;
        &-title {
            font-family: var(--font-family);
            font-weight: 400;
            font-size: 11px;
            line-height: 127%;
            color: rgba(255, 255, 255, 0.64);
        }
        &-content {
            display: flex;
            align-items: center;
            grid-gap: 8px;
            .single-date {
                padding: 4px 8px;
                display: flex;
                flex-direction: column;
                background-color: var(--black-1);
                border-radius: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
                span {
                    font-family: var(--font-family);
                    font-weight: 600;
                    font-size: 11px;
                    line-height: 127%;
                    color: #fff;
                    &:last-child {
                        font-weight: 400;
                    }
                }

                &:hover {
                    opacity: 0.7;
                }
            }
            .single-zone {
                padding: 4px 6px;
                background-color: var(--black-2);
                border-radius: 4px;
                font-family: var(--font-family);
                font-weight: 400;
                font-size: 11px;
                line-height: 145%;
                color: #fff;
                cursor: pointer;
            }
            .active {
                background-color: var(--active-color);
            }
        }
    }
}
</style>
