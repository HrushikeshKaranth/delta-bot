// import React, { useState } from 'react'

import { useRef, useState } from "react";
import { Stack } from "../Helpers/HelperFunctions";

function StrategyOne(props) {
  let btc = props.bitcoin;
  let strike = props.btcStrike;
  const [ceCount, setCeCount] = useState(0);
  const [peCount, setPeCount] = useState(0);
  const [entryStrike, setEntryStrike] = useState(0);
  const [upStrike, setUpStrike] = useState(0);
  const [downStrike, setDownStrike] = useState(0);
  const intervalId = useRef();
  const[entries, setEntries] = useState(new Stack());
  // let entries = new Stack(); // stack to keep track of entries
  // let strikeDistance = 200
  // let currentStrike = (Math.round(btc / strikeDistance) * strikeDistance)
  // let oneStrikeUp = (Number(currentStrike)+strikeDistance)
  // let oneStrikeDown = (Number(currentStrike)-strikeDistance)

  // console.log(oneStrikeDown, currentStrike, oneStrikeUp);

  async function trade() {
    setEntryStrike(strike.current);
    setDownStrike(strike.current - 200);
    setUpStrike(strike.current + 200);
    console.log("Start price - " + btc);
    console.log("Sold - " + strike.current + " CE and PE");
    entries.push(strike.current+" CE");
    console.log(entries.items);
  }

  // Function containing Trading Logic
  function monitor() {
    if (btc >= upStrike) {
      entries.push(upStrike);
      setUpStrike(strike.current + 200);
      console.log("Sold - " + upStrike + " PE");
      // setPeCount(peCount = peCount + 1);
    }
    if (btc <= downStrike) {
      entries.push(downStrike);
      setDownStrike(strike.current - 200);
      console.log("Sold - " + downStrike + " CE");
    }
  }


  // Start trading
  let count = 0;
  function check() {
    count++;
    console.log(count);
  }
  function startTrading() {
    intervalId.current = setInterval(check, 1000)
    // setFeed(feedIntervalId);
    console.log('Trade Monitor started ✔');
  }
  function stopTrading() {
    clearInterval(intervalId.current)
    console.log('Trade Monitor Stopped ❌');
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
      <button onClick={trade}>Start Trading</button>
      <button onClick={startTrading}>Start</button>
      <button onClick={stopTrading}>Stop</button>
      <div>
        {
          entries.items.map((item)=>{
            return <span key={item}>{item}</span>
          })
        }
      </div>
    </div>
  )
}

export default StrategyOne