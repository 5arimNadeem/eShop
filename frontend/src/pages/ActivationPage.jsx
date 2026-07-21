import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import { server } from "../server";

const ActivationPage = () => {
    const { activationToken } = useParams();
    const [status, setStatus] = useState("loading"); // "loading", "success", "error"
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activationToken) {
            const activateAccount = async () => {
                try {
                    const res = await axios.post(
                        `${server}/user/activation`,
                        { activationToken },
                        { headers: { "Content-Type": "application/json" } }
                    );
                    setStatus("success");
                } catch (error) {
                    setStatus("error");
                    setError(
                        error.response
                            ? error.response.data.message
                            : "An unexpected error occurred."
                    );
                }
            };
            activateAccount();
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
            {status === "loading" && <p>Activating your account...</p>}
            {status === "success" && <p>Your account has been activated successfully!</p>}
            {status === "error" && <p>{error}</p>}
        </div>
    );
};

export default ActivationPage;