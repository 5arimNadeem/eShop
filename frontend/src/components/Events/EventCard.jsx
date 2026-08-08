import React from 'react'
import styles from '../../styles/styles'
import CountDown from "./Countdown.jsx";

// const FALLBACK_IMAGE =
//     "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image";

const EventCard = () => {
    // const imageUrl = data?.image_Url?.[0]?.url || data?.images?.[0]?.url
    return (
        <div className='w-full 800px:flex block bg-white rounded-lg p-2 lg:800'>
            <div className="w-full lg-w[50%] m-auto">
                <img src="https://m.media-amazon.com/images/I/31Vle5fVdaL.jpg"
                    alt="iphone"
                />
            </div>

            <div className="w-full lg:[w-50%] flex flex-col justify-center">
                <h2 className={`${styles.productTitle}`}>
                    Iphone 14pro max 8/256gb
                </h2>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde a error, voluptatum laborum veniam sed pariatur minima commodi quisquam iste ipsam magni maxime aperiam sint ipsa nostrum. Doloremque dignissimos nulla unde animi tenetur! Assumenda quam possimus nostrum eum libero commodi? Amet beatae doloremque voluptatum temporibus magni. Reiciendis aliquam earum laboriosam!
                </p>

                <div className="flex py-2 justify-between">
                    <div className="flex">
                        <h5 className="font-[500] text-[18px] text-[#d55] pr-3 line-through">

                            1088$
                        </h5>
                        <h5 className='font-bold text-[20px] text-[#333] font-Roboto'>
                            999$
                        </h5>

                    </div>

                    <span className='
                    pr-3 font-[400] text-[17px] text-[#44a55e]'>
                        120 sold
                    </span>
                </div>

                <CountDown />
            </div>

        </div>
    )
}

export default EventCard