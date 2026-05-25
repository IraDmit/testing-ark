<template>
    <div
        class="booking-card"
        role="dialog"
        aria-labelledby="booking-title"
        :style="{
            '--top': top + 'px',
            '--left': left + 'px',
            '--height': height + 'px',
            '--width': width + 'px',
        }"
    >
        <div class="booking-card__title" id="booking-title">
            Новое бронирование
        </div>

        <div class="booking-card__row">27 марта</div>
        <div class="booking-card__row">10:00 – 12:00</div>
        <div class="booking-card__row booking-card__row--muted">2 часа</div>

        <div class="booking-card__row booking-card__row--tables">
            Столы <strong>#2 + #4 + #5</strong>
        </div>
        <div class="booking-card__row booking-card__row--people">На 8 чел</div>

        <div class="booking-card__actions">
            <button class="btn btn--primary" type="button">Создать</button>
            <button class="btn btn--secondary" type="button">Отменить</button>
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

        tables: Map<number, number>;
        time: { start: number; end: number };
    }>(),
    {
        top: 0,
        left: 0,
    },
);

const width = computed(() => {
    return props.tables.length * CELL_WIDTH;
});
const height = computed(() => {
    return (props.time.end - props.time.start) * MINUTE_PX;
});
</script>

<style scoped lang="scss">
.booking-card {
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    width: var(--width);
    // max-width: 360px;
    box-shadow: var(--shadow-card);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);

    height: var(--height);

    position: absolute;
    z-index: 1000;
    top: var(--top);
    left: var(--left);
    overflow: hidden;
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
