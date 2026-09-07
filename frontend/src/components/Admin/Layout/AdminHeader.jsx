import React from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { FiShoppingBag } from "react-icons/fi";
import { AiOutlineLogout } from "react-icons/ai";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../../server";
import { getImageUrl } from "../../../utils/imageUtils";

const AdminHeader = () => {
    const { user } = useSelector((state) => state.user);

    const handleLogout = async () => {
        await axios
            .post(`${server}/user/logout`, {}, { withCredentials: true })
            .then(() => {
                toast.success("Logged out successfully");
                window.location.href = "/admin-login";
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || "Logout failed");
            });
    };

    return (
        <div className="w-full h-[80px] bg-white shadow-lg border-b border-gray-100 sticky top-0 left-0 z-30 flex items-center justify-between px-6">
            {/* Left side - Logo */}
            <div className="flex items-center">
                <Link to="/admin/users" className="flex items-center hover:opacity-80 transition-opacity">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            E<span className="text-blue-600">Shop</span>
                        </h1>
                    </div>
                </Link>
                <div className="ml-6 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Admin Dashboard
                </div>
            </div>

            {/* Right side - Navigation and Profile */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                    <Link to="/admin/users" className="800px:block hidden">
                        <div className="p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                            <HiOutlineUserGroup
                                size={24}
                                className="text-gray-600 group-hover:text-blue-600 transition-colors"
                            />
                        </div>
                    </Link>
                    <Link to="/admin/sellers" className="800px:block hidden">
                        <div className="p-3 rounded-lg hover:bg-blue-50 transition-colors group">
                            <FiShoppingBag
                                size={24}
                                className="text-gray-600 group-hover:text-blue-600 transition-colors"
                            />
                        </div>
                    </Link>
                    <button onClick={handleLogout} title="Log out">
                        <div className="p-3 rounded-lg hover:bg-red-50 transition-colors group">
                            <AiOutlineLogout
                                size={24}
                                className="text-gray-600 group-hover:text-red-600 transition-colors"
                            />
                        </div>
                    </button>
                </div>

                <div className="ml-4 pl-4 border-l border-gray-200">
                    <div className="flex items-center space-x-3 rounded-lg p-2">
                        <img
                            src={getImageUrl(user?.avatar)}
                            alt="Admin Avatar"
                            className="w-[45px] h-[45px] rounded-full object-cover border-2 border-blue-200"
                        />
                        <div className="hidden 800px:block">
                            <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
                            <div className="text-xs text-gray-500">{user?.role}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
