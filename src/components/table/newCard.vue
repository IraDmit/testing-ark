<template>
    <div
        class="booking-card"
        :class="{ active: !isDrawing }"
        :style="{
            '--top': top + 'px',
            '--left': left + 'px',
            '--height': height + 'px',
            '--width': width + 'px',
        }"
    >
        <div class="booking-card__action" @click.prevent="emit('close')">
            &times;
        </div>
        <div class="booking-card__title" id="booking-title">
            Новое бронирование
        </div>

        <div class="booking-card__row">{{ formattedDate }}</div>
        <div class="booking-card__row">{{ timeRange }}</div>
        <div class="booking-card__row booking-card__row--muted">
            {{ duration }}
        </div>

        <div class="booking-card__row booking-card__row--tables">
            Столы <strong>{{ tableNumbers }}</strong>
        </div>
        <div class="booking-card__row booking-card__row--people">
            На {{ countCapacity }} чел
        </div>

        <div class="booking-card__actions">
            <button
                class="btn btn--primary"
                type="button"
                @click.prevent="bookTables"
            >
                Создать
            </button>
            <button
                class="btn btn--secondary"
                type="button"
                @click.prevent="emit('close')"
            >
                Отменить
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CELL_WIDTH, MINUTE_PX } from "@/constants";
import type { Table } from "@/interfaces/RestaurantResponse";
import { computed } from "vue";

const props = withDefaults(
    defineProps<{
        top: number;
        left: number;
        date: string;
        tables: Map<string, Pick<Table, "capacity" | "number">>;
        time: { start: number; end: number };
        isDrawing: boolean;
    }>(),
    {
        top: 0,
        left: 0,
        isDrawing: true,
    },
);

const emit = defineEmits<{
    (e: "close"): void;
}>();

const width = computed(() => props.tables.size * CELL_WIDTH);

const height = computed(() => (props.time.end - props.time.start) * MINUTE_PX);

const countCapacity = computed(() =>
    [...props.tables.values()].reduce((sum, t) => sum + t.capacity, 0),
);

const tableNumbers = computed(() =>
    [...props.tables.values()].map((t) => `#${t.number}`).join(" + "),
);

const toLabel = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const timeRange = computed(
    () => `${toLabel(props.time.start)} – ${toLabel(props.time.end)}`,
);

const duration = computed(() => {
    const diff = props.time.end - props.time.start;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hours && mins) return `${hours} ч ${mins} мин`;
    if (hours) return `${hours} ч`;
    return `${mins} мин`;
});

const formattedDate = computed(() => {
    const date = new Date(props.date);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
});

const bookTables = () => {
    console.group();
    console.log("Забронировано: ");
    console.log("Cтолы: ", [...props.tables.keys()]);
    console.log("Время: ", timeRange.value);
    console.groupEnd();
};
</script>

<style scoped lang="scss">
.booking-card {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    width: var(--width);

    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    height: var(--height);
    position: absolute;
    z-index: 1000;
    top: var(--top);
    left: var(--left);
    overflow: auto;
    pointer-events: none;
    &__title {
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        line-height: var(--line-height-tight);
        margin-bottom: var(--space-xs);
        font-family: var(--font-family);
    }
    &__row {
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
        line-height: var(--line-height-normal);
        font-family: var(--font-family);
    }
    &__row--muted {
        color: var(--color-text-muted);
        margin-bottom: var(--space-sm);
    }
    &__row--tables strong {
        color: var(--color-text-primary);
        font-weight: var(--font-weight-semibold);
    }
    &__row--people {
        margin-bottom: var(--space-sm);
    }
    &__actions {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        margin-top: var(--space-xs);
    }
    &__action {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
    }
    &.active {
        pointer-events: all;
    }
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        border: none;
        border-radius: var(--radius-sm);
        font-family: inherit;
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-normal);
        cursor: pointer;
        transition: var(--transition-fast);
        outline: none;
        position: relative;
        overflow: hidden;
        font-family: var(--font-family);
    }

    .btn::after {
        content: "";
        position: absolute;
        inset: 0;
        background: currentColor;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .btn:active::after {
        opacity: 0.12;
    }

    .btn--primary {
        background: var(--color-accent-primary);
        color: var(--color-text-active);
        box-shadow: var(--shadow-button);
    }

    .btn--secondary {
        background: var(--color-bg-muted);
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border-secondary);
    }

    .btn--secondary:hover {
        background: var(--color-gray-200);
        color: var(--color-text-primary);
    }
}
</style>
