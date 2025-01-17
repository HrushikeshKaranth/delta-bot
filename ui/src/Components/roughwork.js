if (isTradePlaced) {
    // upside
    if(btc_mark_price > entryStrike){
      if (btc_mark_price >= upStrike) {
        // console.log(entryStrike);
        // console.log(upStrike);
        // console.log(downStrike);
        console.log("Sold - " + upStrike + " PE");
        // placeOrder(getPutStrikeSymbol(upStrike),'sell')
        all.push(upStrike);
        open.push(upStrike);
        
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

      all.push(downStrike);
      open.push(downStrike);

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


  import React, { useState, useEffect } from "react";

const TradingStrategy = () => {
  const [entryPrice, setEntryPrice] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [positions, setPositions] = useState([]); // Array of open trades
  const [tradeLog, setTradeLog] = useState([]); // To log trades for display
  const socketUrl = "wss://example.com/prices"; // Replace with your WebSocket URL

  useEffect(() => {
    const socket = new WebSocket(socketUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data); // Assuming the server sends data as JSON
      const newPrice = data.price; // Replace 'price' with the actual key from your data
      setCurrentPrice(newPrice);

      // Initialize entry price if not set
      if (entryPrice === null) {
        setEntryPrice(newPrice);
        console.log(`Entry price set at ${newPrice}`);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => socket.close();
  }, [entryPrice]);

  useEffect(() => {
    if (entryPrice === null || currentPrice === null) return;

    if (currentPrice > entryPrice) {
      // Price is above entry price
      closeAllPositionsOfType("short"); // Close all short positions
      handleLongStrategy();
    } else if (currentPrice < entryPrice) {
      // Price is below entry price
      closeAllPositionsOfType("long"); // Close all long positions
      handleShortStrategy();
    }
  }, [currentPrice]);

  const handleLongStrategy = () => {
    const lastPosition = positions[positions.length - 1];
    const nextLongLevel =
      entryPrice + 100 * positions.filter((p) => p.type === "long" && p.price !== entryPrice).length;

    if (
      currentPrice >= nextLongLevel &&
      (!lastPosition || lastPosition.type === "short" || lastPosition.price !== nextLongLevel)
    ) {
      enterTrade("long", currentPrice);
    } else if (lastPosition?.type === "long" && lastPosition.price !== entryPrice && currentPrice < lastPosition.price) {
      exitTrade(currentPrice);
    }
  };

  const handleShortStrategy = () => {
    const lastPosition = positions[positions.length - 1];
    const nextShortLevel =
      entryPrice - 100 * positions.filter((p) => p.type === "short" && p.price !== entryPrice).length;

    if (
      currentPrice <= nextShortLevel &&
      (!lastPosition || lastPosition.type === "long" || lastPosition.price !== nextShortLevel)
    ) {
      enterTrade("short", currentPrice);
    } else if (lastPosition?.type === "short" && lastPosition.price !== entryPrice && currentPrice > lastPosition.price) {
      exitTrade(currentPrice);
    }
  };

  const enterTrade = (type, price) => {
    if (positions.some((p) => p.price === price)) return; // Avoid duplicate trades at the same price

    const newPosition = { type, price, time: new Date().toISOString() };
    setPositions((prev) => [...prev, newPosition]);
    setTradeLog((prev) => [...prev, `Entered ${type} trade at ${price}`]);
    console.log(`Entered ${type} trade at ${price}`);
  };

  const exitTrade = (price) => {
    const lastPosition = positions.pop(); // Remove the last position
    setPositions(positions);
    setTradeLog((prev) => [
      ...prev,
      `Exited ${lastPosition.type} trade at ${price} (Entered at ${lastPosition.price})`,
    ]);
    console.log(
      `Exited ${lastPosition.type} trade at ${price} (Entered at ${lastPosition.price})`
    );
  };

  const closeAllPositionsOfType = (type) => {
    const positionsToClose = positions.filter((p) => p.type === type);
    if (positionsToClose.length === 0) return;

    setPositions((prev) => prev.filter((p) => p.type !== type));
    positionsToClose.forEach((pos) => {
      setTradeLog((prev) => [
        ...prev,
        `Force exited ${pos.type} trade at ${currentPrice} (Entered at ${pos.price})`,
      ]);
      console.log(
        `Force exited ${pos.type} trade at ${currentPrice} (Entered at ${pos.price})`
      );
    });
  };

  return (
    <div>
      <h1>Trading Strategy</h1>
      <p>Entry Price: {entryPrice || "Not set"}</p>
      <p>Current Price: {currentPrice || "Fetching..."}</p>
      <h2>Open Positions</h2>
      <ul>
        {positions.map((pos, idx) => (
          <li key={idx}>
            {pos.type.toUpperCase()} at {pos.price} (Time: {pos.time})
          </li>
        ))}
      </ul>
      <h2>Trade Log</h2>
      <ul>
        {tradeLog.map((log, idx) => (
          <li key={idx}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default TradingStrategy;
