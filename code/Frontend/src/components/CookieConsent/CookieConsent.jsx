import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("merch4change_cookie_consent");
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("merch4change_cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("merch4change_cookie_consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-transform transform translate-y-0 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🍪</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              We Value Your Privacy
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            We use cookies to ensure you get the best experience on Merch4Change. 
            Essential cookies are necessary for the platform to function securely (such as keeping you logged in). 
            We also use optional cookies to analyze traffic, enhance platform features, and personalize content. 
            By clicking "Accept All", you consent to our use of cookies. 
            Read our <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link> for more information.
          </p>
        </div>
        
        <div className="flex flex-row md:flex-col lg:flex-row gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
          >
            Decline Optional
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 outline-none"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
