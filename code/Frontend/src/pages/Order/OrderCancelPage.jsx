import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { AlertCircle, ShoppingBag, RefreshCw } from "lucide-react";

export default function OrderCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your transaction was not completed. No charges were made to your account.
          </p>
        </div>

        {orderId && (
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 text-xs text-gray-500 dark:text-gray-400">
            Order Reference: <span className="font-mono text-gray-700 dark:text-gray-300">#{orderId.slice(-8).toUpperCase()}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Link
            to="/marketplace"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again / Browse Merch
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Back to Product
          </button>
        </div>
      </div>
    </div>
  );
}
