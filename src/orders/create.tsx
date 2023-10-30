import { Form, ActionPanel, Action, useNavigation } from "@raycast/api";
import { useState, useEffect } from "react";
import orionx from "../providers/orionx/orionx";
import { create } from "../providers/orionx/orders/create";
import Command from "../index";

interface Order {
  marketCode: string;
  type: string;
  sell: boolean;
  limitPrice: number;
  amount: number;
}

const orderTypes = [
  { code: "limit" },
  { code: "market" },
  { code: "stopLimit" },
  { code: "stopMarket" },
  { code: "trailingStop" },
  { code: "trailingStopLimit" },
];

export function Create(props) {
  console.log("props", props);
  const [marketCode, setMarketCode] = useState<string>(props.marketCode ? props.marketCode : "");
  const [type, setType] = useState<string>(props.type ? props.type : "");
  const [sell, setSell] = useState<boolean>(props.sell ? props.sell : "false");
  const [limitPrice, setLimitPrice] = useState<string | null>(
    props.limitPrice ? String(props.limitPrice) : "",
  );
  const [amount, setAmount] = useState<string | null>(props.amount ? String(props.amount) : "");
  const [markets, setMarkets] = useState<any[]>([]);
  const { push } = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const remoteMarkets = await orionx.markets();
      console.log("remoteMarkets", remoteMarkets);
      setMarkets(remoteMarkets);
    };

    fetchData();
  }, []);

  const createSubmit = async (values: Order) => {
    const { marketCode, type, sell, limitPrice, amount } = values;
    await create(
      markets.find((market) => market.code === marketCode),
      type,
      sell,
      limitPrice,
      amount,
    );
    push(<Command />);
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={props.onSubmit || createSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="marketCode" title="MarketCode" value={marketCode} onChange={setMarketCode}>
        {markets.map((elem) => (
          <Form.Dropdown.Item key={elem.code} value={String(elem.code)} title={elem.code} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="type" title="Type" value={String(type)} onChange={setType}>
        {orderTypes.map((elem) => (
          <Form.Dropdown.Item key={elem.code} value={String(elem.code)} title={elem.code} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="sell" title="Sell" value={sell} onChange={setSell}>
        {["true", "false"].map((elem) => (
          <Form.Dropdown.Item key={elem} value={elem} title={elem} />
        ))}
      </Form.Dropdown>
      {type === "limit" && (
        <Form.TextField
          id="limitPrice"
          title="LimitPrice"
          value={limitPrice}
          onChange={setLimitPrice}
        />
      )}
      <Form.TextField id="amount" title="Amount" value={amount} onChange={setAmount} />
    </Form>
  );
}
