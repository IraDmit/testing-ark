import { CELL_WIDTH } from "@/constants";

export const getColumnOffsetLeft = (
    idx: number,
    CELL_TIME_ITEM_WIDTH: number,
) => {
    return CELL_TIME_ITEM_WIDTH + idx * CELL_WIDTH;
};
