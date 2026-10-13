// The message the backend sent with a failed request, or a fallback.
export const apiErrorMessage = (error, fallback = "Something went wrong, please try again") =>
    error?.response?.data?.message || fallback;
