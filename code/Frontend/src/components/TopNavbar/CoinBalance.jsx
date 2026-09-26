import React, { useEffect, useState, useRef } from "react";
import { Coins, DollarSign, ChevronDown } from "lucide-react";
import apiClient from "../../api/apiClient";

export default function CoinBalance() {
  const [coinBalance, setCoinBalance] = useState(0);
  const [fiatBalance, setFiatBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState("coin"); // 'coin' or 'fiat'
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await apiClient.get(`/api/v1/profile/me`);
        const user = response.data?.data?.user;
        if (user) {
          setCoinBalance(user.coinBalance || 0);
          setFiatBalance(user.fiatBalance || 0);
        }
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="lum-coin-balance-wrapper relative" ref={popupRef}>
      <button 
        className="lum-coin-balance flex items-center gap-2 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full cursor-pointer transition-colors"
        onClick={() => setShowPopup(!showPopup)}
      >
        {displayMode === "coin" ? (
          <Coins size={18} className="text-yellow-500" />
        ) : (
          <DollarSign size={18} className="text-green-600" />
        )}
        <span className="lum-coin-value font-semibold text-gray-800">
          {loading ? "..." : (displayMode === "coin" ? coinBalance.toLocaleString() : `$${fiatBalance.toLocaleString()}`)}
        </span>
        <ChevronDown size={14} className="text-gray-500 ml-1" />
      </button>

      {showPopup && (
        <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-xl border border-gray-100 w-48 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Select Balance Display
          </div>
          <button 
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${displayMode === 'coin' ? 'bg-gray-50/50' : ''}`}
            onClick={() => { setDisplayMode("coin"); setShowPopup(false); }}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Coins size={16} className="text-yellow-500" />
              System Coins
            </div>
            <span className="text-sm text-gray-500">{coinBalance.toLocaleString()}</span>
          </button>
          <button 
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${displayMode === 'fiat' ? 'bg-gray-50/50' : ''}`}
            onClick={() => { setDisplayMode("fiat"); setShowPopup(false); }}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign size={16} className="text-green-600" />
              Real Money
            </div>
            <span className="text-sm text-gray-500">${fiatBalance.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}
