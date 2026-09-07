import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post(`${server}/user/login-admin`, {
            email,
            password,
        }, { withCredentials: true }).then(() => {
            toast.success("Welcome back, admin");
            navigate("/admin/users");
            window.location.reload(true);
        }).catch((err) => {
            toast.error(err?.response?.data?.message || "there was the error");
        })
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="border sm:mx-auto sm:w-full sm:max-w-md rounded-xl">
                <div className={`${styles.noramlFlex} justify-center mt-6`}>
                    <MdOutlineAdminPanelSettings size={34} className="text-blue-600" />
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Admin Console
                </h2>
                <p className="mt-1 text-center text-sm text-gray-500">
                    Restricted to platform administrators
                </p>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="py-3 px-4 shodow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        type={visible ? "text" : "password"}
                                        name="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    {visible ? (
                                        <AiOutlineEye
                                            className="absolute right-2 top-2 cursor-pointer"
                                            size={25}
                                            onClick={() => setVisible(false)}
                                        />
                                    ) : (
                                        <AiOutlineEyeInvisible
                                            className="absolute right-2 top-2 cursor-pointer"
                                            size={25}
                                            onClick={() => setVisible(true)}
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                            <div className={`${styles.noramlFlex} text-[14px] w-full`}>
                                <h4>Not an administrator?</h4>
                                <Link to="/login" className="text-blue-600 font-semibold pl-2">
                                    Customer Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
