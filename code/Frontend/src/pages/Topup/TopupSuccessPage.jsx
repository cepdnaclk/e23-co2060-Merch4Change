import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader } from "lucide-react";

export default function TopupSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  
  useEffect(() => {
    // Wait briefly then redirect to marketplace
    const timer = setTimeout(() => {
      navigate("/marketplace");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
      <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
      <p className="text-gray-500 mb-6">Your balance has been updated successfully.</p>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader size={16} className="animate-spin" /> Redirecting to marketplace...
      </div>
    </div>
  );
}
