import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    sellers: [],
    isLoading: false,
    error: null,
};

export const adminReducer = createReducer(initialState, (builder) => {
    builder
        // Get all users
        .addCase("getAllUsersRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("getAllUsersSuccess", (state, action) => {
            state.isLoading = false;
            state.users = action.payload;
        })
        .addCase("getAllUsersFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // Get all sellers
        .addCase("getAllSellersRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("getAllSellersSuccess", (state, action) => {
            state.isLoading = false;
            state.sellers = action.payload;
        })
        .addCase("getAllSellersFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // Delete user
        .addCase("deleteUserRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("deleteUserSuccess", (state) => {
            state.isLoading = false;
        })
        .addCase("deleteUserFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // Delete seller
        .addCase("deleteSellerRequest", (state) => {
            state.isLoading = true;
        })
        .addCase("deleteSellerSuccess", (state) => {
            state.isLoading = false;
        })
        .addCase("deleteSellerFailed", (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        .addCase("clearErrors", (state) => {
            state.error = null;
        });
});
