import axios from "axios";
import { server } from "../../server";

// get all users
export const getAllUsers = () => async (dispatch) => {
    try {
        dispatch({
            type: "getAllUsersRequest",
        });

        const { data } = await axios.get(`${server}/user/admin-all-users`, {
            withCredentials: true,
        });

        dispatch({
            type: "getAllUsersSuccess",
            payload: data.users,
        });
    } catch (error) {
        dispatch({
            type: "getAllUsersFailed",
            payload: error?.response?.data?.message || "Failed to load users",
        });
    }
};

// get all sellers
export const getAllSellers = () => async (dispatch) => {
    try {
        dispatch({
            type: "getAllSellersRequest",
        });

        const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
            withCredentials: true,
        });

        dispatch({
            type: "getAllSellersSuccess",
            payload: data.sellers,
        });
    } catch (error) {
        dispatch({
            type: "getAllSellersFailed",
            payload: error?.response?.data?.message || "Failed to load sellers",
        });
    }
};

// delete a user, then refresh the list
export const deleteUser = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "deleteUserRequest",
        });

        const { data } = await axios.delete(`${server}/user/delete-user/${id}`, {
            withCredentials: true,
        });

        dispatch({
            type: "deleteUserSuccess",
        });

        dispatch(getAllUsers());

        return { success: true, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to delete user";

        dispatch({
            type: "deleteUserFailed",
            payload: message,
        });

        return { success: false, message };
    }
};

// delete a seller, then refresh the list
export const deleteSeller = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "deleteSellerRequest",
        });

        const { data } = await axios.delete(`${server}/shop/delete-seller/${id}`, {
            withCredentials: true,
        });

        dispatch({
            type: "deleteSellerSuccess",
        });

        dispatch(getAllSellers());

        return { success: true, message: data.message };
    } catch (error) {
        const message = error?.response?.data?.message || "Failed to delete seller";

        dispatch({
            type: "deleteSellerFailed",
            payload: message,
        });

        return { success: false, message };
    }
};
