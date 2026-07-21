import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  // HomePage,
  // ProductsPage,
  // BestSellingPage,
  // EventsPage,
  // FAQPage,
  // SellerActivationPage,
  // ShopLoginPage,
  // ProductDetailsPage,
  // ProfilePage,
  // CheckoutPage,
  // PaymentPage,
  // OrderSuccessPage,
  // OrderDetailsPage,
  // TrackOrderPage,
  // UserInbox
} from "./Routes.js";
// import ScrollToTop from "./components/ScrollToTop.jsx";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
// import ProtectedRoute from "../routes/ProtectedRoute.jsx";
// import Store from "./redux/store.js";
// import { loadSeller, loadUser } from "./redux/actions/user.js";
// import { useSelector } from "react-redux";
// import ShopCreatePage from "./pages/ShopCreatePage.jsx";

// import {
//   ShopHomePage,
//   ShopDashboardPage,
//   ShopCreateProduct,
//   ShopAllProducts,
//   ShopCreateEvents,
//   ShopAllEvents,
//   ShopAllCoupouns,
//   ShopPreviewPage,
//   ShopAllOrders,
//   ShopOrderDetails,
//   ShopAllRefunds,
//   ShopSettingsPage,
//   ShopWithDrawMoney,
//   ShopInboxPage
// } from "./ShopRoutes.js";
// import SellerProtectedRoute from "../routes/SellerProtectedRoute.jsx";
// import { getAllProducts } from "./redux/actions/product.js";
// import { getAllEvents } from "./redux/actions/event.js";
// import { Elements } from "@stripe/react-stripe-js";
// import {loadStripe} from "@stripe/react-stripe-js"
// import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
// import { server } from "./server.js";

const App = () => {
  // const { loading } = useSelector((state) => state.user);

  // const [stripeApiKey, setStripeApiKey] = useState("");

  // async function getStripeApiKey() {
  //   const { data } = await axios.get(`${server}/payment/stripeapikey`);
  //   setStripeApiKey(data.stripeApiKey);
  // }

  // const { isSeller, seller } = useSelector((state) => state.seller);

  // useEffect(() => {
  //   Store.dispatch(loadUser());
  //   Store.dispatch(loadSeller());
  //   Store.dispatch(getAllProducts());
  //   Store.dispatch(getAllEvents());
  //   getStripeApiKey();
  // }, []);

  // console.log("this",isSeller, seller);

  // console.log("stripeApiKey", stripeApiKey);

  return (
    <BrowserRouter>
      {/* <ScrollToTop /> */}
      {/* {stripeApiKey && (
        <Elements stripe={loadStripe(stripeApiKey)}>
          <Routes>
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Elements>
      )} */}
      <Routes>
        <Route path="/" element={<h1>Welcome to the App</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </BrowserRouter>
  );
};
export default App;
