import React, { useEffect, useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import ProductDetails from '../components/Products/ProductDetails.jsx'
import SuggestedProduct from '../components/Products/SuggestedProduct.jsx'
import { useParams } from 'react-router-dom'
import { productData } from '../static/data.jsx'
import { useSelector } from 'react-redux'

const ProductDetailsPage = () => {
    // allProducts = global list, filled by getAllProducts() dispatched in App.jsx
    // products   = shop-specific list, only filled on shop pages — WRONG key for here
    const { allProducts } = useSelector((state) => state.products)
    const { name } = useParams()
    const [data, setData] = useState(null)
    const productName = name.replace(/-/g, " ");

    useEffect(() => {
        // STEP 1: Search Redux (real API products from the database)
        const fromApi = allProducts?.find((i) => i.name === productName);

        // STEP 2: Fallback to static data (for demo products used in dev)
        const fromStatic = productData?.find((i) => i.name === productName);

        // Use whichever one found the product
        setData(fromApi || fromStatic || null);

        console.log("[DEBUG] productName:", productName);
        console.log("[DEBUG] found in API:", !!fromApi, "| found in static:", !!fromStatic);

    }, [allProducts, productName]); // dependency array — re-runs only when these change

    return (
        <div>
            <Header />
            <main>
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