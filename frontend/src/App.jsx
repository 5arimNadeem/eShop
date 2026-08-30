import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ActivationPage, BestSellingPage, EventsPage, FAQPage, HomePage, LoginPage, ProductsPage, SignupPage, CheckoutPage, PaymentPage, OrderSuccessPage, ProductDetailsPage, ProfilePage, ShopCreatePage, SellerActivationPage, ShopLoginPage } from './Routes.js'
import Loader from './components/Layout/Loader.jsx'

import {
  ShopHomePage,
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupons,
  ShopPreviewPage,
  // ShopAllOrders,
  // ShopOrderDetails,
  // ShopAllRefunds,
  // ShopSettingsPage,
  // ShopWithDrawMoney,
  // ShopInboxPage
} from "./ShopRoutes.js";
import { toast, ToastContainer } from "react-toastify";
import Store from "./redux/store.js";
import { loadSeller, loadUser } from "./redux/actions/user.js";
import { getAllProducts } from "./redux/actions/product.js";
import axios from 'axios';
import { server } from './server.js';
import ProtectedRoute from "./routes/ProtectedRoute.js"
import SellerProtectedRoute from "./routes/SellerProtectedRoute.js"
import { getAllEvents } from './redux/actions/event.js'
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";


const App = () => {
  const { loading: userLoading } = useSelector((state) => state.user);
  const { loading: sellerLoading } = useSelector((state) => state.seller);

  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    const { data } = await axios.get(`${server}/payment/stripeapikey`);
    setStripeApiKey(data.stripeApiKey);
  }

  useEffect(() => {
    axios.get(`${server}/user/get-user`, { withCredentials: true }).then((res) => {
      toast.success(res.data.message)
    }).catch((err) => {
      toast.error(err?.response?.data?.message)
    })
  }, []);

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadSeller());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApiKey();
  }, []);
  if (userLoading || sellerLoading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      {stripeApiKey && (
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
      )}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/sign-up' element={<SignupPage />} />
        <Route path='/activation/:activationToken' element={<ActivationPage />} />

        {/* seller activation token */}
        <Route path='/seller/activation/:activationToken' element={<SellerActivationPage />} />

        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:name" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/checkout" element={
          <ProtectedRoute >
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order/success/:id" element={<OrderSuccessPage />} />

        <Route path="/profile" element={
          <ProtectedRoute

          >
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* shop routes */}

        <Route path="/shop-create" element={<ShopCreatePage />} />

        <Route path="/shop-login" element={<ShopLoginPage />} />

        <Route path="/shop/:id"
          element={
            <SellerProtectedRoute
            >
              <ShopHomePage />
            </SellerProtectedRoute>
          }
        />

        <Route path="/dashboard"
          element={
            <SellerProtectedRoute
            >
              <ShopDashboardPage />
            </SellerProtectedRoute>
          }
        />

        <Route path="/dashboard-create-product"
          element={
            <SellerProtectedRoute
            >
              <ShopCreateProduct />
            </SellerProtectedRoute>
          }
        />

        <Route path="/dashboard-products"
          element={
            <SellerProtectedRoute
            >
              <ShopAllProducts />
            </SellerProtectedRoute>
          }
        />

        <Route path="/dashboard-create-event"
          element={
            <SellerProtectedRoute
            >
              <ShopCreateEvents />
            </SellerProtectedRoute>
          }
        />

        <Route path="/dashboard-events"
          element={
            <SellerProtectedRoute
            >
              <ShopAllEvents />
            </SellerProtectedRoute>
          }
        />

        <Route path="/dashboard-coupons"
          element={
            <SellerProtectedRoute
            >
              <ShopAllCoupons />
            </SellerProtectedRoute>
          }
        />

        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />



      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </BrowserRouter>
  )


  // )  
}

export default App