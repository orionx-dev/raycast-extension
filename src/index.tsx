import {
  List,
  Action,
  ActionPanel,
  LocalStorage,
  Clipboard,
  getPreferenceValues,
  Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import orionx from "./providers/orionx/orionx";
import pusher from "./providers/pusher";
import { get } from "./providers/orionx/orders/state";
import query from "./providers/orionx/orders/query";
import onOrderUpdated from "./providers/orionx/orders/update";
import { cancel } from "./providers/orionx/orders/cancel";
import { Create } from "./orders/create";
import { Replace } from "./orders/replace";

// Instance id (for debugging)
const value = Math.round(Math.random() * 1000);

// This component lists all orders and allows to create and delete them
export default function Command() {
  const [selected, setSelected] = useState();
  const [orders, setOrders] = useState([]);
  const [channel, setChannel] = useState();
  const [loading, setLoading] = useState(false);

  // to handle selection of an order
  useEffect(() => {
    async function loadSelection() {
      if (!selected) {
        const saved = await LocalStorage.getItem("orders:selected");
        setSelected(saved);
      }
    }
    loadSelection();
  }, [selected]);

  // subscribe to updates and Load orders from exchange
  useEffect(() => {
    console.log("channel changed", channel);
    if (!channel) return;
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
    console.log("binding orders");
    channel.bind("orders", (updatedOrder) => {
      onOrderUpdated(updatedOrder);
      setOrders(ordersArray());
      if (!get(updatedOrder.marketCode, updatedOrder._id) && selected === updatedOrder._id) {
        setSelected();
      }
    });

    async function loadOrders() {
      const variables = { limit: 100 };
      setLoading(true);
      const orders = await orionx.graphql({ query, variables });
      setOrders(
        orders.orders.items.map((order) => ({
          ...order,
          marketCode: order.market.code,
          mainCurrencyUnits: order.market.mainCurrency.units,
          secondaryCurrencyUnits: order.market.secondaryCurrency.units,
        })),
      );
      setLoading(false);
    }
    loadOrders();

    return () => {
      console.log("unbinding orders");
      channel.unbind("orders");
      return;
    };
  }, [channel]);

  useEffect(() => {
    console.log("Pusher subscribe", value);
    const preferences = getPreferenceValues<Preferences>();
    const token = preferences["ORIONX_REALTIME_TOKEN"];
    const channel = pusher.subscribe(`private-${token}`);
    setChannel(channel);
    return () => {
      console.log("Pusher unsubscribe");
      pusher.unsubscribe(`private-${token}`);
      return;
    };
  }, []);

  return (
    <List
      isLoading={loading}
      selectedItemId={selected}
      actions={<ActionPanel>{<Action.Push title="Create" target={<Create />} />}</ActionPanel>}
    >
      {Object.entries(keyBy(orders, "marketCode")).map(([key, value]) => (
        <List.Section title={key} key={key}>
          {value.map((order) => (
            <List.Item
              key={order._id}
              title={order._id}
              id={order._id}
              actions={
                <ActionPanel>
                  {/* <Action key={1} title="Select" onAction={() => execute(order)} /> */}
                  <Action title="Cancel Order" onAction={() => cancel(order._id)} />
                  <Action.Push title="Create New Order" target={<Create />} />
                  <Action.Push title="Replace Order" target={<Replace {...order} />} />
                  <Action title="Copy Id" onAction={() => Clipboard.copy(order._id)} />
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
                        : String(order.limitPrice) || "Market",
                    color: Color.Orange,
                  },
                  tooltip: "Price",
                },
                {
                  text: {
                    value:
                      String(order.amount * Math.pow(10, -order.mainCurrencyUnits)) || "Market",
                    color: order.sell ? Color.Red : Color.Green,
                  },
                  tooltip: "Amount",
                },
                {
                  text: {
                    value:
                      String(order.filled * Math.pow(10, -order.mainCurrencyUnits)) || "Market",
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
        </List.Section>
      ))}
    </List>
  );
}

function keyBy(arr, key) {
  return arr.reduce((result, obj) => {
    if (!result[obj[key]]) {
      result[obj[key]] = [];
    }
    result[obj[key]].push(obj);
    return result;
  }, {});
}
