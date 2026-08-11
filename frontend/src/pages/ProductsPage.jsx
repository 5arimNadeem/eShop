import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer.jsx";
import Header from "../components/Layout/Header.jsx";
// import Loader from "../components/Layout/Loader.jsx";
import ProductCard from "../components/Route/ProductCard/ProductCard.jsx";
import styles from "../styles/styles";
import { productData } from "../static/data.jsx";

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const categoryData = searchParams.get("category");
    const [data, setData] = useState([]);

    useEffect(() => {
        if (categoryData === null) {
            // const d = allProducts;
            // setData(d);
            const d = productData && productData.sort((a, b) => a.total_sell - b.total_sell)
            setData(d)
        } else {
            const d = productData && productData.filter((i) => i.category === categoryData)
            // allProducts && allProducts.filter((i) => i.category === categoryData);
            setData(d);
        }
        //    window.scrollTo(0,0);
    }, [categoryData]);

    return (
        <>
            <div >
                <Header activeHeading={3} />
                <main className={`${styles.section} pt-[190px]`}>
                    <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
                        {
                            data && data.map((i, index) => <ProductCard data={i} key={index} />)
                        }

                    </div>
                    {
                        data && data.length === 0 ? (
                            <h1 className="text-center w-full pb-[100px] text-[20px]"
                            >No proudcts Found !!!</h1>
                        ) : null
                    }
                </main>
                <Footer />
            </div>
        </>
    );
};

export default ProductsPage;
