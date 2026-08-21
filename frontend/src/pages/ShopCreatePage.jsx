import React from "react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopCreate from "../components/Shop/ShopCreate.jsx";

const ShopCreatePage = () => {
    const navigate = useNavigate();

    const { isSeller, seller } = useSelector((state) => state.seller);

    useEffect(() => {
        if (isSeller === true) {
            navigate(`/shop/${seller._id}`);
        }
    }, []);

    return (
        <div>
            <ShopCreate />
        </div>
    );
};

export default ShopCreatePage;