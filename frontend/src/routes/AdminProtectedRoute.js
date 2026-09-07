import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from '../components/Layout/Loader.jsx';

// Admins share the `user` slice, since an admin is a User document with
// role: "Admin" authenticated by the same `token` cookie.
const AdminProtectedRoute = ({ children }) => {
    const { loading, isAuthenticated, user } = useSelector((state) => state.user)

    if (loading === true || loading === undefined) {
        return <Loader />;
    }

    if (!isAuthenticated || user?.role !== "Admin") {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
}

export default AdminProtectedRoute
