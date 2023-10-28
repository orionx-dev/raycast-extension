import orionx from "../orionx";

const cancelOrder = `
  mutation cancelOrder($orderId: ID) {
    cancelOrder(orderId: $orderId) {
      _id
      type
      status
    }
  }
`;

export async function cancel(_id) {
  const order = {
    orderId: _id,
  };

  const cancelledOrder = await orionx.graphql({ query: cancelOrder, variables: order });

  return cancelledOrder.cancelOrder;
}
