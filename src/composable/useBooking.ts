import { CELL_MINUTES } from "@/constants";
import type { Table } from "@/interfaces/RestaurantResponse";
import { getColumnOffsetLeft } from "@/utils/bookingHelpers";
import { ref, type ComputedRef, type Ref } from "vue";

export const useBooking = (
    filteredTables: ComputedRef<Table[]>,
    CELL_TABLE_ITEM_HEIGHT: Ref<number>,
    CELL_TIME_ITEM_WIDTH: Ref<number>,
) => {
    const isSelecting = ref(false);

    const newOrder = ref({
        x: 0,
        y: 0,
        tables: new Map([]) as Map<string, Pick<Table, "capacity" | "number">>,

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
        const tableId = target.getAttribute("data-table-id");
        const tableNumber = target.getAttribute("data-table-number");
        const tableCapacity = target.getAttribute("data-table-capacity");
        const leftOffset = target.getAttribute("data-left-offset");

        if (!time || !tableNumber || !tableId) return;

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
            [tableId, { capacity: Number(tableCapacity), number: tableNumber }],
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
                    table.id,
                    { number: table.number, capacity: table.capacity },
                ]),
        );
        const startTime = Math.min(time, startPos.value.start_time);
        const endTime =
            Math.max(time, startPos.value.start_time) + CELL_MINUTES;

        newOrder.value.time = { start: startTime, end: endTime };

        newOrder.value.x = getColumnOffsetLeft(
            minIdx,
            CELL_TIME_ITEM_WIDTH.value,
        );

        const yPos = target.offsetTop + CELL_TIME_ITEM_WIDTH.value;
        newOrder.value.y = Math.min(startPos.value.y, yPos);
    };

    const onMouseUp = () => {
        isSelecting.value = false;
    };
    return {
        isSelecting,
        newOrder,
        isShowNewCard,
        onMouseDown,
        onMouseMove,
        onMouseUp,
    };
};
