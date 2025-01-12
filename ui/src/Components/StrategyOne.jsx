// import React, { useState } from 'react'

import { useEffect, useRef, useState } from "react";
import { Stack } from "../Helpers/HelperFunctions";

function StrategyOne(props) {
  let btc = props.bitcoin;
  let strike = props.btcStrike;
  const [ceCount, setCeCount] = useState(0);
  const [peCount, setPeCount] = useState(0);
  let [count, setCount] = useState(0);
  const [entryStrike, setEntryStrike] = useState(0);
  const [upStrike, setUpStrike] = useState(0);
  const [downStrike, setDownStrike] = useState(0);
  const intervalId = useRef();
  const [entries, setEntries] = useState(new Stack());
  const [isTradePlaced, setIsTradePlaced] = useState(false)


  // console.log(count);
  // let entries = new Stack(); // stack to keep track of entries
  // let strikeDistance = 200
  // let currentStrike = (Math.round(btc / strikeDistance) * strikeDistance)
  // let oneStrikeUp = (Number(currentStrike)+strikeDistance)
  // let oneStrikeDown = (Number(currentStrike)-strikeDistance)

  // console.log(oneStrikeDown, currentStrike, oneStrikeUp);

  function trade() {
    setEntryStrike(strike.current);
    setDownStrike(strike.current - 200);
    setUpStrike(strike.current + 200);
    console.log("Start price - " + btc);
    console.log("Sold - " + strike.current + " CE and PE");
    setIsTradePlaced(true)
    startTrading();
    // entries.push(strike.current+" CE");
    // console.log(entries.items);
  }

  // Function containing Trading Logic
  function monitorTrades() {
    //upside
    console.log(entryStrike);
    console.log(upStrike);
    console.log(downStrike);

    if (btc >= upStrike && upStrike > entryStrike) {
      console.log(entryStrike);
      console.log(upStrike);
      console.log(downStrike);
      entries.push(upStrike);
      setUpStrike(strike.current + 200);
      setDownStrike(strike.current - 200);
      console.log("Sold - " + upStrike + " PE");
      // setPeCount(peCount = peCount + 1);
    }
    if (btc <= downStrike && downStrike >= entryStrike) {
      console.log(entryStrike);
      console.log(upStrike);
      console.log(downStrike);
      let exit = entries.pop();
      setDownStrike(strike.current - 200);
      setUpStrike(strike.current + 200);
      console.log("Exited - " + exit + " CE");
    }

    // downside
    if (btc <= downStrike && downStrike < entryStrike) {
      console.log(entryStrike);
      console.log(upStrike);
      console.log(downStrike);
      entries.push(upStrike);
      setDownStrike(strike.current - 200);
      setUpStrike(strike.current + 200);
      console.log("Sold - " + downStrike + " PE");
    }
    if (btc >= upStrike && upStrike <= entryStrike) {
      console.log(entryStrike);
      console.log(upStrike);
      console.log(downStrike);
      let exit = entries.pop();
      setUpStrike(strike.current + 200);
      setDownStrike(strike.current - 200);
      console.log("Exited - " + exit + " CE");
      // setPeCount(peCount = peCount + 1);
    }
    console.log("Monitoring...");
  }

  useEffect(() => {
    if (isTradePlaced) {
      if (btc >= upStrike && upStrike > entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        entries.push(upStrike);
        console.log("Sold - " + upStrike + " PE");
        setUpStrike(strike.current + 200);
        setDownStrike(strike.current - 200);
        // setPeCount(peCount = peCount + 1);
      }
      if (btc <= downStrike && downStrike >= entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        let exit = entries.pop();
        console.log("Exited - " + exit + " CE");
        setDownStrike(strike.current - 200);
        setUpStrike(strike.current + 200);
      }

      // downside
      if (btc <= downStrike && downStrike < entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        entries.push(downStrike);
        console.log("Sold - " + downStrike + " PE");
        setDownStrike(strike.current - 200);
        setUpStrike(strike.current + 200);
      }
      if (btc >= upStrike && upStrike <= entryStrike) {
        console.log(entryStrike);
        console.log(upStrike);
        console.log(downStrike);
        let exit = entries.pop();
        console.log("Exited - " + exit + " CE");
        setUpStrike(strike.current + 200);
        setDownStrike(strike.current - 200);
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
        <div>Market Price - {props.bitcoin}</div>
        {/* <div>Current Strike - {props.btcStrike.current}</div>
        <div>Up Strike - {props.btcStrike.up}</div>
        <div>Down Strike - {props.btcStrike.down}</div> */}
      </div>
      <div>
        <div>Entry Strike - {entryStrike}</div>
        <div>Up Strike - {upStrike}</div>
        <div>Down Strike - {downStrike}</div>
        {/* <div>CE Count - {ceCount}</div> */}
        {/* <div>PE Count - {peCount}</div> */}
      </div>
      <div>
        <button onClick={trade}>Start Trading</button>
        {/* <button onClick={startTrading}>Start</button> */}
        <button onClick={stopTrading}>Stop Trading</button>
      </div>
      <div>
        <div>Entries</div>
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