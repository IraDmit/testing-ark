export const useBookingData = async <T>(): Promise<T> => {
    const res = await fetch("/restaurant-data.json");
    return res.json() as T;
};
