import { useState } from "react";
import { Notification } from "../../types/notification";
import { useTheme } from "../../context/ThemeContext";

type FilterType = "all" | "new_products" | "bets";

interface NotificationDropDownProps {
    notifications: Notification[];
    onMarkAsRead?: (id: string) => void;
    containerClassName?: string;
}

function NotificationDropDown({ notifications, onMarkAsRead, containerClassName }: NotificationDropDownProps): JSX.Element {
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const { resolvedTheme } = useTheme();
    
    const handleFilter = (value: FilterType) => {
        setActiveFilter(value);
    };

    const filtered = notifications.filter((n) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "new_products") return n.type === "product";
        if (activeFilter === "bets") return n.type === "bet";
        return true;
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const activeBtn = "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 font-medium rounded-full px-3 py-1 text-sm border-none cursor-pointer transition-colors";
    const inactiveBtn = "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-[#232329] dark:text-gray-400 dark:hover:bg-[#2c2c33] rounded-full px-3 py-1 text-sm border-none cursor-pointer transition-colors";

    return (
        <div 
            data-theme={resolvedTheme}
            className={`notification-dropdown-box bg-white dark:bg-[#1b1b1f] text-gray-900 dark:text-[#f2f2f4] rounded-xl shadow-2xl border border-gray-100 dark:border-[#2c2c33] w-80 p-4 transition-colors duration-200 ${containerClassName ? containerClassName.replace(/\bbg-white\b/g, "bg-white dark:bg-[#1b1b1f]") : ""}`}
            style={{
                backgroundColor: resolvedTheme === "dark" ? "#1b1b1f" : undefined,
                color: resolvedTheme === "dark" ? "#f2f2f4" : undefined,
                borderColor: resolvedTheme === "dark" ? "#2c2c33" : undefined,
            }}
        >
            <div className="border-b border-gray-100 dark:border-[#2c2c33] pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-[#f2f2f4] m-0">Notifications</h3>
            </div>
            
            <div className="flex gap-2 py-3">
                <button type="button" onClick={() => handleFilter("all")} className={activeFilter === "all" ? activeBtn : inactiveBtn}>All</button>
                <button type="button" onClick={() => handleFilter("new_products")} className={activeFilter === "new_products" ? activeBtn : inactiveBtn}>New products</button>
                <button type="button" onClick={() => handleFilter("bets")} className={activeFilter === "bets" ? activeBtn : inactiveBtn}>Bets</button>
            </div>

            <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto">
                {filtered.length > 0 ? (
                    filtered.map((notification) => (
                        <div 
                            className="p-3 rounded-lg cursor-pointer bg-transparent hover:bg-gray-50 dark:hover:bg-[#232329] border border-transparent dark:hover:border-[#2c2c33] transition-colors"
                            key={notification.id}
                            onClick={() => !notification.isRead && onMarkAsRead?.(notification.id)}    
                        >
                            <div className="flex items-center gap-2">
                                {!notification.isRead ? (
                                    <span className="bg-purple-600 dark:bg-purple-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                        New
                                    </span>
                                ) : null}
                                <p className="text-sm text-gray-800 dark:text-gray-200 m-0 leading-snug">{notification.message}</p>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 m-0">{formatDate(notification.createdAt)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6 m-0">
                        No {activeFilter !== "all" ? activeFilter.replace("_", " ") : ""} notifications yet.
                    </p>
                )}
            </div>
        </div>
    );
}

export default NotificationDropDown;