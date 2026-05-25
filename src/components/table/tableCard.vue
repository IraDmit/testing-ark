<template>
    <div
        class="table-card"
        :class="[`table-card--${type}`]"
        :style="{
            '--top': meta.top + 'px',
            '--height': meta.height + 'px',
            '--zIndex': meta.zIndex,
            '--width': meta.width + 'px',
            '--leftOffset': meta.leftOffset + 'px',
        }"
    >
        <div
            ref="contentRef"
            class="card-content"
            :class="{
                'card-content--clipped': isClipped,
            }"
            :style="{
                '--contentHeight': realContentHeight
                    ? realContentHeight + 'px'
                    : '100%',
            }"
        >
            <template v-if="isOrder">
                <div class="card-header">
                    <span class="card-label">
                        {{ isBanquet ? "Банкет" : "Заказ" }}
                    </span>

                    <span
                        v-if="!isBanquet"
                        class="card-status-badge"
                        :class="`badge--${statusKey.className}`"
                    >
                        {{ statusKey.label }}
                    </span>
                </div>
            </template>

            <template v-else>
                <div class="card-number">№{{ reservation.id }}</div>

                <div class="card-name">
                    {{ reservation.name_for_reservation }};

                    <span class="card-guests">
                        {{ reservation.num_people }}<span>чел</span>
                    </span>
                </div>

                <div
                    class="card-status-badge"
                    :class="`badge--${statusKey.className}`"
                >
                    {{ statusKey.label }}
                </div>

                <div class="card-phone">
                    <span class="phone-icon">
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M9.99975 7.98954V9.19386C10.0002 9.30566 9.97726 9.41633 9.93238 9.51876C9.8875 9.6212 9.82168 9.71316 9.73913 9.78874C9.65659 9.86432 9.55913 9.92187 9.45301 9.95768C9.34689 9.9935 9.23444 10.0068 9.12287 9.99674C7.88512 9.86252 6.69617 9.4404 5.65156 8.76432C4.67969 8.14797 3.85571 7.32562 3.23813 6.35567C2.55834 5.3084 2.1353 4.11603 2.00326 2.87518C1.99321 2.76417 2.00643 2.65228 2.04208 2.54665C2.07773 2.44102 2.13503 2.34395 2.21032 2.26163C2.28562 2.1793 2.37727 2.11353 2.47943 2.06849C2.58159 2.02346 2.69203 2.00014 2.80372 2.00004H4.01043C4.20564 1.99812 4.39489 2.06711 4.5429 2.19415C4.69091 2.32119 4.78759 2.4976 4.81491 2.69052C4.86584 3.07593 4.9603 3.45435 5.09647 3.81857C5.15059 3.96225 5.1623 4.11841 5.13022 4.26853C5.09814 4.41866 5.02361 4.55646 4.91547 4.66561L4.40462 5.17544C4.97723 6.18046 5.81103 7.01261 6.81805 7.58408L7.32889 7.07425C7.43826 6.96632 7.57633 6.89194 7.72675 6.85992C7.87718 6.8279 8.03364 6.83959 8.17761 6.8936C8.54255 7.02951 8.92173 7.12378 9.3079 7.17461C9.5033 7.20212 9.68174 7.30035 9.80931 7.4506C9.93687 7.60085 10.0046 7.79266 9.99975 7.98954Z"
                                stroke="white"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </span>
                    {{ reservation.phone_number }}
                </div>
            </template>

            <div class="card-time">
                {{ timeRange }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import type { Order, Reservation } from "@/interfaces/RestaurantResponse";
import { getTimeRange } from "@/utils/formatTime";
import type { LayoutMeta } from "@/interfaces/tableLayout";

const props = defineProps<{
    type: "order" | "banquet" | "reservation" | "queue";
    order: Order | Reservation;
    timeZone: string;
    meta: LayoutMeta;
}>();

const ordersStatus = {
    New: { label: "Новый", className: "new" },
    Bill: { label: "Пречек", className: "bill" },
    Closed: { label: "Закрытый", className: "closed" },
    Banquet: { label: "Банкет", className: "banquet" },
} as const;

const reservationStatus = {
    "Живая очередь": { className: "queue", label: "Живая очередь" },
    Новая: { label: "Ожидает подтверждения", className: "reservation-new" },
    Заявка: { label: "Ожидаем", className: "bid" },
    Открыт: { label: "В зале", className: "opened" },
    Закрыт: { label: "Отменен", className: "closed" },
} as const;

const isOrder = props.type === "order" || props.type === "banquet";
const isBanquet = props.type === "banquet";
const reservation = props.order as Reservation;

const isReservation = (order: Order | Reservation): order is Reservation => {
    return "seating_time" in order;
};

const statusKey = computed(() => {
    if (isReservation(props.order)) {
        return reservationStatus[props.order.status];
    }
    return ordersStatus[props.order.status];
});

const timeRange = computed(() => {
    const startTime = isOrder
        ? (props.order as Order).start_time
        : (props.order as Reservation).seating_time;
    return getTimeRange(startTime, props.order.end_time, props.timeZone);
});

const contentRef = useTemplateRef<HTMLElement>("contentRef");
const realContentHeight = ref(0);

const isClipped = computed(() => {
    if (!contentRef.value) return;
    if (!props.meta.availableContentHeight) return false;
    return props.meta.availableContentHeight < contentRef.value.offsetHeight;
});

onMounted(() => {
    if (!contentRef.value || !props.meta.availableContentHeight) return;

    for (let i = 0; i < contentRef.value.children.length; i++) {
        const cardElemnt = contentRef.value.children[i] as HTMLElement;

        const bottomElement = cardElemnt.offsetTop + cardElemnt.offsetHeight;

        if (bottomElement < props.meta.availableContentHeight) {
            realContentHeight.value = bottomElement;
        }
    }
});
</script>

<style scoped lang="scss">
.table-card {
    --accent: var(--status-order);
    --card-bg: var(--status-order-bg);
    --after-color: var(--status-order-bg-solid);

    position: absolute;
    top: var(--top);
    left: var(--leftOffset);
    width: var(--width);
    height: var(--height);
    z-index: var(--zIndex);
    display: inline-flex;
    flex-direction: column;
    max-width: var(--table-column-width);
    padding: var(--space-2xs) var(--space-2xs) var(--space-2xs) var(--space-sm);
    overflow: hidden;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-secondary);
    border-left: 2px solid var(--accent);
    background: var(--card-bg);
    font-family: var(--font-family);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    white-space: nowrap;
    cursor: pointer;
    transition: var(--transition-card);

    &--banquet {
        --accent: var(--status-banquet);
        --card-bg: var(--status-banquet-bg);
        --after-color: var(--status-banquet-bg-solid);
    }

    &--queue {
        --accent: var(--status-queue);
        --card-bg: var(--status-queue-bg);
        --after-color: var(--status-queue-bg-solid);
    }

    &--reservation {
        --accent: var(--status-reservation);
        --card-bg: var(--status-reservation-bg);
        --after-color: var(--status-reservation-bg-solid);
    }

    &:hover {
        z-index: var(--z-hover);

        backdrop-filter: blur(var(--blur-card-hover));

        width: max-content;
        min-width: 100%;

        .card-content--clipped {
            height: var(--height);

            &::after {
                opacity: 0;
                visibility: hidden;
            }
        }
    }
}

.card-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: fit-content;

    &--clipped {
        position: relative;
        overflow: hidden;
        height: var(--contentHeight);
        transition: height 0.2s ease;

        &::after {
            content: "...";
            position: absolute;
            right: 0;
            bottom: 0;
            pointer-events: none;
            font-size: var(--font-size-xs);
            font-weight: var(--font-weight-semibold);
            line-height: var(--line-height-normal);
            color: var(--color-text-primary);
            background: var(--after-color);
        }
    }
}

.card {
    &-header {
        display: flex;
        flex-direction: column;
    }

    &-label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);

        color: var(--color-text-primary);
    }

    &-number {
        font-size: var(--font-size-2xs);
        font-weight: var(--font-weight-regular);
        line-height: var(--line-height-tight);

        color: var(--color-text-primary);
    }

    &-name {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-normal);

        color: var(--color-text-primary);
    }

    &-guests {
        span {
            font-weight: var(--font-weight-regular);
        }
    }

    &-phone {
        display: flex;
        align-items: center;

        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-regular);
        line-height: var(--line-height-normal);

        color: var(--color-text-primary);

        .phone-icon {
            display: flex;
            align-items: center;
            svg path {
                stroke: var(--color-icon);
            }
        }
    }

    &-time {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-regular);
        line-height: var(--line-height-normal);

        color: var(--color-text-primary);
    }

    &-status-badge {
        display: inline-block;

        width: fit-content;

        padding: var(--space-2xs);

        border-radius: var(--radius-xs);

        font-size: var(--font-size-2xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--line-height-tight);

        color: var(--color-text-primary);

        &.badge {
            &--new,
            &--closed,
            &--queue {
                background: var(--badge-bg-default);
            }

            &--bill,
            &--open {
                background: var(--badge-bg-success);
            }

            &--bid {
                background: var(--badge-bg-info);
                color: var(--badge-text-info);
            }

            &--reservation-new {
                background: var(--color-accent-primary);
                color: var(--color-text-active);
            }
        }
    }
}
</style>
