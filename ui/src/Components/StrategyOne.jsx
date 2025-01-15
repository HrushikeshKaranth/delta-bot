import { useEffect, useRef, useState } from "react";
import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';

function StrategyOne() {
  const { btc_mark_price, btc_current_strike, strike_distance } = useContext(GlobalContext);

  const intervalId = useRef();

  let [count, setCount] = useState(0);
  const [entryStrike, setEntryStrike] = useState(0);
  const [upStrike, setUpStrike] = useState(0);
  const [downStrike, setDownStrike] = useState(0);
  const [isTradePlaced, setIsTradePlaced] = useState(false);

  const [openStrikes, setOpenStrikes] = useState({ 'data': [] }); let open = openStrikes.data;
  const [closedStrikes, setClosedStrikes] = useState({ 'data': [] }); let closed = closedStrikes.data;
  const [allStrikes, setAllStrikes] = useState({ 'data': [] }); let all = allStrikes.data;


  function getDataBack() {
    let data = ({ 'data': (localStorage.getItem("openStrikes")).split(',').map(Number) });
    setOpenStrikes(data);
    data = ({ 'data': (localStorage.getItem("closedStrikes")).split(',').map(Number) });
    setClosedStrikes(data);
    data = ({ 'data': (localStorage.getItem("allStrikes")).split(',').map(Number) });
    setAllStrikes(data);

    setEntryStrike(localStorage.getItem('entryStrike'))
    setDownStrike(btc_current_strike - strike_distance);
    setUpStrike(btc_current_strike + strike_distance);
  }

  function trade() {
    setEntryStrike(btc_current_strike);
    setDownStrike(btc_current_strike - strike_distance);
    setUpStrike(btc_current_strike + strike_distance);

    console.log("Trading started 🟢");
    console.log("Sold - " + btc_current_strike + " CE and PE");

    setIsTradePlaced(true)
    startTrading();

    all.push(btc_current_strike);
    localStorage.setItem("allStrikes", all);
    localStorage.setItem("entryStrike", btc_current_strike);

  }

  useEffect(() => {
    if (isTradePlaced) {
      // upside
      if (btc_mark_price >= upStrike && upStrike > entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        console.log("Sold - " + upStrike + " PE");

        all.push(upStrike);
        open.push(upStrike);

        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);

        localStorage.setItem("allStrikes", all);
        localStorage.setItem("openStrikes", open);
      }

      if (btc_mark_price <= downStrike && downStrike >= entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);

        let exit = open.pop();
        console.log("Exited - " + exit + " PE");

        closed.push(exit);

        setDownStrike(btc_current_strike - strike_distance);
        setUpStrike(btc_current_strike + strike_distance);

        localStorage.setItem("openStrikes", open);
        localStorage.setItem("closedStrikes", closed);
      }

      // downside
      if (btc_mark_price <= downStrike && downStrike < entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        console.log("Sold - " + downStrike + " CE");

        all.push(downStrike);
        open.push(downStrike);

        setDownStrike(btc_current_strike - strike_distance);
        setUpStrike(btc_current_strike + strike_distance);

        localStorage.setItem("allStrikes", all);
        localStorage.setItem("openStrikes", open);
      }
      if (btc_mark_price >= upStrike && upStrike <= entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        
        let exit = open.pop();

        console.log("Exited - " + exit + " CE");

        closed.push(exit);
        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);

        localStorage.setItem("openStrikes", open);
        localStorage.setItem("closedStrikes", closed);
      }
      console.log("Monitoring... 🟢");
    }
  }, [count])


  // Start trading
  function check() {
    setCount(count = count + 1);
  }
  function startTrading() {
    // console.log("Monitoring Trades 🟢");
    intervalId.current = setInterval(check, 1000)
  }
  function stopTrading() {
    console.log("Trade Monitor Stopped 🔴");
    clearInterval(intervalId.current)
  }

  return (
    <div className='section2'>
      <div>
        <div>Market Price - {btc_mark_price}</div>
        <div>Current Strike - {btc_current_strike}</div>
        {/* <div>Current Strike - {props.btcbtc_current_strike}</div>
        <div>Up Strike - {props.btcStrike.up}</div>
        <div>Down Strike - {props.btcStrike.down}</div> */}
      </div>
      <div>
        <div>Entry Strike - {entryStrike}</div>
        <div>Up Strike - {upStrike}</div>
        <div>Down Strike - {downStrike}</div>
      </div>
      <div>
        <button onClick={trade}>Start Trading</button>
        <button onClick={stopTrading}>Stop Trading</button>
        <button onClick={getDataBack}>Reload</button>
      </div>
      <div className="section3 entries">
        <div>
          <div><u>Open Entries</u></div>
          <div>
            {openStrikes.data.map((item) => { return <div key={item}>{item}</div> })}
          </div>
        </div>
        <div>
          <div><u>Closed Entries</u></div>
          <div>
            {closedStrikes.data.map((item) => { return <div key={item}>{item}</div> })}
          </div>
        </div>
        <div>
          <div><u>All Entries</u></div>
          <div>
            {allStrikes.data.map((item) => { return <div key={item}>{item}</div> })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StrategyOne