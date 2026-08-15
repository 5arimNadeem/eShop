import React, { useEffect, useState } from 'react'
import styles from '../../styles/styles.js'
import { productData } from '../../static/data.jsx'
import ProductCard from '../Route/ProductCard/ProductCard.jsx';


const SuggestedProduct = ({ data }) => {
    // use state for products
    const [products, setProducts] = useState()
    // useeffect for productData
    useEffect(() => {
        const d = productData && productData.filter((i)=> i?.category === data?.category);
        setProducts(d); 
    }, [data])
    
    return (
        <div className={`${styles.section} bg-white mt-6 mb-12`}>
            <div className={`${styles.heading}`}>
                <h1>Related product</h1>
            </div>
            <div className='grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-[30px] mt-5'>
                {/* {data.map((item,index)=>(
                    <ProductCard key={index} data={item}/>
                ))} */}
                {
                    products && products.map((i,index)=>(<ProductCard key={index} data={i}/>))
                }
            </div>
        </div>
    )
}

export default SuggestedProduct