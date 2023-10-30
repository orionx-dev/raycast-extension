import React, { useEffect } from "react";
import { Create } from "./create";
import { cancel } from "../providers/orionx/orders/cancel";

export function Replace(order) {
  useEffect(() => {
    cancel(order._id);
  }, []);

  return (
    <Create
      marketCode={order.marketCode}
      type={order.type}
      sell={order.sell}
      limitPrice={order.limitPrice}
    />
  );
}
