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
const shop = require('./controller/shop.js');
const product = require('./controller/product.js');
const event = require('./controller/event.js');
const couponCode = require('./controller/couponCode.js');
const payment = require('./controller/payment.js');
const order = require('./controller/order.js');
const conversation = require('./controller/conversation.js');
const message = require('./controller/message.js');

// Using Routes
app.use('/api/v2/user', user);
app.use('/api/v2/conversation', conversation);
app.use('/api/v2/message', message);
app.use('/api/v2/shop', shop);
app.use('/api/v2/product', product);
app.use('/api/v2/event', event);
app.use('/api/v2/coupon', couponCode);
app.use('/api/v2/payment', payment);
app.use('/api/v2/order', order);

// Error Handling
app.use(ErrorHandler);

app.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is working fine"
    });
});


module.exports = app;