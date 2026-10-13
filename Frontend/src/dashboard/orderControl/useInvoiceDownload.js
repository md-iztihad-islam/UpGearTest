import { useMutation } from "@tanstack/react-query";
import downloadInvoicesApi from "@/services/dashboard/order/downloadInvoicesApi";
import { apiErrorMessage } from "@/lib/apiError";

// download(orderIds) saves the invoice PDF; isDownloading / downloadingIds
// let buttons show a spinner.
export default function useInvoiceDownload() {
    const { mutate, isPending, variables } = useMutation({
        mutationFn: (orderIds) => downloadInvoicesApi(orderIds),
        onError: (error) => window.alert(apiErrorMessage(error, "Couldn't generate the invoice, please try again")),
    });

    return {
        download: (orderIds) => {
            const ids = Array.isArray(orderIds) ? orderIds : [orderIds];
            if (ids.length > 0) mutate(ids);
        },
        isDownloading: isPending,
        downloadingIds: isPending ? variables || [] : [],
    };
}
