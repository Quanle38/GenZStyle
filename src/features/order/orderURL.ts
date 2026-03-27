export const orderURL = {
    GET_ALL:            "/order",
    GET_STATISTICS:     "/order/statistics",
    GET_DATE_RANGE:     "/order/date-range",
    GET_BY_STATUS:      "/order/status",
    GET_BY_ID:          "/order",        // Sẽ nối + /id
    GET_ITEMS:          "/order",        // Sẽ nối + /id/items
    CREATE:             "/order",
    UPDATE_STATUS:      "/order",        // Sẽ nối + /id/status
    CANCEL:             "/order",        // Sẽ nối + /id/cancel
    DELETE:             "/order",        // Sẽ nối + /id
} as const;