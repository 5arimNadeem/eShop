import React from 'react'
import AdminHeader from '../../components/Admin/Layout/AdminHeader.jsx'
import AdminSideBar from '../../components/Admin/Layout/AdminSideBar.jsx'
import AllUsers from '../../components/Admin/AllUsers.jsx'

const AdminDashboardUsers = () => {
    return (
        <div>
            <AdminHeader />
            <div className="flex justify-between w-full">
                <div className="w-[80px] 800px:w-[330px]">
                    <AdminSideBar active={1} />
                </div>
                <div className="w-full justify-center flex">
                    <AllUsers />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardUsers
