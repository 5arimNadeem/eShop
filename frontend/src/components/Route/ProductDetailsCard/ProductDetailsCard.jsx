import React, { useState } from 'react'
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from 'react-icons/ai';
import { RxCross1 } from 'react-icons/rx';
import styles from '../../../styles/styles';

const FALLBACK_IMAGE =
    "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";

const ProductDetailsCard = ({ setOpen, data }) => {
    const [count, setCount] = useState(1);
    // const [select, setSelect] = useState(false);
    const [click, setClick] = useState(false);
    const imageUrl = data?.image_Url?.[0]?.url || data?.images?.[0]?.url || FALLBACK_IMAGE;

    const handleMessageSubmit = () => { };

    const decrementCount = () => {
        if (count > 1) {
            setCount(count - 1);
        }
    };

    const incrementCount = () => {
        setCount(count + 1);
    };

    return (
        <div className='bg-white'>
            {
                data ? (
                    // 5 : 50
                    <div className="fixed w-full h-screen top-0 left-0 bg-[#00000030] z-40 flex items-center justify-center">
                        <div className='w-[90%] 800px:w-[60%] h-[90vh] overflow-y-scroll bg-white rounded-md shadow-sm relative p-4'>
                            <RxCross1 size={30} className="absolute right-3 top-3 z-50"
                                onClick={() => setOpen(false)}
                            />

                            <div className="block w-full 800px:flex">
                                <div className="w-full 800px:w-[50%]">
                                    <img src={imageUrl} alt="" />

                                    <div className="flex">
                                        <img src={data?.shop.shop_avatar.url} alt=""
                                            className='w-[50px] h-[50px] rounded-full mr-2 object-contain'
                                        />
                                        <div>
                                            <h3 className={`${styles.shop_name}`}>
                                                {data.shop.name}
                                            </h3>
                                            <h5 className="pb-3 text-[15px]">
                                                {data.shop.ratings} Ratings
                                            </h5>
                                        </div>
                                    </div>
                                    <div className={`${styles.button} bg-[#000] mt-4 rounded-[4px] h-11`}
                                        onClick={handleMessageSubmit}
                                    >
                                        <span className="text-[#fff] flex items-center  ">
                                            Send Message <AiOutlineMessage className='ml-1' />
                                        </span>
                                    </div>
                                    <h5 className='text-[16px] text-[red] mt-5'>
                                        ( {data.total_sell}) Sold out
                                    </h5>
                                </div>

                                <div className="w-full 800px:w-[50%] pt-5 pl-[5px] pr-[5px]">
                                    <h1 className={`${styles.productTitle} text-[20px]`}>
                                        {data.name}
                                    </h1>
                                    <p>{data.description}</p>

                                    <div className="flex pt-3">
                                        <h4 className={`${styles.productDiscountPrice}`}>
                                            {data.discount_price}$
                                        </h4>
                                        <h3 className={`${styles.price}`}>
                                            {data.price ? data.price + "$" : null}
                                        </h3>
                                    </div>
                                    <div className={`${styles.noramlFlex} mt-12 justify-between pr-3`}>
                                        <div>
                                            <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 p-3 m-1'

                                                onClick={decrementCount}                                     >
                                                -
                                            </button>
                                            <span className='bg-gray-200 text-gray-800 font-medium px-4 py-[11px]'>
                                                {count}
                                            </span>
                                            <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 p-3 m-1'

                                                onClick={incrementCount}                                     >
                                                +
                                            </button>
                                        </div>

                                        <div>
                                            {click ? (
                                                <AiFillHeart
                                                    size={30}
                                                    className="cursor-pointer"
                                                    onClick={() => setClick(!click)}
                                                    color={click ? "red" : "#333"}
                                                    title="Remove from Wishlist"
                                                />
                                            ) : (
                                                <AiOutlineHeart
                                                    size={30}
                                                    className="cursor-pointer"
                                                    onClick={() => setClick(!click)}
                                                    color={click ? "red" : "#333"}
                                                    title="Add to Wishlist"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={`${styles.button} mt-6 rounded-[4px] h-11 flex flex-center`}
                                    >
                                        <span className='text-[#fff] flex items-center'>
                                            Add to Cart <AiOutlineShoppingCart className='ml-1' />
                                        </span>
                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>

                ) : null
            }

        </div>
    )
}

export default ProductDetailsCard