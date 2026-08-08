import React, { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "../../Products/Ratings.jsx";
import styles from "../../../styles/styles";
import {
    AiFillHeart,
    AiOutlineHeart,
    AiOutlineEye,
    AiOutlineShoppingCart,
} from "react-icons/ai";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";

const FALLBACK_IMAGE =
    "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";

const ProductCard = ({ data }) => {
    const [click, setClick] = useState(false)
    const [open, setOpen] = useState(false)

    const product_name = (data?.name || "").replace(/\s+/g, "-");

    // static data uses price/discount_price/rating/total_sell,
    // the API uses originalPrice/discountPrice/ratings/sold_out
    const imageUrl = data?.image_Url?.[0]?.url || data?.images?.[0]?.url || FALLBACK_IMAGE;
    const originalPrice = data?.originalPrice ?? data?.price;
    const discountPrice = data?.discountPrice ?? data?.discount_price;
    const rating = data?.ratings ?? data?.rating ?? 0;
    const soldOut = data?.sold_out ?? data?.total_sell ?? 0;


    return (
        <>
            <div className="w-full bg-white rounded-lg shadow-sm p-3 relative cursor-pointer">
                <div className="flex justify-end">
                    <Link to={`/product/${product_name}`} className="block w-full h-full">
                        <img
                            src={imageUrl}
                            alt={data?.name}
                            className="w-full h-56 object-contain transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                        />
                    </Link>
                    {/* side options */}
                    <div className="flex">
                        {click ? (
                            <AiFillHeart
                                size={22}
                                className="cursor-pointer absolute right-2 top-5"
                                onClick={() => setClick(!click)}
                                color={click ? "red" : "#333"}
                                title="Remove from Wishlist"
                            />
                        ) : (
                            <AiOutlineHeart
                                size={22}
                                className="cursor-pointer absolute right-2 top-5"
                                onClick={() => setClick(!click)}
                                color={click ? "red" : "#333"}
                                title="Add to Wishlist"
                            />
                        )}
                        <AiOutlineEye
                            size={22}
                            className="cursor-pointer absolute right-2 top-14"
                            onClick={() => setOpen(!open)}
                            color="#333"
                            title="Quick View"
                        />
                        <AiOutlineShoppingCart
                            size={25}
                            className="cursor-pointer absolute right-2 top-24"
                            onClick={() => setOpen(!open)}
                            color="#444"
                            title="Add to Cart"
                        />
                        {
                            open ? (
                                <ProductDetailsCard open={open} setOpen={setOpen} data={data} />
                            ) : null}
                    </div>
                </div>

                <div className="p-5 flex flex-col gap-2 flex-1">
                    <Link to='/'>
                        <h5
                            className={`${styles.shop_name} !pt-0 !pb-0 text-xs font-semibold text-gray-500 hover:text-[#f63b60] transition`}
                        >
                            {data?.shop?.name}
                        </h5>
                    </Link>
                    <Link to={`/product/${product_name}`}>
                        <h4 className="font-semibold text-lg text-gray-800 truncate mb-1 hover:text-[#f63b60] transition">
                            {data?.name?.length > 40
                                ? data.name.slice(0, 40) + "..."
                                : data?.name}
                        </h4>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Ratings rating={rating} />
                        <span className="text-xs text-gray-400">
                            ({Number(rating).toFixed(1)})
                        </span>
                    </div>


                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-bold text-[#f63b60]">
                                {discountPrice ?? originalPrice}$
                            </span>
                            {originalPrice && originalPrice !== discountPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    {originalPrice}$
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium text-blue-500 bg-blue-50 rounded px-2 py-1 whitespace-nowrap">
                            {soldOut} sold
                        </span>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ProductCard;
