import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import ProductDetails from "../components/Products/ProductDetails.jsx";
import SuggestedProduct from "../components/Products/SuggestedProduct.jsx";
import { useSelector } from "react-redux";

const ProductDetailsPage = () => {
    const { allProducts } = useSelector((state) => state.products);
    const { allEvents } = useSelector((state) => state.event);
    const { name } = useParams();
    const [data, setData] = useState(null);
    const [searchParams] = useSearchParams();
    const eventData = searchParams.get("isEvent");

    useEffect(() => {
        if (eventData !== null) {
            // EventCard links by _id with ?isEvent=true
            const d = allEvents && allEvents.find((i) => i._id === name);
            setData(d);
        } else {
            // ProductCard links by data._id  →  match by _id
            const d = allProducts && allProducts.find((i) => i._id === name);
            setData(d);
        }
    }, [allProducts, allEvents, name]);

    return (
        <div>
            <Header />
            <ProductDetails data={data} isEvent={eventData !== null} />
            {
                !eventData && (
                    <>
                        {data && <SuggestedProduct data={data} />}
                    </>
                )
            }
            <Footer />
        </div>
    );
};

export default ProductDetailsPage;