import {
  List,
  Action,
  ActionPanel,
  LocalStorage,
  Clipboard,
  getPreferenceValues,
  Icon,
  Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import orionx from "./providers/orionx/orionx";
import pusher from "./providers/pusher";
import { get } from "./providers/orionx/orders/state";
import onOrderUpdated from "./providers/orionx/orders/update";

export default function Command() {
  const [selected, setSelected] = useState();
  const [orders, setOrders] = useState([]);
  const [channel, setChannel] = useState();

  useEffect(() => {
    async function loadSelection() {
      if (!selected) {
        const saved = await LocalStorage.getItem("main:selected");
        setSelected(saved);
      }
    }
    loadSelection();
  }, [selected]);

  useEffect(() => {
    console.log("channel changed", channel);
    if (!channel) return;

    async function loadOrders() {
      const query = `
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

      const variables = { limit: 100 };
      const orders = await orionx.graphql({ query, variables });
      console.log("loadOrders", orders);
      setOrders(
        orders.orders.items.map((order) => ({
          ...order,
          marketCode: order.market.code,
          mainCurrencyUnits: order.market.mainCurrency.units,
          secondaryCurrencyUnits: order.market.secondaryCurrency.units,
        })),
      );
    }
    loadOrders();
    function ordersArray() {
      const ordersByMarket = get();
      const ordersArray = [];

      for (const market in ordersByMarket) {
        for (const orderId in ordersByMarket[market]) {
          ordersArray.push(ordersByMarket[market][orderId]);
        }
      }

      return ordersArray;
    }
    channel.bind("orders", (updatedOrder) => {
      onOrderUpdated(updatedOrder);
      setOrders(ordersArray());
      if (!get(updatedOrder.marketCode, updatedOrder._id) && selected === updatedOrder._id) {
        setSelected();
      }
    });
    return () => {
      channel.unbind("orders");
    };
  }, [channel]);

  useEffect(() => {
    const preferences = getPreferenceValues<Preferences>();
    const token = preferences["ORIONX_REALTIME_TOKEN"];
    const channel = pusher.subscribe(`private-${token}`);
    setChannel(channel);
    return () => {
      pusher.unsubscribe(`private-${token}`);
    };
  }, []);

  return (
    <List
      selectedItemId={selected}
      actions={
        <ActionPanel>{/* <Action.Push title="Create" target={<Create />} /> */}</ActionPanel>
      }
    >
      {orders.map((order) => (
        <List.Item
          key={order._id}
          title={order._id}
          id={order._id}
          actions={
            <ActionPanel>
              {/* <Action key={1} title="Select" onAction={() => execute(order)} /> */}
              {/* <Action key={2} title="Remove" onAction={() => del(order)} /> */}
              {/* <Action.Push key={3} title="Create" target={<Create />} /> */}
              <Action key={4} title="Copy Id" onAction={() => Clipboard.copy(order._id)} />
            </ActionPanel>
          }
          accessories={[
            { text: { value: order.marketCode, color: Color.Blue }, tooltip: "Market" },
            {
              text: {
                value:
                  order.market && order.limitPrice
                    ? order.limitPrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: order.market?.secondaryCurrency?.code || "CLP",
                      })
                    : order.limitPrice || "Market",
                color: Color.Orange,
              },
              tooltip: "Price",
            },
            {
              text: {
                value: String(order.amount * Math.pow(10, -order.mainCurrencyUnits)) || "Market",
                color: Color.Orange,
              },
              tooltip: "Amount",
            },
            {
              text: {
                value: String(order.filled * Math.pow(10, -order.mainCurrencyUnits)) || "Market",
                color: Color.Green,
              },
              tooltip: "Completed",
            },
            {
              tag: {
                value: order.sell ? "SELL" : "BUY",
                color: order.sell ? Color.Red : Color.Green,
              },
            },
            { tag: { value: new Date(order.createdAt), color: Color.Magenta } },
          ]}
        />
      ))}
    </List>
  );
}