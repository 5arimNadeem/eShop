const express = require('express');
const cors = require('cors');

const ErrorHandler = require('./middleware/error.js');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')

// middlewares 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));



//config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require('dotenv').config({ path: 'config/.env' });
}

// Importing Routes
const user = require('./controller/user.js');

// Using Routes
app.use('/api/v2/user', user);

// Error Handling
app.use(ErrorHandler);

app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is working fine"
    });
});


module.exports = app;