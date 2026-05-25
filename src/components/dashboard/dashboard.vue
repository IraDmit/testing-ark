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
// import { useBookingData } from "@/composable/useBookingData";

const selectDate = ref<string>(response.current_day);

const zones: Zones[] = ["1 этаж", "2 этаж", "Банкетный зал"];
const selectedZones = ref<Zones[]>(["1 этаж", "2 этаж", "Банкетный зал"]);

const addZone = (zone: Zones) => {
    const idx = selectedZones.value.indexOf(zone);
    if (idx === -1) {
        selectedZones.value.push(zone);
    } else {
        selectedZones.value.splice(idx, 1);
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

// const fetchData = async () => {
//     const data = await useBookingData();
//     console.log(data);
// };

// fetchData();
</script>

<style scoped lang="scss">
section {
    display: flex;
    flex-direction: column;

    gap: var(--space-md);

    padding: var(--space-lg) 0 var(--space-lg) 20px;
}

.page-title {
    font-family: var(--font-family);
    font-size: var(--font-size-xs);
    font-weight: 700;
    line-height: 140%;

    color: var(--color-text-primary);
}

.page-panel {
    display: flex;
    flex-direction: column;

    gap: var(--space-xs);

    &-title {
        font-family: var(--font-family);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-regular);
        line-height: var(--line-height-normal);

        color: var(--color-text-muted);
    }

    &-content {
        display: flex;
        align-items: center;

        gap: var(--space-sm);
    }
}

.single-date {
    display: flex;
    flex-direction: column;

    padding: var(--space-xs) var(--space-sm);

    border-radius: var(--radius-md);

    background-color: var(--color-bg-surface);

    cursor: pointer;

    transition: var(--transition-fast);

    span {
        font-family: var(--font-family);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-normal);

        color: var(--color-text-primary);

        &:last-child {
            font-weight: var(--font-weight-regular);
        }
    }
    &.active {
        background-color: var(--color-accent-primary);
        span {
            color: var(--color-text-active);
        }
    }

    &:hover {
        opacity: 0.7;
    }
}

.single-zone {
    padding: var(--space-xs) 6px;

    border-radius: var(--radius-sm);

    background-color: var(--color-bg-elevated);

    font-family: var(--font-family);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-regular);
    line-height: 145%;

    color: var(--color-text-primary);

    cursor: pointer;

    transition: var(--transition-fast);

    &:hover {
        opacity: 0.8;
    }

    &.active {
        background-color: var(--color-accent-primary);
        color: var(--color-text-active);
    }
}
</style>
