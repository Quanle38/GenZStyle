export const formatDate = (day: string) => {
    const date = new Date(day);

    const formatted = `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
    return formatted;
}