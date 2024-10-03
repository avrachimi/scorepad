export const getDayWithSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th"; // for 11th to 19th
    switch (day % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
};

export const formatName = (name: string) => {
    const firstName = name.split(" ")[0];
    if (firstName.length > 10) return firstName.slice(0, 10) + "...";

    const lastName = name.split(" ")[1];
    return firstName + (lastName ? ` ${lastName[0]}.` : "");
};

export const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes} mins`;
    if (remainingMinutes === 0) return `${hours} hours`;

    return `${hours}h ${remainingMinutes}m`;
};
