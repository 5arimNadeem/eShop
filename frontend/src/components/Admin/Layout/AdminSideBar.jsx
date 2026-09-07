import { HiOutlineUserGroup } from "react-icons/hi"
import { FiShoppingBag } from "react-icons/fi"
import { Link } from "react-router-dom"

const AdminSideBar = ({ active }) => {
    return (
        <div className="w-full h-[90vh] bg-white shadow-sm overflow-y-scroll sticky top-0 left-0 z-10">
            <div className="w-full flex items-center p-4">
                <Link to="/admin/users" className="w-full flex items-center">
                    <HiOutlineUserGroup size={30} color={`${active === 1 ? "blue" : "#555"}`} />
                    <h5 className={`hidden md:block pl-2 text-[18px] font-[400] ${active === 1 ? "text-[blue]" : "text-[#555]"}`}>
                        All Users
                    </h5>
                </Link>
            </div>

            <div className="w-full flex items-center p-4">
                <Link to="/admin/sellers" className="w-full flex items-center">
                    <FiShoppingBag size={30} color={`${active === 2 ? "blue" : "#555"}`} />
                    <h5 className={`hidden md:block pl-2 text-[18px] font-[400] ${active === 2 ? "text-[blue]" : "text-[#555]"}`}>
                        All Sellers
                    </h5>
                </Link>
            </div>
        </div>
    )
}

export default AdminSideBar
