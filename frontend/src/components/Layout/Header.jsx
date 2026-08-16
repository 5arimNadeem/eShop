import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import { productData, categoriesData, navItems } from "../../static/data";
import {
    AiOutlineHeart,
    AiOutlineSearch,
    AiOutlineShoppingCart,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { RxCross1 } from "react-icons/rx";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { backendUrl } from "../../server";
import Cart from "../cart/Cart.jsx";
import Wishlist from "../Wishlist/Wishlist.jsx";

const Header = ({ activeHeading }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.user);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchData, setSearchData] = useState(null);
    const [dropDown, setDropDown] = useState(false);
    const [openCart, setOpenCart] = useState(false);
    const [openWishlist, setOpenWishlist] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        const filteredProducts =
            productData &&
            productData.filter((product) =>
                product.name.toLowerCase().includes(term.toLowerCase())
            );
        setSearchData(filteredProducts);
    };

    return (
        <>
            {loading ? null : (
                <div className="fixed top-0 left-0 w-full z-30 bg-white shadow-md">

                    {/* ── MOBILE TOP BAR (hidden on 800px+) ── */}
                    <div className="flex 800px:hidden items-center justify-between px-4 h-[60px]">
                        {/* Hamburger */}
                        <button
                            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <BiMenuAltLeft size={26} className="text-blue-600" />
                        </button>

                        {/* Logo */}
                        <Link to="/">
                            <h1 className="text-2xl font-bold text-blue-600">EShop</h1>
                        </Link>

                        {/* Cart */}
                        <button
                            className="relative p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            onClick={() => setOpenCart(true)}
                            aria-label="Open cart"
                        >
                            <AiOutlineShoppingCart size={26} color="#2563eb" />
                            <span className="absolute -right-1 -top-1 rounded-full bg-blue-400 w-4 h-4 flex items-center justify-center text-white font-bold text-[10px] shadow-md" />
                        </button>
                    </div>

                    {/* ── MOBILE DRAWER ── */}
                    {/* Backdrop */}
                    {mobileMenuOpen && (
                        <div
                            className="fixed inset-0 bg-black/40 z-40 800px:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    )}
                    {/* Slide-in panel */}
                    <div
                        className={`fixed top-0 left-0 h-full w-[75%] max-w-[320px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out 800px:hidden flex flex-col
                            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                                <h1 className="text-2xl font-bold text-blue-600">EShop</h1>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100"
                                aria-label="Close menu"
                            >
                                <RxCross1 size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Search inside drawer */}
                        <div className="px-5 py-4 border-b relative">
                            <input
                                type="text"
                                placeholder="Search Product..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="h-[42px] w-full px-4 pr-10 border-[2px] border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <AiOutlineSearch
                                size={20}
                                className="absolute right-8 top-[26px] text-blue-600"
                            />
                            {searchData && searchData.length !== 0 && (
                                <div className="absolute left-5 right-5 bg-white shadow-xl z-[9] p-3 rounded-lg border border-blue-200 mt-1 max-h-[40vh] overflow-y-auto">
                                    {searchData.map((i, index) => (
                                        <Link
                                            to={`/product/${i._id}`}
                                            key={index}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <div className="w-full flex items-center py-2 hover:bg-blue-50 rounded-lg px-2 transition-colors">
                                                <img
                                                    src={i.image_Url[0].url}
                                                    alt=""
                                                    className="w-[36px] h-[36px] mr-3 rounded-md object-cover"
                                                />
                                                <span className="text-gray-700 text-sm">{i.name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Nav links */}
                        <nav className="px-5 py-3 border-b flex-1 overflow-y-auto">
                            {navItems &&
                                navItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.url}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block py-3 font-medium text-sm border-b border-gray-100 last:border-0 ${
                                            activeHeading === index + 1
                                                ? "text-blue-600"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                        </nav>

                        {/* Bottom actions */}
                        <div className="px-5 py-4 border-t space-y-3">
                            {/* Wishlist */}
                            <button
                                onClick={() => { setOpenWishlist(true); setMobileMenuOpen(false); }}
                                className="flex items-center gap-3 w-full text-gray-700 text-sm font-medium py-2 hover:text-blue-600 transition-colors"
                            >
                                <AiOutlineHeart size={22} color="#2563eb" />
                                Wishlist
                            </button>

                            {/* Profile / Auth */}
                            {isAuthenticated ? (
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 w-full text-sm font-medium text-gray-700 py-2 hover:text-blue-600 transition-colors"
                                >
                                    <img
                                        src={`${backendUrl}${user.avatar}`}
                                        alt=""
                                        className="w-8 h-8 rounded-full border-2 border-blue-500 object-cover"
                                    />
                                    My Profile
                                </Link>
                            ) : (
                                <div className="flex gap-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex-1 text-center py-2 border border-blue-500 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex-1 text-center py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            {/* Become Seller */}
                            <Link
                                to="/shop-create"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-1 w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-semibold"
                            >
                                Become Seller <IoIosArrowForward />
                            </Link>
                        </div>
                    </div>

                    {/* ── DESKTOP TOP BAR (hidden below 800px) ── */}
                    <div className={`${styles.section}`}>
                        <div className="hidden 800px:h-[60px] 800px:my-[10px] 800px:flex items-center justify-between">
                            <div>
                                <Link to="/">
                                    <div className="flex items-center">
                                        <h1 className="text-4xl font-bold text-blue-600 hover:text-blue-700">
                                            EShop
                                        </h1>
                                    </div>
                                </Link>
                            </div>
                            {/* Search box */}
                            <div className="w-[50%] relative">
                                <input
                                    type="text"
                                    placeholder="Search Product..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="h-[45px] w-full px-4 border-[2px] border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                />
                                <AiOutlineSearch
                                    size={22}
                                    className="absolute right-3 top-3 cursor-pointer text-blue-600"
                                />
                                {searchData && searchData.length !== 0 ? (
                                    <div className="absolute min-h-[30vh] bg-white shadow-xl z-[9] p-4 rounded-lg border border-blue-200 mt-1 max-h-[60vh] overflow-y-auto">
                                        {searchData &&
                                            searchData.map((i, index) => (
                                                <Link to={`/product/${i.name}`} key={index}>
                                                    <div className="w-full flex items-center py-3 hover:bg-blue-50 rounded-lg px-2 transition-colors">
                                                        <img
                                                            src={i.image_Url[0].url}
                                                            alt=""
                                                            className="w-[40px] h-[40px] mr-[10px] rounded-md object-cover"
                                                        />
                                                        <h1 className="text-gray-700 hover:text-blue-600">{i.name}</h1>
                                                    </div>
                                                </Link>
                                            ))} 3:33:37 the video
                                    </div>
                                ) : null}
                            </div>

                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
                                <Link to="/shop-create">
                                    <h1 className="text-white flex items-center font-semibold">
                                        Become Seller
                                        <IoIosArrowForward className="ml-1" />
                                    </h1>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── DESKTOP NAVBAR BAR (hidden below 800px) ── */}
                    <div className={`transition-colors duration-300 hidden 800px:flex item-center justify-between w-full h-[70px]`}>
                        <div className={`${styles.section} relative ${styles.noramlFlex} justify-between`}>
                            {/* Categories dropdown */}
                            <div onClick={() => setDropDown(!dropDown)}>
                                <div className="relative h-[50px] mt-[10px] w-[270px]">
                                    <BiMenuAltLeft size={30} className="absolute top-2 left-2 text-blue-600" />
                                    <button className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white hover:bg-blue-50 font-sans text-lg font-[500] select-none rounded-lg shadow-sm transition-colors`}>
                                        All Categories
                                    </button>
                                    <IoIosArrowDown
                                        size={20}
                                        className="absolute right-2 top-3 cursor-pointer text-blue-600"
                                        onClick={() => setDropDown(!dropDown)}
                                    />
                                    {dropDown ? (
                                        <DropDown
                                            categoriesData={categoriesData}
                                            setDropDown={setDropDown}
                                        />
                                    ) : null}
                                </div>
                            </div>

                            {/* Nav items */}
                            <div className={`${styles.noramlFlex}`}>
                                <Navbar active={activeHeading} solid />
                            </div>

                            {/* Icons */}
                            <div className="flex">
                                {/* Wishlist */}
                                <div className={`${styles.noramlFlex}`}>
                                    <div
                                        className="relative cursor-pointer mr-[15px] p-2 rounded-lg hover:bg-blue-100"
                                        onClick={() => setOpenWishlist(true)}
                                    >
                                        <AiOutlineHeart size={28} color="#2563eb" />
                                        <span className="absolute -right-1 -top-1 rounded-full bg-blue-400 w-5 h-5 flex items-center justify-center text-white font-bold text-[11px] shadow-md" />
                                    </div>
                                </div>

                                {/* Cart */}
                                <div className={`${styles.noramlFlex}`}>
                                    <div
                                        className="relative cursor-pointer mr-[15px] p-2 rounded-lg hover:bg-blue-100"
                                        onClick={() => setOpenCart(true)}
                                    >
                                        <AiOutlineShoppingCart size={28} color="#2563eb" />
                                        <span className="absolute -right-1 -top-1 rounded-full bg-blue-400 w-5 h-5 flex items-center justify-center text-white font-bold text-[11px] shadow-md" />
                                    </div>
                                </div>

                                {/* Profile / Auth */}
                                <div className={`${styles.noramlFlex}`}>
                                    <div className="relative cursor-pointer mr-[15px] p-2 rounded-lg hover:bg-blue-100">
                                        {isAuthenticated ? (
                                            <Link to="/profile">
                                                <img
                                                    src={`${backendUrl}${user.avatar}`}
                                                    alt=""
                                                    className="w-[60px] h-[60px] rounded-full border-[3px] border-blue-500"
                                                />
                                            </Link>
                                        ) : (
                                            <>
                                                <Link to="/login" className="text-[18px] pr-[10px] text-blue-600 font-semibold">
                                                    Login /
                                                </Link>
                                                <Link to="/signup" className="text-[18px] text-blue-600 font-semibold">
                                                    Sign up
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {openCart ? <Cart setOpenCart={setOpenCart} /> : null}
                                {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer: pushes page content below the fixed header */}
            <div className="h-[60px] 800px:h-[150px]" />
        </>
    );
};

export default Header;
