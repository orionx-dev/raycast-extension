import { findAndUpdate, removeOrder } from "./state";

export default function (order) {
  console.log("orders update", order);
  const { marketCode, _id } = order;

  if (order.status === "canceled" || order.status === "closed") {
    return removeOrder(marketCode, _id);
  }

  return findAndUpdate(marketCode, _id, order);
}
