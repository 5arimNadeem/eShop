import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ActivationPage, BestSellingPage, EventsPage, FAQPage, HomePage, LoginPage, ProductsPage, SignupPage, CheckoutPage, PaymentPage, OrderSuccessPage, ProductDetailsPage, ProfilePage, ShopCreatePage, SellerActivationPage } from './Routes.js'
import { toast, ToastContainer } from "react-toastify";
import Store from "./redux/store.js";
import { loadUser } from "./redux/actions/user.js";
import axios from 'axios';
import { server } from './server.js';
import { useSelector } from 'react-redux';
import ProtectedRoute from "./ProtectedRoute.js"

const App = () => {
  const { loading, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    axios.get(`${server}/user/get-user`, { withCredentials: true }).then((res) => {
      toast.success(res.data.message)
    }).catch((err) => {
      toast.error(err?.response?.data?.message)
    })
  }, []);

  useEffect(() => {
    Store.dispatch(loadUser());
    // Store.dispatch(loadSeller());
    // Store.dispatch(getAllProducts());
    // Store.dispatch(getAllEvents());
    // getStripeApiKey();
  }, []);
  return (
    loading ? (null) : (
      <BrowserRouter>
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
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order/success/:id" element={<OrderSuccessPage />} />

          <Route path="/profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/shop-create" element={<ShopCreatePage />} />


        </Routes>
        <ToastContainer position="top-center" autoClose={3000} />
      </BrowserRouter>
    )

  )
}

export default App