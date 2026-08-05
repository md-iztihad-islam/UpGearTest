import getOrderByOrderIdApi from "@/services/dashboard/order/getOrderByOrderIdApi";
import getPendingOrdersApi from "@/services/dashboard/order/getPendingOrdersApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function ReceivedOrders(){
    const navigate = useNavigate();

    const { data: pendingOrdersData } = useQuery({
        queryKey: ['pendingOrdersData'],
        queryFn: () => getPendingOrdersApi(),
    })

    console.log("Pending Orders Data:", pendingOrdersData?.data);

    return(
        <div className="flex flex-col w-[80%] justify-start items-center gap-20 p-10">
            <h1 className="text-5xl font-bold">Pending Orders</h1>

            <div className="w-full">
                <ul className="list w-full bg-base-100 rounded-box shadow-md">
  
                    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Pending Orders</li>

                    {
                        pendingOrdersData && pendingOrdersData.data.map((order, idx) => (
                            <li key={order._id} className="list-row w-full">
                                <div>{idx+1}</div>
                                <div>
                                    <div>Order ID: {order.orderId}</div>
                                    <div className="text-xs uppercase font-semibold opacity-60">Total Amount: {order.totalAmount || 0.00}</div>
                                    <div className="text-xs uppercase font-semibold opacity-60">Address: {order.deliverAddress || 0.00}</div>
                                </div>
                                <div>
                                    {
                                        order.products.map((product, pIdx) => (
                                            <div key={product._id} className="mb-2">
                                                <div className="font-semibold">{pIdx + 1}. {product.productId.title}</div>
                                                <div className="text-xs opacity-60">Quantity: {product.productQuantity}</div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <button onClick={() => navigate(`details/${order._id}`)} className="btn btn-square btn-warning w-[150px]">
                                    Details
                                </button>
                                <button  className="btn btn-square btn-error w-[150px]">
                                    Accept
                                </button>
                            </li>
                        ))

                    }
  
                </ul>
            </div>
        </div>
    )
}

export default ReceivedOrders;