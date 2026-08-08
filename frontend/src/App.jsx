import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ActivationPage, HomePage, LoginPage, SignupPage } from './Routes.js'
import { toast, ToastContainer } from "react-toastify";
import axios from 'axios';
import { server } from './server.js';

const App = () => {
  useEffect(() => {
    axios.get(`${server}/user/get-user`, { withCredentials: true }).then((res) => {
      toast.success(res.data.message)
    }).catch((err) => {
      toast.error(err?.response?.data?.message)
    })
  }, []);
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/sign-up' element={<SignupPage />} />
          <Route path='/activation/:activationToken' element={<ActivationPage />} />
          {/* <Route path='/activation/:activationToken' element={<ActivationPage />} /> */}
        </Routes>
        <ToastContainer position="top-center" autoClose={3000} />
      </BrowserRouter>
    </div>
  )
}

export default App