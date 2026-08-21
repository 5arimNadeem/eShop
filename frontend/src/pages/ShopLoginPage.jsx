import ShopLogin from "../components/Shop/ShopLogin.jsx";
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ShopLoginPage = () => {

  const navigate = useNavigate();

  const { isSeller,isLoading } = useSelector((state) => state.seller);

  useEffect(() => {
    if (isSeller === true) {
      navigate(`/dashboard`);
    }
  }, [isLoading,isSeller]);

  console.log(isSeller);

  return (
    <div>
      <ShopLogin />
    </div>
  )
}

export default ShopLoginPage