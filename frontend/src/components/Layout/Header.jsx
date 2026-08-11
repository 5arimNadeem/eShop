import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import { productData, categoriesData } from "../../static/data";
import {
    AiOutlineHeart,
    AiOutlineSearch,
    AiOutlineShoppingCart,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
// import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { backendUrl } from "../../server";
// import Cart from "../cart/Cart";
// import Wishlist from "../Wishlist/Wishlist";
// import { RxCross1 } from "react-icons/rx";
// import { backendUrl } from "../../server";
// import { getImageUrl } from "../../utils/imageUtils";

const Header = ({ activeHeading }) => {
    const { isAuthenticated, user, loading } = useSelector((state) => state.user);
    // const { isSeller } = useSelector((state) => state.seller);
    // const { wishlist } = useSelector((state) => state.wishlist);
    // const { cart } = useSelector((state) => state.cart);
    // const { allProducts } = useSelector((state) => state.products);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchData, setSearchData] = useState(null);
    const [dropDown, setDropDown] = useState(false);
    // const [openCart, setOpenCart] = useState(false);
    // const [openWishlist, setOpenWishlist] = useState(false);
    // const [open, setOpen] = useState(false);

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        const filteredProducts = productData &&
            productData.filter((product) =>
                product.name.toLowerCase().includes(term.toLowerCase())
            );
        setSearchData(filteredProducts);
    };

    return (
        <>
            {
                loading ? (
                    null
                ) : (
                    <div div className="fixed top-0 left-0 w-full z-30 bg-white shadow-md" >
                        <div className={`${styles.section}`}>
                            <div className="hidden 800px:h-[60px] 800px:my-[20px] 800px:flex items-center justify-between">
                                <div>
                                    <Link to="/">
                                        <div className="flex items-center">
                                            <h1
                                                className="text-4xl font-bold text-blue-600 hover:text-blue-700"
                                            >
                                                EShop
                                            </h1>
                                        </div>
                                    </Link>
                                </div>
                                {/* search box */}
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
                                                searchData.map((i, index) => {
                                                    return (
                                                        <Link to={`/product/${i._id}`} key={index}>
                                                            <div className="w-full flex items-center py-3 hover:bg-blue-50 rounded-lg px-2 transition-colors">
                                                                <img
                                                                    src={i.image_Url[0].url}
                                                                    alt=""
                                                                    className="w-[40px] h-[40px] mr-[10px] rounded-md object-cover"
                                                                />
                                                                <h1 className="text-gray-700 hover:text-blue-600">{i.name}</h1>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-lg shadow-lg transition-all duration-300">
                                    <Link to="/seller">
                                        <h1 className="text-white flex items-center font-semibold">
                                            Become Seller
                                            <IoIosArrowForward className="ml-1" />
                                        </h1>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className={`transition-colors duration-300 hidden 800px:flex item-center justify-between w-full h-[70px]`}
                        >
                            <div
                                className={`${styles.section} relative ${styles.noramlFlex} justify-between`}
                            >
                                {/* categories */}
                                <div onClick={() => setDropDown(!dropDown)}>
                                    {/*  hidden 1000px:block */}
                                    <div className="relative h-[50px] mt-[10px] w-[270px]">
                                        <BiMenuAltLeft size={30} className="absolute top-2 left-2 text-blue-600" />
                                        <button
                                            className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white hover:bg-blue-50 font-sans text-lg font-[500] select-none rounded-lg shadow-sm transition-colors`}
                                        >
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
                                {/* navitems */}
                                <div className={`${styles.noramlFlex}`}>
                                    <Navbar active={activeHeading} solid />
                                </div>

                                {/* wishlist */}

                                <div className="flex">
                                    <div className={`${styles.noramlFlex}`}>
                                        <div
                                            className="relative cursor-pointer mr-[15px] p-2 rounded-lg hover:bg-blue-100"
                                        // onClick={() => setOpenWishlist(true)}
                                        >
                                            <AiOutlineHeart size={28} color="#2563eb" />
                                            <span className="absolute -right-1 -top-1 rounded-full bg-blue-400 w-5 h-5 flex items-center justify-center text-white font-bold text-[11px] shadow-md">
                                                {/* {wishlist && wishlist.length} */}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`${styles.noramlFlex}`}>
                                        <div
                                            className="relative cursor-pointer mr-[15px] p-2 rounded-lg hover:bg-blue-100"
                                        // onClick={() => setOpenWishlist(true)}
                                        >
                                            <AiOutlineShoppingCart size={28} color="#2563eb" />
                                            <span className="absolute -right-1 -top-1 rounded-full bg-blue-400 w-5 h-5 flex items-center justify-center text-white font-bold text-[11px] shadow-md">
                                                {/* {wishlist && wishlist.length} */}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`${styles.noramlFlex}`}>

                                        <div
                                            className="relative cursor-pointer mr-[15px] p-2 rounded-lg hover:bg-blue-100">
                                            {isAuthenticated ? (
                                                // <div>
                                                <Link to="/profile">
                                                    <img
                                                        src={`${backendUrl}${user.avatar}`}
                                                        alt=""
                                                        className="w-[60px] h-[60px] rounded-full border-[3px] border-blue-500"
                                                    />
                                                </Link>
                                                // </div>
                                            ) : (
                                                <>
                                                    <Link
                                                        to="/login"
                                                        className="text-[18px] pr-[10px] text-blue-600 font-semibold"
                                                    >
                                                        Login /
                                                    </Link>
                                                    <Link
                                                        to="/signup"
                                                        className="text-[18px] text-blue-600 font-semibold"
                                                    >
                                                        Sign up
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                )
            }
        </>
    )
}

export default Header;
