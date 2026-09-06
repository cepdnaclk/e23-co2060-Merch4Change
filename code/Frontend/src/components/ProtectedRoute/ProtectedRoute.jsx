import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/Context"; 
import LoadingScreen from "../LoadingScreen/LoadingScreen";

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!accessToken) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export default ProtectedRoute;
