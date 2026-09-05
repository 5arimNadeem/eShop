import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user";
import { cartReducer } from './reducers/cart';
import { wishlistReducer } from './reducers/wishlist';
import { sellerReducer } from "./reducers/seller";
import { productReducer } from "./reducers/product";
import { eventReducer } from "./reducers/event";
import { orderReducer } from './reducers/order';

const Store = configureStore({
  reducer: {
    user: userReducer,
    seller: sellerReducer,
    products: productReducer,
    event: eventReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
  },
});

export default Store;

