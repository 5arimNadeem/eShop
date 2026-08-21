import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  isLoading: true,
};

// 🧠 Why no state?.property here?
// Redux Toolkit uses Immer under the hood — it GUARANTEES state is never null/undefined.
// Optional chaining (?.) is for READING: "if this exists, read from it"
// You cannot WRITE through optional chaining: state?.x = value is INVALID syntax.
// Always use state.x = value inside createReducer.

export const productReducer = createReducer(initialState, (builder) => {
  builder
    // create product
    .addCase("productCreateRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("productCreateSuccess", (state, action) => {
      state.isLoading = false;
      state.product = action.payload;
      state.success = true;
    })
    .addCase("productCreateFail", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase("clearErrors", (state) => {
      state.error = null;
    })

    // get all products of shop
    .addCase("getAllProductShopRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("getAllProductShopSuccess", (state, action) => {
      state.isLoading = false;
      state.products = action.payload;
    })
    .addCase("getAllProductShopFailed", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // delete product of a shop
    .addCase("deleteProductRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("deleteProductSuccess", (state, action) => {
      state.isLoading = false;
      state.message = action.payload;
    })
    .addCase("deleteProductFailed", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // get all products
    .addCase("getAllProductsRequest", (state) => {
      state.isLoading = true;
    })
    .addCase("getAllProductsSuccess", (state, action) => {
      state.isLoading = false;
      state.allProducts = action.payload;
    })
    .addCase("getAllProductsFailed", (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
});