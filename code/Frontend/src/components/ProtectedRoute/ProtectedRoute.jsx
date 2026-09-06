import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/Context"; 
import LoadingScreen from "../LoadingScreen/LoadingScreen";

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();
  const [isLoaderMounted, setIsLoaderMounted] = useState(loading);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!loading && isLoaderMounted) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsLoaderMounted(false);
        setIsExiting(false);
      }, 350);
      return () => clearTimeout(timer);
    } else if (loading) {
      setIsLoaderMounted(true);
      setIsExiting(false);
    }
  }, [loading, isLoaderMounted]);

  if (isLoaderMounted) {
    if (!accessToken && !loading) {
      return <Navigate to="/login" replace />;
    }
    return (
      <>
        {accessToken && children}
        <LoadingScreen variant="skeleton" isExiting={isExiting} />
      </>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
