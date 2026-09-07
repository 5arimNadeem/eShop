import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/user";
import { cartReducer } from './reducers/cart';
import { wishlistReducer } from './reducers/wishlist';
import { sellerReducer } from "./reducers/seller";
import { productReducer } from "./reducers/product";
import { eventReducer } from "./reducers/event";
import { orderReducer } from './reducers/order';
import { adminReducer } from './reducers/admin';

const Store = configureStore({
  reducer: {
    user: userReducer,
    seller: sellerReducer,
    products: productReducer,
    event: eventReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    admin: adminReducer,
  },
});

export default Store;

