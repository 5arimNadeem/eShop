// we need to make the profile route protected 

import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from '../components/Layout/Loader.jsx';

const ProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated } = useSelector((state) => state.user)

    if (loading === true || loading === undefined) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute   