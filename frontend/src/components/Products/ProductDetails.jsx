import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from '../../styles/styles'
import { AiFillHeart, AiOutlineHeart, AiOutlineMessage, AiOutlineShoppingCart } from 'react-icons/ai'
// import ProductDetailsInfo from ""

const ProductDetails = ({ data }) => {
    const [count, setCount] = useState(1)
    const [click, setClick] = useState(false)
    const [select, setSelect] = useState(1)
    const navigate = useNavigate()

    const decrementCount = () => {
        if (count > 1) {
            setCount(count - 1);
        }
    };

    const incrementCount = () => {
        setCount(count + 1);
    };

    const handleMessageSubmit = () => {
        navigate("/indox?conversation=32423424243432fdsfjadfl")
    }

    return (
        <div className='bg-white'>
            {
                data ? (
                    // section one 
                    <div className={`${styles.section} w-[90%] 800px:w-[80%] h-screen`}>
                        <div className="w-full py-5">
                            <div className="block w-full 800px:flex mt-10 ">
                                <div className="w-full 800px:w-[50%]">
                                    <img src={data?.image_Url[select]?.url}
                                        className='w-[80%]'
                                    />
                                    <div className="w-full flex">
                                        <div className={`${select === 0 ? "border" : "null"} cursor-pointer`}>
                                            <img src={data?.image_Url[0]?.url}
                                                className='h-[200px]'
                                                onClick={() => setSelect(0)}
                                            />
                                        </div>
                                        <div className={`${select === 1 ? "border" : "null"} cursor-pointer`}>
                                            <img src={data?.image_Url[1]?.url}
                                                className='h-[200px]'
                                                onClick={() => setSelect(1)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* right side */}
                                <div className="w-full 800px:w-[50%] mt-10">
                                    <h1 className={`${styles.productTitle}`}>
                                        {data.name}
                                    </h1>
                                    <p>{data.description}</p>
                                    <div className="flex pt-3">
                                        <h4 className={`${styles.productDiscountPrice}`}>
                                            {data.discount_price}$
                                        </h4>
                                        <h3 className={`${styles.price}`}>
                                            {
                                                data.price ? data.price + "$" : ""
                                            }
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
                                    <div className={`${styles.button} mt-6 rounded h-11 flex items-center`}>
                                        <span className='text-white flex items-center bg-black'>
                                            Add to Cart <AiOutlineShoppingCart className='ml-1' />
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-1">
                                        <img src={data?.shop?.shop_avatar.url}
                                            className='w-[50px] h-[50px] rounded-full object-contain bg-black'
                                            alt="" />
                                        <div className='pr-8'>
                                            <h3 className={`${styles.shop_name} pb-1 pt-1`}>
                                                {data.shop.name}
                                            </h3>
                                            <h5
                                                className='pb-3 text-[15px]'
                                            >
                                                ({data.shop.ratings}) Ratings
                                            </h5>
                                        </div>

                                        <div className={`${styles.button} bg-[#6443d1] mt-4 rounded h-11`}>
                                            <span
                                                className='text-white flex items-center'
                                                onClick={handleMessageSubmit}
                                            >
                                                Send Message <AiOutlineMessage className='ml-1' />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/*  */}
                            </div>

                        </div>
                    </div>
                    // section two 
                ) : null
            }
            <ProductDetailsInfo data={data} />
        </div>
    )
}

const ProductDetailsInfo = ({ data }) => {
    const [active, setActive] = useState(1)
    return (
        <div className='bg-gray-300 px-3 800px:px-1 py-2 rounded h-[40vh] '>
            <div className='w-full flex justify-between border-b pt-10 pb-2'>
                <div className="relative">
                    <h5 className='text-[#000] text-[20px] font-[600] leading-5 cursor-pointer 800px:text-[25px] px-1'
                        onClick={() => setActive(1)}
                    >
                        Product Details
                    </h5>
                    {active === 1 ? (
                        <div className={`${styles.active_indicator}`}>

                        </div>
                    ) : null}
                </div>

                <div className="relative">
                    <h5 className='text-[#000] text-[20px] font-[600] leading-5 cursor-pointer 800px:text-[25px] px-1'
                        onClick={() => setActive(2)}
                    >
                        Product Reviews
                    </h5>
                    {active === 2 ? (
                        <div className={`${styles.active_indicator}`}>

                        </div>
                    ) : null}
                </div>

                <div className="relative">
                    <h5 className='text-[#000] text-[20px] font-[600] leading-5 cursor-pointer 800px:text-[25px] px-1'
                        onClick={() => setActive(3)}
                    >
                        Seller Information
                    </h5>
                    {active === 3 ? (
                        <div className={`${styles.active_indicator}`}>

                        </div>
                    ) : null}
                </div>

            </div>


            {active === 1 ? (
                <>
                    <p lassName='py-2 text-[20px] leading-8 pb-10 whitespace-pre-line text-center'>
                        {/* {data.description}
                         */}
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, dolore! Dicta aliquam, praesentium quis sequi sunt iste nulla illo officiis, ex ipsam deleniti tempore, consectetur minima repellat? Officia perferendis nam dolores et, eius assumenda dolorem fugiat, accusantium, provident dignissimos alias eligendi laudantium reprehenderit laboriosam!
                    </p>
                </>
            ) : null
            }
            {
                active === 2 ? (
                    <p className='py-2 text-[20px] leading-8 pb-10 whitespace-pre-line text-center'>
                        No Reviews Yet!
                    </p>
                ) : null
            }
            {
                active === 3 && (
                    <div className='w-full block 800px:flex p-5'>
                        <div className="w-full 800px:w-[50%]">
                            <div className="flex items-center">
                                <img src={data?.shop?.shop_avatar?.url} className="w-[50px] h-[50px] rounded-full object-contain" alt="" />
                                <div className='pl-8'>
                                    <h3 className={`${styles.shop_name} pb-1 pt-1`}>
                                        {data.shop.name}
                                    </h3>
                                    <h5
                                        className='pb-2 text-[15px]'
                                    >
                                        ({data.shop.ratings}) Ratings
                                    </h5>
                                </div>
                            </div>
                            <p className="pt-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium, nostrum!</p>
                        </div>

                        <div className="w-full 800px:w-[50%] mt-5 800px:mt-0 800px">
                            <div className="text-left">
                                <h5 className='font-
                                [600]'>
                                    Joined On: <span>14 August 2026</span>
                                </h5>
                                <h5 className='font-
                                [600] pt-3'>
                                    Total Products: <span>14</span>
                                </h5>
                                <h5 className='font-
                                [600] pt-3'>
                                    Total Reviews: <span>14</span>
                                </h5>

                                <Link to={`/`}>
                                    <div className={`${styles.button} rounded-[4px] h-[39.5px] mt-3`}>
                                        <h4 className="text-white">
                                            Visit Shop
                                        </h4>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            }

        </div>
    )
}

export default ProductDetails