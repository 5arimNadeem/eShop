import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllSellers, deleteSeller } from "../../redux/actions/admin";
import Loader from "../Layout/Loader";

const AllSellers = () => {
    const { sellers, isLoading } = useSelector((state) => state.admin);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllSellers());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this seller permanently? This cannot be undone.")) {
            return;
        }

        const result = await dispatch(deleteSeller(id));

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    const columns = [
        { field: "id", headerName: "Seller ID", minWidth: 150, flex: 0.7 },
        { field: "name", headerName: "Name", minWidth: 130, flex: 0.7 },
        { field: "email", headerName: "Email", minWidth: 130, flex: 0.7 },
        { field: "address", headerName: "Address", minWidth: 130, flex: 0.7 },
        { field: "joinedAt", headerName: "Joined At", minWidth: 130, flex: 0.8 },
        {
            field: "Preview",
            flex: 0.8,
            minWidth: 100,
            headerName: "Preview",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/shop/preview/${params.id}`}>
                            <Button>
                                <AiOutlineEye size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
        {
            field: "Delete",
            flex: 0.8,
            minWidth: 120,
            headerName: "Delete",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Button onClick={() => handleDelete(params.id)}>
                            <AiOutlineDelete size={20} />
                        </Button>
                    </>
                );
            },
        },
    ];

    const row = [];

    sellers &&
        sellers.forEach((item) => {
            row.push({
                id: item._id,
                name: item.name,
                email: item.email,
                address: item.address,
                joinedAt: item.createdAt ? item.createdAt.slice(0, 10) : "—",
            });
        });

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <div className="w-full mx-8 pt-1 mt-10 bg-white">
                    <h1 className="font-bold text-3xl mb-4">All Sellers</h1>
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

export default AllSellers;
