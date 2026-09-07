import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminLogin from '../components/Admin/AdminLogin.jsx'

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.user);

    useEffect(() => {
        if (isAuthenticated && user?.role === "Admin") {
            navigate("/admin/users");
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div>
            <AdminLogin />
        </div>
    )
}

export default AdminLoginPage
