import React, { useEffect } from 'react'
import { useSelector } from "react-redux"

import { useNavigate } from 'react-router-dom'
import SignUp from '../components/SignUp/SignUp'

const SignupPage = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useSelector((state) => state.user);

    useEffect(() => {
        if (isAuthenticated === true) {
            navigate("/");
        }
    }, []);
    return (
        <div>
            <SignUp />
        </div>
    )
}

export default SignupPage