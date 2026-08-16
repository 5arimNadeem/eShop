import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { server } from "../server";

const SellerActivationPage = () => {
    const { activationToken } = useParams();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // 🔒 Lock: prevents double-firing (React StrictMode, re-renders, double-clicks)
    // useRef holds a value that persists across renders but does NOT trigger re-render
    const hasFired = useRef(false);

    useEffect(() => {
        // 🔍 CHECKPOINT: If already called once, stop immediately
        if (!activationToken || hasFired.current) {
            console.log("[DEBUG] Activation blocked — already fired or no token");
            return;
        }

        // Mark as fired BEFORE the async call, not after
        // This is the key: the flag is set synchronously, the request is async
        hasFired.current = true;
        console.log("[DEBUG] Firing activation — token:", activationToken.slice(0, 20) + "...");

        const activationEmail = async () => {
            try {
                const res = await axios.post(
                    `${server}/shop/activation`,
                    { activationToken },
                    { headers: { "Content-Type": "application/json" } }
                );
                console.log("[DEBUG] Activation success:", res.data.message);
                setSuccess(true);
            } catch (error) {
                console.error("[DEBUG] Activation error:", error.response);
                setError(
                    error.response
                        ? error.response.data.message
                        : "An unexpected error occurred."
                );
            }
        };

        activationEmail();
    }, []);


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
                <p style={{ color: "red" }}>{error}</p>
            ) : success ? (
                <p style={{ color: "green" }}>Your account has been created successfully! You can now login.</p>
            ) : (
                <p>Activating your account...</p>
            )}
        </div>
    );
};

export default SellerActivationPage;


