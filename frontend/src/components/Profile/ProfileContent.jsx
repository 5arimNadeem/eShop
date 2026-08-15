// component creation 
import React, { useState } from 'react'
import { backendUrl } from '../../server'
import { useSelector } from 'react-redux'
import { AiOutlineArrowRight, AiOutlineCamera, AiOutlineDelete } from 'react-icons/ai';
import styles from '../../styles/styles';
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { Link } from 'react-router-dom';
import { MdOutlineTrackChanges } from 'react-icons/md';


const ProfileContent = ({ active }) => {
    const { user } = useSelector((state) => state.user);
    const [name, setName] = useState(user && user.name);
    const [email, setEmail] = useState(user && user.email);
    const [zipCode, setZipCode] = useState();
    const [phoneNumber, setPhoneNumber] = useState();
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(name, email, phoneNumber, zipCode, address1, address2);
    }

    return (
        <div className='w-full min-w-0'>
            {
                // profile page
                active === 1 && (
                    <>
                        {/* Avatar */}
                        <div className="w-full flex flex-col items-center">
                            <div className="relative">
                                <img
                                    src={`${backendUrl}${user?.avatar}`}
                                    alt=""
                                    className="w-[120px] h-[120px] 800px:w-[150px] 800px:h-[150px] rounded-full border-[3px] border-blue-500 object-cover hover:border-blue-300 transition-all"
                                />
                                <div className='w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px] shadow'>
                                    <AiOutlineCamera
                                        size={20}
                                        className="cursor-pointer"
                                        color="blue"
                                        title="Change Profile Picture"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="w-full px-2 800px:px-5 mt-4">
                            <form onSubmit={handleSubmit} className="w-full">
                                {/* Row 1: Name + Email */}
                                <div className="flex flex-col 800px:flex-row gap-4 pb-4">
                                    <div className="w-full 800px:w-1/2">
                                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="name">Full Name</label>
                                        <input
                                            id="name"
                                            className={`${styles.input} w-full border border-gray-300 rounded-md shadow-sm p-2`}
                                            type="text"
                                            placeholder={user?.name}
                                            required
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full 800px:w-1/2">
                                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="email">Email</label>
                                        <input
                                            id="email"
                                            className={`${styles.input} w-full border border-gray-300 rounded-md shadow-sm p-2`}
                                            type="email"
                                            placeholder={user?.email}
                                            required
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Phone + Zip */}
                                <div className="flex flex-col 800px:flex-row gap-4 pb-4">
                                    <div className="w-full 800px:w-1/2">
                                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="phoneNumber">Phone Number</label>
                                        <input
                                            id="phoneNumber"
                                            className={`${styles.input} w-full border border-gray-300 rounded-md shadow-sm p-2`}
                                            type="tel"
                                            placeholder={user?.phoneNumber}
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full 800px:w-1/2">
                                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="zipCode">Zip Code</label>
                                        <input
                                            id="zipCode"
                                            className={`${styles.input} w-full border border-gray-300 rounded-md shadow-sm p-2`}
                                            type="text"
                                            placeholder={user?.zipCode}
                                            required
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Address 1 + Address 2 */}
                                <div className="flex flex-col 800px:flex-row gap-4 pb-4">
                                    <div className="w-full 800px:w-1/2">
                                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="address1">Address 1</label>
                                        <input
                                            id="address1"
                                            className={`${styles.input} w-full border border-gray-300 rounded-md shadow-sm p-2`}
                                            type="text"
                                            placeholder={user?.address1}
                                            required
                                            value={address1}
                                            onChange={(e) => setAddress1(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-full 800px:w-1/2">
                                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="address2">Address 2</label>
                                        <input
                                            id="address2"
                                            className={`${styles.input} w-full border border-gray-300 rounded-md shadow-sm p-2`}
                                            type="text"
                                            placeholder={user?.address2}
                                            required
                                            value={address2}
                                            onChange={(e) => setAddress2(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center mt-4">
                                    <button
                                        type="submit"
                                        className="w-full 800px:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-8 py-2 rounded-md shadow transition-all"
                                    >
                                        Update Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

            {/* orders page */}
            {active === 2 && <AllOrders />}

            {/* refund page */}
            {active === 3 && <AllRefunds />}

            {/* Track order */}
            {active === 5 && <TrackOrder />}

            {/* payment methods */}
            {active === 6 && <PaymentMethods />}

            {/* address */}
            {active === 7 && <Address />}
        </div>
    )
}

// ─── Shared DataGrid wrapper ────────────────────────────────────────────────
const orderColumns = (ActionIcon) => [
    { field: "id", headerName: "Order ID", minWidth: 130, flex: 0.7 },
    {
        field: "status",
        headerName: "Status",
        minWidth: 110,
        flex: 0.6,
        cellClassName: (params) =>
            params.row.status === "Delivered" ? "greenColor" : "redColor",
    },
    { field: "itemsQty", headerName: "Qty", type: "number", minWidth: 80, flex: 0.4 },
    { field: "total", headerName: "Total", type: "number", minWidth: 100, flex: 0.5 },
    {
        field: " ",
        flex: 0.5,
        minWidth: 80,
        headerName: "",
        sortable: false,
        renderCell: (params) => (
            <Link to={`/order/${params.id}`}>
                <Button><ActionIcon size={20} /></Button>
            </Link>
        ),
    },
];

const mockOrders = [
    {
        _id: "21321432fdsahdf@#$32kfsdaj",
        orderItems: [{ name: "Iphone 14 pro max" }],
        totalPrice: 120,
        orderStatus: "Processing",
    },
];

const buildRows = (orders) =>
    orders.map((item) => ({
        id: item._id,
        itemsQty: item?.orderItems?.length,
        total: "US$ " + item?.totalPrice,
        status: item?.orderStatus,
    }));

const AllOrders = () => (
    <div className='px-1 800px:pl-8 pt-1 overflow-x-auto'>
        <DataGrid
            rows={buildRows(mockOrders)}
            columns={orderColumns(AiOutlineArrowRight)}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
        />
    </div>
);

const AllRefunds = () => (
    <div className='px-1 800px:pl-8 pt-1 overflow-x-auto'>
        <DataGrid
            rows={buildRows(mockOrders)}
            columns={orderColumns(AiOutlineArrowRight)}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
        />
    </div>
);

const TrackOrder = () => (
    <div className='px-1 800px:pl-8 pt-1 overflow-x-auto'>
        <DataGrid
            rows={buildRows(mockOrders)}
            columns={orderColumns(MdOutlineTrackChanges)}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
        />
    </div>
);

// ─── Payment Methods ─────────────────────────────────────────────────────────
const PaymentMethods = () => (
    <div className="w-full px-2 800px:px-5">
        {/* Header */}
        <div className="flex w-full items-center justify-between mb-4">
            <h1 className="text-[20px] 800px:text-[25px] font-semibold text-gray-800">Payment Methods</h1>
            <div className={`${styles.button} !bg-blue-600`}>
                <span className="text-white text-sm">Add New</span>
            </div>
        </div>

        {/* Card row */}
        <div className="w-full bg-white rounded-[10px] px-4 py-4 shadow flex flex-col 800px:flex-row 800px:items-center 800px:justify-between gap-3">
            {/* Card logo + name */}
            <div className="flex items-center gap-3">
                <img
                    className="h-6"
                    src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
                    alt="card"
                />
                <span className='font-semibold text-gray-700'>Sarim Nadeem</span>
            </div>

            {/* Card details */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>1234 **** **** ****</span>
                <span>08/2028</span>
            </div>

            {/* Delete */}
            <div className="flex justify-end 800px:justify-start">
                <AiOutlineDelete size={22} className="cursor-pointer" color="red" />
            </div>
        </div>
    </div>
);

// ─── Address ─────────────────────────────────────────────────────────────────
const Address = () => (
    <div className="w-full px-2 800px:px-5">
        {/* Header */}
        <div className="flex w-full items-center justify-between mb-4">
            <h1 className="text-[20px] 800px:text-[25px] font-semibold text-gray-800">My Address</h1>
            <div className={`${styles.button} !bg-blue-600`}>
                <span className="text-white text-sm">Add New</span>
            </div>
        </div>

        {/* Address row */}
        <div className="w-full bg-white rounded-[10px] px-4 py-4 shadow flex flex-col 800px:flex-row 800px:items-center 800px:justify-between gap-3">
            <span className='font-semibold text-gray-700'>Default Address</span>
            <span className="text-sm text-gray-600">Karachi, Pakistan</span>
            <span className="text-sm text-gray-600">(051) 498 394 899</span>
            <div className="flex justify-end 800px:justify-start">
                <AiOutlineDelete size={22} className="cursor-pointer" color="red" />
            </div>
        </div>
    </div>
);




export default ProfileContent   