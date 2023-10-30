import { cancel } from "./cancel";
import { create } from "./create";

export async function replace(oldOrder, newOrder) {
  await cancel(oldOrder._id);
  console.log("new Order");
  return create(
    newOrder.market,
    newOrder.type,
    newOrder.sell,
    newOrder.limitPrice,
    newOrder.amount,
  );
}
