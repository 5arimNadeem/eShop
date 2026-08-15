// we need to make the profile route protected 

import { Navigate } from "react-router-dom";

const protectedRoute = ({ isAuthenticated, children }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    return children;
}

export default protectedRoute