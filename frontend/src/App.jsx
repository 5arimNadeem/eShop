import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LoginPage } from './Routes.js'
import { SignupPage } from './Routes.js'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/sign-up' element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App