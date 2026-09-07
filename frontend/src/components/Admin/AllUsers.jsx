import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getAllUsers, deleteUser } from "../../redux/actions/admin";
import Loader from "../Layout/Loader";

const AllUsers = () => {
    const { users, isLoading } = useSelector((state) => state.admin);
    const { user: currentAdmin } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user permanently? This cannot be undone.")) {
            return;
        }

        const result = await dispatch(deleteUser(id));

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const columns = [
        { field: "id", headerName: "User ID", minWidth: 150, flex: 0.7 },
        { field: "name", headerName: "Name", minWidth: 130, flex: 0.7 },
        { field: "email", headerName: "Email", minWidth: 130, flex: 0.7 },
        { field: "role", headerName: "Role", minWidth: 130, flex: 0.7 },
        { field: "joinedAt", headerName: "Joined At", minWidth: 130, flex: 0.8 },
        {
            field: "Delete",
            flex: 0.8,
            minWidth: 120,
            headerName: "Delete",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                // An admin cannot delete themselves; the backend rejects it too.
                const isSelf = params.id === currentAdmin?._id;

                return (
                    <>
                        <Button onClick={() => handleDelete(params.id)} disabled={isSelf}>
                            <AiOutlineDelete size={20} />
                        </Button>
                    </>
                );
            },
        },
    ];

    const row = [];

    users &&
        users.forEach((item) => {
            row.push({
                id: item._id,
                name: item.name,
                email: item.email,
                role: item.role,
                joinedAt: item.createdAt ? item.createdAt.slice(0, 10) : "—",
            });
        });

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full mx-8 pt-1 mt-10 bg-white">
                    <h1 className="font-bold text-3xl mb-4">All Users</h1>
                    <DataGrid
                        rows={row}
                        columns={columns}
                        pageSize={10}
                        disableSelectionOnClick
                        autoHeight
                    />
                </div>
            )}
        </>
    );
};

export default AllUsers;
