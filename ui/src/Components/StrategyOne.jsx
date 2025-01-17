import { useEffect, useRef, useState } from "react";
import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";  // Styles for the datepicker
import { format } from 'date-fns';
import axios from "../Helpers/Axios";

function StrategyOne() {
  const { btc_mark_price, btc_current_strike, strike_distance, getProductId, generateSignature, api_key, api_secret, closeAllPosition } = useContext(GlobalContext);
  const [entryPrice, setEntryPrice] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [positions, setPositions] = useState([]); // Array of open trades
  const [tradeLog, setTradeLog] = useState([]); // To log trades for display


  const intervalId = useRef();

  let [count, setCount] = useState(0);
  const [entryStrike, setEntryStrike] = useState(0);
  const [upStrike, setUpStrike] = useState(0);
  const [downStrike, setDownStrike] = useState(0);
  const [isTradePlaced, setIsTradePlaced] = useState(false);
  const [contract, setContract] = useState('')
  const [selectedDate, setSelectedDate] = useState(null);
  // const [strikeSymbol, setStrikeSymbol] = useState();
  // Function to handle date selection and format (ddMMyy)
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setContract(date ? format(date, 'ddMMyy') : '');
    localStorage.setItem("contract", date ? format(date, 'ddMMyy') : '');
  };
  const [openStrikes, setOpenStrikes] = useState({ 'data': [] }); let open = openStrikes.data;
  const [closedStrikes, setClosedStrikes] = useState({ 'data': [] }); let closed = closedStrikes.data;
  const [allStrikes, setAllStrikes] = useState({ 'data': [] }); let all = allStrikes.data;
  const [isReloaded, setIsReloaded] = useState(false);
  const [isUpStrikePlaced, setIsUpStrikePlaced] = useState(false);
  const [isDownStrikePlaced, setIsDownStrikePlaced] = useState(false);
  // console.log(contract);

  function getDataBack() {
    // let data = ({ 'data': (localStorage.getItem("openStrikes")).split(',').map(Number) });
    let data = ({ 'data': (localStorage.getItem("allStrikes") ? localStorage.getItem("allStrikes").split(',') : []) });
    setAllStrikes(data);
    // console.log(data);
    data = ({ 'data': (localStorage.getItem("openStrikes") ? localStorage.getItem("openStrikes").split(',') : []) });
    setOpenStrikes(data);
    // console.log(data);
    data = ({ 'data': (localStorage.getItem("closedStrikes") ? localStorage.getItem("closedStrikes").split(',') : []) });
    setClosedStrikes(data);
    // console.log(data);

    setEntryStrike(localStorage.getItem('entryStrike'));
    setContract(localStorage.getItem('contract'));
    setDownStrike(btc_current_strike - strike_distance);
    setUpStrike(btc_current_strike + strike_distance);
    setIsReloaded(true);
  }

  function getCallStrikeSymbol(strike) {
    return 'C-BTC-' + strike + '-' + contract;
  }
  function getPutStrikeSymbol(strike) {
    return 'P-BTC-' + strike + '-' + contract;
  }


  const method = 'POST'
  const path = '/v2/orders'
  const query_string = ''
  // let api_secret = "QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY"

  function placeOrder(symbol, side) {
    // const headers =  getHeaders();
    // let symbol = 'C-BTC-'+95000+'-130125'
    console.log('Executing: ' + symbol);
    // let productId = getProductId(symbol);
    let payload = {
      "product_symbol": symbol,
      "size": 10,
      "side": side,
      "order_type": "market_order",
      "reduce_only": false
    }
    payload = JSON.stringify(payload);
    console.log(payload);

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
      .then((res) => { console.log(res); return true })
      .catch((err) => { console.log(err); return false })
  }

  function trade() {
    if (!isReloaded) {
      setEntryStrike(btc_current_strike);
      setDownStrike(btc_current_strike - strike_distance);
      setUpStrike(btc_current_strike + strike_distance);
      let call = getCallStrikeSymbol(btc_current_strike);
      let put = getPutStrikeSymbol(btc_current_strike);
      // let side = 'sell';
      // placeOrder(getCallStrikeSymbol(btc_current_strike), 'sell')
      // placeOrder(getPutStrikeSymbol(btc_current_strike), 'sell')

      console.log("Trading started 🟢");
      console.log("Sold - " + btc_current_strike + " CE and PE");
      console.log(call);
      console.log(put);
      setIsTradePlaced(true);
      startTrading();

      all.push(btc_current_strike + ' Short Straddle at - '+ btc_mark_price);
      localStorage.setItem("TimeStamp", new Date());
      localStorage.setItem("allStrikes", all);
      // localStorage.setItem("entryStrike", btc_current_strike);
    }
    if (isReloaded) {
      setIsTradePlaced(true);
      stopTrading();
      startTrading();
    };
  }

  useEffect(() => {
    if (isTradePlaced) {

      if (isUpStrikePlaced && btc_mark_price < entryStrike) {
        let exit = open.pop();
        all.push('Exited '+exit+' PE at - '+btc_mark_price);
        setIsUpStrikePlaced(false);
        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);
        console.log("Exited - " + exit + " PE");
      }
      else if (isDownStrikePlaced && btc_mark_price > entryPrice) {
        let exit = open.pop();
        all.push('Exited '+exit+' CE at - '+btc_mark_price);
        setIsDownStrikePlaced(false);
        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);
        console.log("Exited - " + exit + " CE");
      }
      // upside
      if (btc_mark_price > entryStrike) {
        // no downside entry should be present
        if (btc_mark_price >= upStrike) {
          // console.log(entryStrike);
          // console.log(upStrike);
          // console.log(downStrike);
          console.log("Sold - " + upStrike + " PE");
          // placeOrder(getPutStrikeSymbol(upStrike),'sell')
          all.push('Sold '+upStrike+' PE at - '+btc_mark_price);
          open.push(upStrike);
          
          setIsUpStrikePlaced(true);
          setIsDownStrikePlaced(false);
          setUpStrike(btc_current_strike + strike_distance);
          setDownStrike(btc_current_strike - strike_distance);

          localStorage.setItem("allStrikes", all);
          localStorage.setItem("openStrikes", open);
        }

        if (btc_mark_price <= downStrike) {
          // console.log(entryStrike);
          // console.log(upStrike);
          // console.log(downStrike);

          let exit = open.pop();
          console.log("Exited - " + exit + " PE");
          // placeOrder(getPutStrikeSymbol(exit),'buy')

          closed.push(exit);
          all.push('Exited '+exit+' PE at - '+btc_mark_price);

          setDownStrike(btc_current_strike - strike_distance);
          setUpStrike(btc_current_strike + strike_distance);

          localStorage.setItem("openStrikes", open);
          localStorage.setItem("closedStrikes", closed);
        }
        // if(btc <= entryStrike&& open.length-1 !=null)
      }
      // downside
      if (btc_mark_price <= downStrike && downStrike < entryStrike) {
        // console.log(entryStrike);
        // console.log(upStrike);
        // console.log(downStrike);
        console.log("Sold - " + downStrike + " CE");
        // placeOrder(getCallStrikeSymbol(downStrike),'sell')

        // all.push(downStrike);
        all.push('Sold '+downStrike+' CE at - '+btc_mark_price);
        open.push(downStrike);

        setIsUpStrikePlaced(false);
        setIsDownStrikePlaced(true);
        setDownStrike(btc_current_strike - strike_distance);
        setUpStrike(btc_current_strike + strike_distance);

        localStorage.setItem("allStrikes", all);
        localStorage.setItem("openStrikes", open);
      }
      if (btc_mark_price >= upStrike && upStrike <= entryStrike) {
        // console.log(entryStrike);
        // console.log(upStrike);
        // console.log(downStrike);

        let exit = open.pop();
        all.push('Exited '+exit+' CE at - '+btc_mark_price);
        console.log("Exited - " + exit + " CE");

        // placeOrder(getCallStrikeSymbol(exit),'buy')
        closed.push(exit);
        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);

        localStorage.setItem("openStrikes", open);
        localStorage.setItem("closedStrikes", closed);
      }
      console.log("Monitoring... 🟢");
    }
    else{
      console.log('Not Trading anything');
    }
  }, [btc_mark_price])


  // Start trading
  function check() {
    setCount(count = count + 1);
  }
  function startTrading() {
    // console.log("Monitoring Trades 🟢");
    console.log("Trade Monitor Started 🟢");
    // intervalId.current = setInterval(check, 1000)
  }
  function stopTrading() {
    console.log("Trade Monitor Stopped 🔴");
    clearInterval(intervalId.current)
  }

  return (
    <div className='section2'>
      <div>
        <div className="contractDate">
          <div>
            Contract: {contract}
          </div>
          <div>
            <DatePicker
              className="datepicker"
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy" // You can display the date in the format you prefer in the datepicker itself
              placeholderText="Select a date"
            />
          </div>
        </div>
        {/* <div>Market Price - {btc_mark_price}</div> */}
        {/* <div>Current Strike - {props.btcbtc_current_strike}</div>
        <div>Up Strike - {props.btcStrike.up}</div>
        <div>Down Strike - {props.btcStrike.down}</div> */}
      </div>
      <div>
        <div>Entry Strike - {entryStrike}</div>
        <div>Current Strike - {btc_current_strike}</div>
        <div>Up Strike - {upStrike}</div>
        <div>Down Strike - {downStrike}</div>
      </div>
      <div>
        <button onClick={trade}>Start Trading</button>
        <button onClick={stopTrading}>Stop Trading</button>
        <button onClick={closeAllPosition}>Close Positions</button>
        <button onClick={getDataBack}>Reload</button>
        {/* <button onClick={getDataBack}>Reset</button> */}
      </div>
      <div className="section3 entries">
        <div>
          <div><u>Open Entries</u></div>
          <div>
            {openStrikes.data.map((item, idx) => { return <div key={idx}>{item}</div> })}
          </div>
        </div>
        <div>
          <div><u>Closed Entries</u></div>
          <div>
            {closedStrikes.data.map((item, idx) => { return <div key={idx}>{item}</div> })}
          </div>
        </div>
        <div>
          <div><u>All Entries</u></div>
          <div>
            {allStrikes.data.map((item, idx) => { return <div key={idx}>{item}</div> })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyOne