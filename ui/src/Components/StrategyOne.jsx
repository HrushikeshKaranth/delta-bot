// import React, { useState } from 'react'

import { useEffect, useRef, useState } from "react";
import { Stack } from "../Helpers/Stack";
import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';

function StrategyOne() {
  const { btc_mark_price, btc_current_strike, strike_distance } = useContext(GlobalContext);

  let [count, setCount] = useState(0);
  const [entryStrike, setEntryStrike] = useState(0);
  const [upStrike, setUpStrike] = useState(0);
  const [downStrike, setDownStrike] = useState(0);
  const intervalId = useRef();
  const [entries, setEntries] = useState(new Stack());
  const [isTradePlaced, setIsTradePlaced] = useState(false);

  function trade() {
    setEntryStrike(btc_current_strike);
    setDownStrike(btc_current_strike - strike_distance);
    setUpStrike(btc_current_strike + strike_distance);
    console.log("Trading started 🟢");
    console.log("Sold - " + btc_current_strike + " CE and PE");
    setIsTradePlaced(true)
    startTrading();
  }

  useEffect(() => {
    if (isTradePlaced) {
      // upside
      if (btc_mark_price >= upStrike && upStrike > entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        entries.push(upStrike);
        console.log("Sold - " + upStrike + " PE");
        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);
        // setPeCount(peCount = peCount + 1);
      }
      if (btc_mark_price <= downStrike && downStrike >= entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        let exit = entries.pop();
        console.log("Exited - " + exit + " PE");
        setDownStrike(btc_current_strike - strike_distance);
        setUpStrike(btc_current_strike + strike_distance);
      }

      // downside
      if (btc_mark_price <= downStrike && downStrike < entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        entries.push(downStrike);
        console.log("Sold - " + downStrike + " CE");
        setDownStrike(btc_current_strike - strike_distance);
        setUpStrike(btc_current_strike + strike_distance);
      }
      if (btc_mark_price >= upStrike && upStrike <= entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        let exit = entries.pop();
        console.log("Exited - " + exit + " CE");
        setUpStrike(btc_current_strike + strike_distance);
        setDownStrike(btc_current_strike - strike_distance);
        // setPeCount(peCount = peCount + 1);
      }
      console.log("Monitoring...");
    }
  }, [count])
  // Start trading
  // let count = 0;
  function check() {
    setCount(count = count + 1);
  }
  function startTrading() {
    console.log("Monitoring Trades 🟢");
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
      </div>
      <div>
        <div>Entries: </div>
        <div>
          {
            entries.items.map((item) => {
              return <div key={item}>{item}</div>
            })
          }
        </div>
      </div>
    </div>
  )
}

export default StrategyOne