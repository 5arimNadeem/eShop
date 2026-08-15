import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RxPerson } from 'react-icons/rx';
import { HiOutlineReceiptRefund, HiOutlineShoppingBag, HiBookmark, HiOutlineLogout } from 'react-icons/hi';
import { MdEditAttributes } from 'react-icons/md';
import { AiOutlineCreditCard, AiOutlineMessage } from 'react-icons/ai';
import { server } from '../../server';
import { toast } from 'react-toastify';
import axios from 'axios';

// Reusable nav item: icon-only on mobile, icon + text on desktop
const NavItem = ({ icon, label, isActive, onClick }) => (
    <div
        className={`flex w-full items-center justify-center 800px:justify-start px-2 800px:px-3 py-3 cursor-pointer rounded-md transition-colors ${isActive ? 'bg-red-50' : 'hover:bg-gray-50'}`}
        onClick={onClick}
        title={label}
    >
        <span className='flex-shrink-0'>{icon}</span>
        <span className={`hidden 800px:inline pl-3 font-medium text-sm ${isActive ? "text-red-500" : "text-gray-700"}`}>
            {label}
        </span>
    </div>
);

const ProfileSideBar = ({ active, setActive }) => {
    const navigate = useNavigate();

    const logoutHandler = () => {
        axios.get(`${server}/user/logout`, {
            withCredentials: true
        }).then((res) => {
            toast.success(res?.data?.message);
            navigate("/");
        }).catch((error) => {
            toast.error(error?.response?.data?.message);
        });
    };

    const color = (id) => active === id ? "#ef4444" : "#374151";

    return (
        <div className='w-full shadow-sm bg-white rounded-[5px] border p-2 800px:p-4 800px:pt-8 pt-4 space-y-1'>
            <NavItem
                icon={<RxPerson size={22} color={color(1)} />}
                label="Profile"
                isActive={active === 1}
                onClick={() => setActive(1)}
            />
            <NavItem
                icon={<HiOutlineShoppingBag size={22} color={color(2)} />}
                label="Orders"
                isActive={active === 2}
                onClick={() => setActive(2)}
            />
            <NavItem
                icon={<HiOutlineReceiptRefund size={22} color={color(3)} />}
                label="Refunds"
                isActive={active === 3}
                onClick={() => setActive(3)}
            />
            <NavItem
                icon={<AiOutlineMessage size={22} color={color(4)} />}
                label="Inbox"
                isActive={active === 4}
                onClick={() => { setActive(4); navigate("/inbox"); }}
            />
            <NavItem
                icon={<MdEditAttributes size={22} color={color(5)} />}
                label="Track Order"
                isActive={active === 5}
                onClick={() => setActive(5)}
            />
            <NavItem
                icon={<AiOutlineCreditCard size={22} color={color(6)} />}
                label="Payment Methods"
                isActive={active === 6}
                onClick={() => setActive(6)}
            />
            <NavItem
                icon={<HiBookmark size={22} color={color(7)} />}
                label="Addresses"
                isActive={active === 7}
                onClick={() => setActive(7)}
            />
            <NavItem
                icon={<HiOutlineLogout size={22} color={color(8)} />}
                label="Logout"
                isActive={active === 8}
                onClick={() => { setActive(8); logoutHandler(); }}
            />
        </div>
    );
};

export default ProfileSideBar