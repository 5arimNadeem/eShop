import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux";
import Loader from '../components/Layout/Loader.jsx';

const SellerProtectedRoute = ({ children }) => {
  const { isSeller, loading: isLoading } = useSelector((state) => state.seller);

  if (isLoading === true) {
    return <Loader />;
  }

  if (!isSeller) {
    return <Navigate to={`/shop-login`} replace />;
  }

  return children;
};

export default SellerProtectedRoute;