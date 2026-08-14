import React, { useEffect, useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ProductDetails from '../components/Products/ProductDetails.jsx'
import SuggestedProduct from '../components/Products/SuggestedProduct.jsx'
import { useParams } from 'react-router-dom'
import { productData } from '../static/data.jsx'

const ProductDetailsPage = () => {
    const { name } = useParams()
    const [data, setData] = useState(null)
    const productName = name.replace(/-/g, " ");

    useEffect(() => {
        const data = productData.find((i) => i.name === productName)
        setData(data)
    }, []);

    // console.log(name );

    return (
        <div>

            <Header />
            <main className='mt-20'>
                <ProductDetails data={data} />
            </main>
            {
                data && <SuggestedProduct data={data} />
            }
            <footer className='mt-2'>
                <Footer />
            </footer>
        </div>
    )
}

export default ProductDetailsPage