import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer.jsx";
import Header from "../components/Layout/Header.jsx";
import Loader from "../components/Layout/Loader.jsx";
import ProductCard from "../components/Route/ProductCard/ProductCard.jsx";
import styles from "../styles/styles";

const BestSellingPage = () => {
    const [searchParams] = useSearchParams();
    const categoryData = searchParams.get("category");
    const { allProducts, isLoading } = useSelector((state) => state.products);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (categoryData === null) {
            const d = [...(allProducts || [])].sort((a, b) => b.sold_out - a.sold_out);
            setData(d);
        } else {
            const d = (allProducts || []).filter((i) => i.category === categoryData);
            setData(d);
        }
        // window.scrollTo(0, 0);
    }, [allProducts, categoryData]);

    return (
        <>
            {
                isLoading ? (
                    <Loader />
                ) : (
                    <div>
                        <Header activeHeading={2} solidOnLoad />
                        <div className={`${styles.section}`}>
                            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
                                {data && data.map((i) => <ProductCard data={i} key={i._id} />)}
                            </div>
                            {data && data.length === 0 ? (
                                <h1 className="text-center w-full pb-[100px] text-[20px]">
                                    No products Found!
                                </h1>
                            ) : null}
                        </div>
                        <Footer />
                    </div>
                )
            }
        </>
    );
};

export default BestSellingPage;
