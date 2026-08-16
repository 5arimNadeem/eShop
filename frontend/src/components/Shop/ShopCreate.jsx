import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { server } from '../../server';
import { toast } from 'react-toastify';
import { RxAvatar } from 'react-icons/rx';


const ShopCreate = () => {
    const [email, setEmail] = useState("");
    // useState for name, phonenumber, address, zipCode
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState();
    const [address, setAddress] = useState("");
    const [zipCode, setZipCode] = useState();
    // for avatar state
    const [avatar, setAvatar] = useState();
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = { headers: { "Content-Type": "multipart/form-data" } };

        // Create FormData for file upload
        const formData = new FormData();

        formData.append("file", avatar);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("zipCode", zipCode);
        formData.append("address", address);
        formData.append("phoneNumber", phoneNumber);

        await axios.post(
            `${server}/shop/create-shop`,
            formData, config
        ).then((res) => {
            toast.success(res?.data?.message)
            setName("");
            setEmail("");
            setPassword("");
            setAvatar(null);
            setZipCode("");
            setAddress("");
            setPhoneNumber("");
            navigate("/shop-login");
        }).catch((error) => {
            const errorMessage =
                error.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
        })
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="border sm:mx-auto sm:w-full sm:max-w-md rounded-xl">
                {/* <div className=""> */}
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                    Register as a Seller
                </h2>
                {/* </div> */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="py-3 px-4 shodow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Shop Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="name"
                                        name="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Shop Phone Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        name="phone_number"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

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
                                    htmlFor="address"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="address"
                                        name="address"
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="zipcode"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Zip Code
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        name="zipcode"
                                        required
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
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
                                <label
                                    htmlFor="avatar"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Avatar
                                </label>
                                <div className="mt-2 flex items-center">
                                    {/* Avatar preview */}
                                    <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                                        {avatar ? (
                                            <img src={URL.createObjectURL(avatar)} alt="avatar" className='h-full w-full object-cover rounded-full' />
                                        ) : (

                                            <RxAvatar className="h-8 w-8" />
                                        )}
                                    </span>
                                    {/* File input for avatar */}
                                    <label
                                        htmlFor="file-input"
                                        className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                    >
                                        <span>Upload a file</span>
                                        <input
                                            type="file"
                                            name="avatar"
                                            id="file-input"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={handleFileInputChange}
                                            className="sr-only"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    // disabled={loading}
                                    className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                // 'bg-gray-400 cursor-not-allowed'

                                >
                                    {/* {loading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </div>
                                    ) : ( */}
                                    Submit
                                    {/* )} */}
                                </button>
                            </div>
                            <div className={`${styles.noramlFlex} text-[14px] w-full`}>
                                <h4>Already have an account?</h4>
                                <Link to="/shop-login" className="text-blue-600 font-semibold pl-2">
                                    Shop Login
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopCreate


