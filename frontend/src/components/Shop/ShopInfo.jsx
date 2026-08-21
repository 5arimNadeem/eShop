// rafce 

import { useSelector } from "react-redux";
import { backendUrl, server } from "../../server";
import { useState } from "react";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import axios from "axios";

const ShopInfo = ({ isOwner }) => {
    const [data, setData] = useState({});

    // const totalReviewsLength =
    //     products &&
    //     products.reduce((acc, product) => acc + product.reviews.length, 0);

    // const totalRatings = products && products.reduce((acc, product) => acc + product.reviews.reduce((sum, review) => sum + review.rating, 0), 0);

    // const averageRating = totalRatings / totalReviewsLength || 0;

    const { seller } = useSelector((state) => state.seller);
    const logoutHandler = async () => {
        await axios.get(`${server}/shop/logout`, {
            withCredentials: true,
        });
        window.location.reload();
    };
    return (
        <>
            <div>
                <div className="w-full flex item-center justify-center">
                    {/* image */}
                    <img src={`${backendUrl}${seller?.avatar}`}
                        className="w-[150px] h-[150px] object-cover rounded-full"
                        alt="Shop Avatar" />
                </div>
                <h3 className="text-center py-2 text-[20px]">{seller?.name}</h3>
                <p className="text-[16px] text-[#000000a6] p-[10px] flex items-center">
                    {seller?.description}
                </p>

            </div>
            <div className="p-3">
                <h5 className="font-[600]">Address</h5>
                <h4 className="text-[#000000a6]">{seller?.address}</h4>
            </div>
            <div className="p-3">
                <h5 className="font-[600]">Phone Number</h5>
                <h4 className="text-[#000000a6]">{seller?.phoneNumber}</h4>
            </div>
            <div className="p-3">
                <h5 className="font-[600]">Total Products</h5>
                <h4 className="text-[#000000a6]">10</h4>
            </div>
            <div className="p-3">
                <h5 className="font-[600]">Shop Ratings</h5>
                <h4 className="text-[#000000b0]">3/5</h4>
            </div>
            <div className="p-3">
                <h5 className="font-[600]">Joined On</h5>
                <h4 className="text-[#000000b0]">{seller?.createdAt?.slice(0, 10)}</h4>
            </div>

            {isOwner && (
                <div className="py-3 px-4">
                    <Link to="/settings">
                        <div className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}>
                            <span className="text-white">Edit Shop</span>
                        </div>
                    </Link>
                    <div className={`${styles.button} !w-full !h-[42px] !rounded-[5px]`}
                        onClick={logoutHandler}
                    >
                        <span className="text-white">Log Out</span>
                    </div>
                </div>
            )}
        </>



    )
}

export default ShopInfo