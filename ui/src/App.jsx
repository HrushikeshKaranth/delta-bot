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
