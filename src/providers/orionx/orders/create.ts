import orionx from "../orionx";

const limitMutation = `
  mutation placeOrder(
    $marketCode: ID
    $amount: BigInt
    $limitPrice: BigInt
    $sell: Boolean
  ) {
    placeLimitOrder(
      marketCode: $marketCode
      amount: $amount
      limitPrice: $limitPrice
      sell: $sell
    ) {
      _id
    }
  }
`;

const marketMutation = `
mutation placeOrder($marketCode: ID, $amount: BigInt, $sell: Boolean) {
  placeMarketOrder(marketCode: $marketCode, amount: $amount, sell: $sell) {
    _id
  }
}
`;

export async function create(market, type, sell, limitPrice, amount) {
  const orderFunction = type === "limit" ? limitMutation : marketMutation;

  const order = {
    marketCode: market.code,
    sell: sell === "true",
    limitPrice,
    amount: amount * Math.pow(10, market.mainCurrency.units),
  };

  const createdOrder = await orionx.graphql({ query: orderFunction, variables: order });

  return createdOrder.placeOrder;
}
