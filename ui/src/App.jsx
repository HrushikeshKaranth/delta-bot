import './Styles/style.css'
import StrategyOne from "./Components/StrategyOne";
import BtcPrice from './Components/BtcPrice';
import Login from './Components/Login';
import { api_key, getProductId, generateSignature } from "./Helpers/HelperFunctions";
import axios from './Helpers/Axios';
import { GlobalProvider } from './Context/GlobalState';
import StrategyTwo from './Components/StrategyTwo';
import StrategyThree from './Components/StrategyThree';
import StrategyFour from './Components/StrategyFour';

function App() {

  function placeOrder(){
    // const headers =  getHeaders();
    let api_secret = "QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY"
    let symbol = 'C-BTC-'+99200+'-170125'
    // let id = getProductId(symbol)
    let payload  = {
      "product_symbol": symbol,
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
    axios({
      method: 'POST',
      url: '/orders',
      headers: reqHeaders,
      data: payload  // 'data' is used instead of 'body' in axios
  })
    .then((res)=>{console.log(res);})
    .catch((err)=>{console.log(err);})

  }

  return (
    <GlobalProvider>
      <div className="main">

        <div className="section profile">
          <Login/>
        </div>

        <div className="section currencies">
              <BtcPrice/>
        </div>

        {/* <div>
          <StrategyOne />
        </div> */}
        <div>
          <StrategyFour />
        </div>
        {/* <div>
          <button onClick={placeOrder}>Place order</button>
        </div> */}
        {/* <div>
          <StrategyTwo />
        </div> */}
        {/* <div>
          <StrategyThree />
        </div> */}
      </div>
    </GlobalProvider>
  )
}

export default App;
