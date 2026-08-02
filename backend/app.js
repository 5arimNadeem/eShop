const express = require('express');
const cors = require('cors');

const ErrorHandler = require('./middleware/error.js');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')

app.use(express.json());
app.use(cookieParser());
app.use(cors())
app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// middlewares 
// console.log(app.use(express.json()))

//config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require('dotenv').config({ path: 'config/.env' });
}

// Importing Routes
const user = require('./controller/user');

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