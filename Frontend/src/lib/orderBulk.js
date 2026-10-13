// Bulk order actions process each order separately; the response lists the
// ones that failed and why. Tell the user, and return the failed ids so they
// stay selected for another try.
export const reportBulkResult = (result) => {
    const failed = result?.failed || [];
    if (failed.length > 0) {
        window.alert(`${result.message}\n\n${failed.map((f) => `#${f.orderId}: ${f.message}`).join("\n")}`);
    }
    return new Set(failed.map((f) => f.orderId));
};
