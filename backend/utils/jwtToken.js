// create token and saving that in cookies
const sendToken = (user, statusCode, res) => {
    // equal to 5 days 
    // token experies in 5 days 
    const expiresAtInterval =  5 * 24 * 60 * 60 * 1000
    const token = user.getJwtToken();

    const options = {
        expires: new Date(Date.now() + expiresAtInterval),
        httpOnly: true,
        sameSite: "lax",
        secure: true,
    };

    return res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;