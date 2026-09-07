import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader.jsx'
import AdminSideBar from '../../components/Admin/Layout/AdminSideBar.jsx'
import AllSellers from '../../components/Admin/AllSellers.jsx'

const AdminDashboardSellers = () => {
    return (
        <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[80px] 800px:w-[330px]">
                    <AdminSideBar active={2} />
                </div>
                <div className="w-full justify-center flex">
                    <AllSellers />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardSellers
