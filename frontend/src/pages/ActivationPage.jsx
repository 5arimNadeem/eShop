import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { server } from "../server";

const ActivationPage = () => {
    const { activationToken } = useParams();
    const [error, setError] = useState(false);

    useEffect(() => {
        if (activationToken) {
            const activationEmail = async () => {
                try {
                    const res = await axios.post(`${server}/user/activation`, {
                        activationToken,
                    })
                    console.log(res.data.message)
                } catch (error) {
                    console.log(error.response.data.message)
                    setError(true)
                }
            }
            activationEmail()
        }
    }, [activationToken]);
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {error ? (
                <p>Your token is expired</p>
            ) : (
                <p>your account has been created successfully</p>
            )}
        </div>
    );
}

export default ActivationPage