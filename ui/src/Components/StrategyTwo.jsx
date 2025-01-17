import { useEffect, useRef, useState } from "react";
import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";  // Styles for the datepicker
import { format } from 'date-fns';
import axios from "../Helpers/Axios";

function StrategyTwo() {
    const { btc_mark_price, btc_current_strike, strike_distance, getProductId, generateSignature, api_key, api_secret, closeAllPosition } = useContext(GlobalContext);

    const [entryLevel, setEntryLevel] = useState(null);
    // const [btc_mark_price, setbtc_mark_price] = useState(null);
    const [positions, setPositions] = useState([]); // Array of open trades
    const [tradeLog, setTradeLog] = useState([]); // To log trades for display
    const [isTradePlaced, setIsTradePlaced] = useState(false);
    const socketUrl = "wss://example.com/prices"; // Replace with your WebSocket URL

    function startTrading(){
        setEntryLevel(btc_current_strike);
        setIsTradePlaced(true);
        console.log("Trading started 🟢");
    }
    // useEffect(() => {
    //     const socket = new WebSocket(socketUrl);

    //     socket.onmessage = (event) => {
    //         const data = JSON.parse(event.data); // Assuming the server sends data as JSON
    //         const newPrice = data.price; // Replace 'price' with the actual key from your data
    //         setbtc_mark_price(newPrice);

    //         // Initialize entry price if not set
    //         if (entryLevel === null) {
    //             setentryLevel(newPrice);
    //             console.log(`Entry price set at ${newPrice}`);
    //         }
    //     };

    //     socket.onerror = (error) => {
    //         console.error("WebSocket Error:", error);
    //     };

    //     socket.onclose = () => {
    //         console.log("WebSocket connection closed");
    //     };

    //     return () => socket.close();
    // }, [entryLevel]);

    useEffect(() => {
        if(isTradePlaced){
            if (entryLevel === null || btc_mark_price === null) return;
    
            if (btc_mark_price > entryLevel) {
                // Price is above entry price
                closeAllPositionsOfType("short"); // Close all short positions
                handleLongStrategy();
            } else if (btc_mark_price < entryLevel) {
                // Price is below entry price
                closeAllPositionsOfType("long"); // Close all long positions
                handleShortStrategy();
            }
        }
    }, [btc_mark_price]);

    const handleLongStrategy = () => {
        const lastPosition = positions[positions.length - 1];
        const nextLongLevel =
            entryLevel + strike_distance * positions.filter((p) => p.type === "long" && p.price !== entryLevel).length;

        if (
            btc_mark_price >= nextLongLevel &&
            (!lastPosition || lastPosition.type === "short" || lastPosition.price !== nextLongLevel)
        ) {
            enterTrade("long", nextLongLevel);
        } else if (lastPosition?.type === "long" && lastPosition.price !== entryLevel && btc_mark_price < lastPosition.price) {
            exitTrade(nextLongLevel);
        }
    };

    const handleShortStrategy = () => {
        const lastPosition = positions[positions.length - 1];
        const nextShortLevel =
            entryLevel - strike_distance * positions.filter((p) => p.type === "short" && p.price !== entryLevel).length;

        if (
            btc_mark_price <= nextShortLevel &&
            (!lastPosition || lastPosition.type === "long" || lastPosition.price !== nextShortLevel)
        ) {
            enterTrade("short", nextShortLevel);
        } else if (lastPosition?.type === "short" && lastPosition.price !== entryLevel && btc_mark_price > lastPosition.price) {
            exitTrade(nextShortLevel);
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
                `Force exited ${pos.type} trade at ${btc_mark_price} (Entered at ${pos.price})`,
            ]);
            console.log(
                `Force exited ${pos.type} trade at ${btc_mark_price} (Entered at ${pos.price})`
            );
        });
    };

    return (
        <div>
            <h1>Trading Strategy</h1>
            <p>Entry Price: {entryLevel || "Not set"}</p>
            <p>Current Price: {btc_mark_price || "Fetching..."}</p>
            <div>
                <button onClick={startTrading}>Place trade</button>
            </div>
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
}

export default StrategyTwo