<template>
    <section v-if="restaurantData">
        <h1 class="page-title">Бронирования</h1>

        <div class="page-panel">
            <p class="page-panel-title">Дата</p>
            <div class="page-panel-content">
                <div
                    class="single-date"
                    :class="{ active: selectedDate === date }"
                    v-for="date in restaurantData.available_days"
                    :key="date"
                    @click="selectDate(date)"
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
        <template v-if="selectedZones.length">
            <Table
                :restaurant="restaurantData.restaurant"
                :tables="restaurantData.tables"
                :select-zones="selectedZones"
                :select-date="selectedDate"
            />
        </template>
        <template v-else>
            <div class="page-warning">Выберите зону для отображения</div>
        </template>
    </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Table from "../table/table.vue";
import type { Zones } from "@/interfaces/tableLayout";
import { useBookingData } from "@/composable/useBookingData";
import type { RestaurantResponse } from "@/interfaces/RestaurantResponse.ts";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const restaurantData = ref<RestaurantResponse | null>(null);

const selectedDate = ref<string>("");

const zones: Zones[] = ["1 этаж", "2 этаж", "Банкетный зал"];
const selectedZones = ref<Zones[]>(["1 этаж", "2 этаж", "Банкетный зал"]);

const selectDate = (date: string) => {
    selectedDate.value = date;

    router.replace({
        query: {
            ...route.query,
            date: selectedDate.value,
        },
    });
};

const addZone = (zone: Zones) => {
    const idx = selectedZones.value.indexOf(zone);
    if (idx === -1) {
        selectedZones.value.push(zone);
    } else {
        selectedZones.value.splice(idx, 1);
    }

    router.replace({
        query: {
            ...route.query,
            zones: selectedZones.value,
        },
    });
};

const getDate = (dateStr: string) => {
    const date = new Date(dateStr);

    const today = new Date(restaurantData.value?.current_day || "");
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

const fetchData = async (initialQuery = route.query) => {
    const data = await useBookingData<RestaurantResponse>();
    restaurantData.value = data;

    if (initialQuery.date) {
        selectedDate.value = initialQuery.date as string;
    } else {
        selectedDate.value = data.current_day;
        router.replace({
            query: {
                ...route.query,
                date: data.current_day,
            },
        });
    }
};

onMounted(async () => {
    const initialQuery = { ...route.query };

    if (initialQuery.zones?.length) {
        selectedZones.value = [initialQuery.zones].flat() as Zones[];
    } else {
        await router.replace({
            query: { ...initialQuery, zones: selectedZones.value },
        });
    }

    await fetchData(initialQuery);
});
</script>

<style scoped lang="scss">
section {
    display: flex;
    flex-direction: column;
    height: 100%;
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
.page-warning {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-family);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-regular);
    line-height: 145%;
}
</style>
