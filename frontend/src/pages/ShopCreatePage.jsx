import React from "react";
import ShopCreate from "../components/Shop/ShopCreate.jsx";

const ShopCreatePage = () => {
    // const navigate = useNavigate();

    // const { isSeller } = useSelector((state) => state.seller);

    // useEffect(() => {
    //     if (isSeller === true) {
    //         navigate(`/dashboard`);
    //     }
    // }, [isSeller, navigate]);

    return (
        <div>
            <ShopCreate />
        </div>
    );
};

export default ShopCreatePage;