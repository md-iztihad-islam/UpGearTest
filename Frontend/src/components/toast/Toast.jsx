import { useState } from "react";

function Toast() {
    const [toast, setToast] = useState(null);

    window.showToast = (message, type = "info") => {
        setToast({ message, type });

        setTimeout(() => setToast(null), 3000);
    };

    if (!toast) return null;

    return (
        <div className="toast toast-top toast-end">
            <div className={`alert alert-${toast.type}`}>
                <span>{toast.message}</span>
            </div>
        </div>
    );
}

export default Toast;