import React, { useState } from "react";
import { DollarSign, AlertCircle, Loader } from "lucide-react";
import apiClient from "../../api/apiClient";
import { toast } from "react-hot-toast";

export default function TopupPage() {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [loading, setLoading] = useState(false);

  const predefinedAmounts = [20, 50, 100, 250, 500];

  const handleTopup = async () => {
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/api/v1/payments/topup/create-session", { amount });
      if (response.data?.data?.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        toast.error("Could not retrieve checkout session.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <DollarSign className="text-green-600" /> Top Up Real Money
      </h2>
      <p className="text-gray-500 mb-6">
        Top up your account balance to bid on exclusive live auctions. 
        Your balance is securely stored and instantly available for bidding.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {predefinedAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
            className={`py-3 rounded-xl border-2 font-semibold transition-all ${selectedAmount === amt && !customAmount ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            ${amt}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount ($)</label>
        <input
          type="number"
          min="1"
          placeholder="e.g. 75"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            if (e.target.value) setSelectedAmount(0);
          }}
          className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
        />
      </div>

      <button
        onClick={handleTopup}
        disabled={loading}
        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? <Loader className="animate-spin" /> : "Proceed to Payment"}
      </button>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 justify-center">
        <AlertCircle size={16} /> <span>Payments are securely processed via Stripe.</span>
      </div>
    </div>
  );
}
