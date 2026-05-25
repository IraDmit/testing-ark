export const useBookingData = async()=>{
    const data = await import '/public/restaurant-data.json';

    return data
}