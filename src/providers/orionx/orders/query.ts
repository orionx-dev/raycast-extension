export default `
query openOrders($limit: Int) {
  orders(limit: $limit, onlyOpen: true) {
    _id
    items {
      _id
      type
      amount
      amountToHold
      secondaryAmount
      limitPrice
      filled
      secondaryFilled
      sell
      createdAt
      closedAt
      activatedAt
      status
      isStop
      stopPriceUp
      stopPriceDown
      market {
        code
        mainCurrency {
          code
          units
        }
        secondaryCurrency {
          code
          units
        }
      }
      __typename
    }
  }
}
`;
