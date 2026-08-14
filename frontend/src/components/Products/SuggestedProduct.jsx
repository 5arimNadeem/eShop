import React from 'react'
import styles from '../../styles/styles.js'

const SuggestedProduct = ({ data }) => {
    return (
        <div className={`${styles.section} bg-white mt-6 mb-12`}>
            <div className={`${styles.heading}`}>
                <h1>Suggested product</h1>
            </div>
            <div className='grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-[30px] mt-5'>
                {data.map((item,index)=>(
                    <ProductCard key={index} data={item}/>
                ))}
            </div>
        </div>
    )
}

export default SuggestedProduct