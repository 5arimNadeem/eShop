import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
};

export const userReducer = createReducer(initialState, (builder) => {
    builder
        .addCase("LoadUserRequest", (state) => {
            state.loading = true;
        })
        .addCase("LoadUserSuccess", (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        })
        .addCase("LoadUserFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        })

        //update user info

        .addCase("updateUserInfoRequest", (state) => {
            state.loading = true;
        })
        .addCase("updateUserInfoSuccess", (state, action) => {
            state.loading = false;
            state.user = action.payload;
        })
        .addCase("updateUserInfoFailed", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        //update address
        .addCase("updateUserAddressRequest", (state) => {
            state.loading = true;
        })
        .addCase("updateUserAddressSuccess", (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.message = action.payload.successMessage;
        })
        .addCase("updateUserAddressFailed", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        //delete address
        .addCase("deleteUserAddressRequest", (state) => {
            state.loading = true;
        })
        .addCase("deleteUserAddressSuccess", (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.message = action.payload.successMessage;
        })
        .addCase("deleteUserAddressFailed", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase("clearErrors", (state) => {
            state.error = null;
        });
});

// export const userReducer = createReducer(initialState, {
//     LoadUserRequests: (state) => {
//         state.loading = true
//     },
//     LoadUserRequests: (state, actions) => {
//         /* eslint eqeqeq: "off", curly: "error" */
//         state.isAuthenticated = true;
//         state.loading = false;
//         state.user = actions.payload;
//     },
//     LoadUserFail: (state, actions) => {
//         state.loading = false;
//         state.error = actions.payload;
//         state.isAuthenticated = false;
//     },
//     clearErrors: (state) => {
//         state.error = null
//     }
// })