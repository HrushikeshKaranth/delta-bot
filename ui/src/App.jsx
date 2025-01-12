import './Styles/style.css'
import { useEffect, useRef, useState } from "react";
import StrategyOne from "./Components/StrategyOne";
import { getProfileInfo, api_key, getHeaders, getProductId, generateSignature, api_secret } from "./Helpers/HelperFunctions";
import axios from './Helpers/Axios';
// import CryptoJS from "crypto-js";

function App() {

  const [btc, setBtc] = useState(0);
  const [btcStrike, setBtcStrike] = useState({ current: 0, up: 0, down: 0 });
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const strikeDistance = 200;

  // handling btc strike updates
  useEffect(() => {
    setBtcStrike(prevState => ({
      ...prevState,
      current: Math.round(btc / strikeDistance) * strikeDistance,
      up: Math.round(btc / strikeDistance) * strikeDistance + 200,
      down: Math.round(btc / strikeDistance) * strikeDistance - 200
    }))
  }, [btc])

  // creating web socket
  const wsRef = useRef();
  if (!wsRef.current) {
    wsRef.current = new WebSocket('wss://socket.india.delta.exchange');
  }

  const subscribe = {
    "type": "subscribe",
    "payload": {
      "channels": [
        {
          "name": "v2/ticker",
          "symbols": [
            "BTCUSD"
          ]
        }
      ]
    }
  }

  // Function to start web socket and stream price updates
  function getQuotes() {
    wsRef.current.onopen = (event) => {
      wsRef.current.send(JSON.stringify(subscribe));
    };
    wsRef.current.onmessage = function (event) {
      let json;
      try {
        json = JSON.parse(event.data);
        if (json.symbol === "BTCUSD") setBtc(parseInt(json.mark_price))
      } catch (err) { console.log(err) }
    };
    wsRef.current.onopen();
    wsRef.current.onmessage();
    console.log('Price stream started 🟢');
  }

  // Function to close web socket
  function closeQuotes() {
    wsRef.current.close();
    console.log("Price stream closed 🔴");
  }

  async function placeOrder(){
    // const headers =  getHeaders();
    let api_secret = "QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY"
    let symbol = 'C-BTC-'+btcStrike.up+'-130125'
    let payload  = {
      "product_id": await getProductId(symbol),
      "size": 10,
      "side": "sell",
      "order_type": "market_order"
    }
    payload = JSON.stringify(payload);
    const method = 'POST'
    const path = '/v2/orders'
    const query_string = ''
    // timestamp in epoch unix format
    const timestamp = Date.now() / 1000 | 0
    const signature_data = method + timestamp + path + query_string + payload;
    const signature = generateSignature(api_secret, signature_data)   
    let reqHeaders = {
      'api-key': api_key,
      'timestamp': timestamp,
      'signature': signature,
      'Content-Type': 'application/json'
  }
    await axios({
      method: 'POST',
      url: '/orders',
      headers: reqHeaders,
      data: payload  // 'data' is used instead of 'body' in axios
  })
    .then((res)=>{console.log(res);})
    .catch((err)=>{console.log(err);})

  }

  return (
    <>
      <div className="main">

        <div className="section profile">
          <div className="name">
            <div><u>Username</u> - {username}</div>
            <div><u>Email</u> - {email}</div>
          </div>

          <div className="login">
            <button className="loginButton"
              onClick={async () => {
                let data = await getProfileInfo();
                setUsername(data.username);
                setEmail(data.email);
              }}
            >Login</button>
          </div>
        </div>

        <div className="section currencies">
          <div>
            <div><u>Bitcoin</u> - {btc}</div>
            {/* <div><u>Strike</u> - {btcStrike.current}</div> */}
            {/* <div><u>UpStrike</u> - {btcStrike.up}</div> */}
            {/* <div><u>DownStrike</u> - {btcStrike.down}</div> */}
          </div>

          <div>
            <button onClick={getQuotes}>Start Stream</button>
            <button onClick={closeQuotes}>Stop Stream</button>
          </div>
        </div>

        <div>
          <StrategyOne bitcoin={btc} btcStrike={btcStrike} />
        </div>
        <div>
          <button onClick={placeOrder}>Place order</button>
        </div>
      </div>
    </>
  )
}

export default App;
