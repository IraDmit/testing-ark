const format = (date: string, timezone: string) => {
    return new Intl.DateTimeFormat("ru-RU", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
        .format(new Date(date))
        .replace(":", ".");
};

export const toMinutes = (time: string, timeZone?: string): number => {
    const trimmed = time.trim();

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        const [hours = "0", minutes = "0"] = trimmed.split(":");
        return Number(hours) * 60 + Number(minutes);
    }

    const date = new Date(trimmed);
    if (isNaN(date.getTime())) {
        throw new Error(`Неправильный формат времени: "${time}"`);
    }

    if (timeZone) {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hour: "numeric",
            minute: "numeric",
            hour12: false,
        }).formatToParts(date);

        const hours = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
        const minutes = Number(
            parts.find((p) => p.type === "minute")?.value ?? 0,
        );

        return hours * 60 + minutes;
    }

    return date.getHours() * 60 + date.getMinutes();
};

export const getTimeRange = (
    start: string,
    end: string,
    timezone: string,
): string => {
    return `${format(start, timezone)} - ${format(end, timezone)}`;
};
