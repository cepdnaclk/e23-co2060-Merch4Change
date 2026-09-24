import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag, ArrowRight, Coins, Loader2 } from "lucide-react";
import apiClient from "../../api/apiClient";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (sessionId) {
          const res = await apiClient.get(`/api/v1/payments/verify-session/${sessionId}`);
          if (res.data?.success) {
            setOrderData(res.data.data.order);
            setLoading(false);
            return;
          }
        }

        if (orderId) {
          const res = await apiClient.get(`/api/v1/marketplace/orders/${orderId}`);
          if (res.data?.success) {
            setOrderData(res.data.data.order);
            setLoading(false);
            return;
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order confirmation:", err);
        setError("Could not load latest order details, but your payment was received.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, orderId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Successful!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you for supporting sustainable merchandise and charitable causes.
          </p>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <span className="text-xs">Confirming your transaction...</span>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 text-left space-y-3 text-sm">
            {orderData?._id && (
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
                <span>Order Reference</span>
                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                  #{orderData._id.toString().slice(-8).toUpperCase()}
                </span>
              </div>
            )}

            {orderData?.totalAmount !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Amount Paid</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${Number(orderData.totalAmount).toFixed(2)}
                </span>
              </div>
            )}

            {orderData?.coinsEarned > 0 && (
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  MerchCoins Earned
                </span>
                <span>+{orderData.coinsEarned} Coins</span>
              </div>
            )}

            {orderData?.items?.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                <span className="text-xs text-gray-400 uppercase font-semibold">Items</span>
                {orderData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="truncate max-w-[200px]">{item.titleSnapshot} (x{item.quantity})</span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-3 pt-2">
          <Link
            to="/marketplace"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <button
            onClick={() => navigate("/home")}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm transition-all"
          >
            Go to Home Feed
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
