import { CELL_OFFSET, CELL_WIDTH, MINUTE_PX } from "@/constants";
import type { Order, Reservation } from "@/interfaces/RestaurantResponse";
import type { LayoutMeta, Zones } from "@/interfaces/tableLayout";
import { toMinutes } from "@/utils/formatTime";

interface EventItem {
    id: string;
    type: "order" | "banquet" | "reservation" | "queue";
    startMin: number;
    endMin: number;
    duration: number;
    top: number;
    contentHeight?: number;
    raw: Order | Reservation;
}

const calculateWidth = (stackIdx: number, countOfItems: number) => {
    return (CELL_WIDTH - stackIdx * CELL_OFFSET) / countOfItems;
};

const toDateInTZ = (dateStr: string, timeZone: string): string =>
    new Date(dateStr).toLocaleDateString("en-CA", { timeZone });

export const useTableLayout = () => {
    const prepareTableData = (
        orders: Order[] = [],
        reservations: Reservation[] = [],
        openingMinutes: number,
        selectDateStr: string,
        timeZone: string,
    ): {
        meta: LayoutMeta;
        raw: Order | Reservation;
        type: EventItem["type"];
    }[] => {
        const items: EventItem[] = [];

        const targetDate = toDateInTZ(selectDateStr, timeZone);

        for (const order of orders) {
            const start = toMinutes(order.start_time, timeZone);
            const end = toMinutes(order.end_time, timeZone);

            if (toDateInTZ(order.start_time, timeZone) !== targetDate) continue;

            items.push({
                id: order.id,
                type: order.status === "Banquet" ? "banquet" : "order",
                startMin: start,
                endMin: end,
                duration: end - start,
                top: MINUTE_PX * (start - openingMinutes),
                raw: order,
                contentHeight: 0,
            });
        }
        for (const reservation of reservations) {
            const start = toMinutes(reservation.seating_time, timeZone);
            const end = toMinutes(reservation.end_time, timeZone);

            if (toDateInTZ(reservation.seating_time, timeZone) !== targetDate)
                continue;

            items.push({
                id: reservation.id.toString(),
                type:
                    reservation.status === "Живая очередь"
                        ? "queue"
                        : "reservation",
                startMin: start,
                endMin: end,
                duration: end - start,
                top: MINUTE_PX * (start - openingMinutes),
                raw: reservation,
                contentHeight: 0,
            });
        }

        if (!items.length) return [];

        items.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

        const linkedGroups: EventItem[][] = [];

        const firstItem = items[0]!;
        let current: EventItem[] = [firstItem];

        let groupEnd = firstItem.endMin;

        for (let i = 1; i < items.length; i++) {
            const item = items[i]!;
            if (item.startMin < groupEnd) {
                current.push(item);
                if (item?.endMin > groupEnd) {
                    groupEnd = item?.endMin;
                }
            } else {
                linkedGroups.push(current);
                current = [item];
                groupEnd = item?.endMin;
            }
        }

        linkedGroups.push(current);

        const result: {
            meta: LayoutMeta;
            raw: Order | Reservation;
            type: EventItem["type"];
        }[] = [];

        linkedGroups.forEach((group) => {
            const sortedGroup = group.sort(
                (a, b) => a.startMin - b.startMin || a.duration - b.duration,
            );

            const groupStacks = sortedGroup.reduce<EventItem[][]>(
                (result, item, idx) => {
                    const lastStack = result[result.length - 1];
                    const lastItem = lastStack?.[lastStack.length - 1];

                    if (lastItem && item.startMin - lastItem.startMin < 30) {
                        lastStack!.push(item);
                    } else {
                        result.push([item]);
                    }

                    return result;
                },
                [],
            );
            groupStacks.forEach((stack, stackIdx) => {
                const nextStack = groupStacks[stackIdx + 1];

                stack.forEach((item, idx) => {
                    if (nextStack && nextStack[idx] && stack[idx]) {
                        stack[idx]!.contentHeight =
                            nextStack[idx]!.top - stack[idx]!.top;
                    }

                    const width = calculateWidth(stackIdx, stack.length);

                    result.push({
                        meta: {
                            zIndex: stackIdx + 1,
                            width,
                            leftOffset: stackIdx * CELL_OFFSET + idx * width,

                            startMin: item.startMin,
                            endMin: item.endMin,
                            duration: item.duration,
                            height: MINUTE_PX * item.duration,
                            top: item.top,
                            availableContentHeight: item.contentHeight || null,
                        },
                        raw: item.raw,
                        type: item.type,
                    });
                });
            });
        });

        return result;
    };
    return { prepareTableData };
};
