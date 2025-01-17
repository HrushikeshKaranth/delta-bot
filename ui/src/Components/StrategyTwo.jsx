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
    const [contract, setContract] = useState('')
    const [selectedDate, setSelectedDate] = useState(null);
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setContract(date ? format(date, 'ddMMyy') : '');
        localStorage.setItem("contract", date ? format(date, 'ddMMyy') : '');
    };
    const [isTradePlaced, setIsTradePlaced] = useState(false);
    const [nextLongLevel, setNextLongLevel] = useState(0)
    const [nextShortLevel, setNextShortLevel] = useState(0)
    // const nextLongLevel = 0;
    // const nextShortLevel = 0;
    const socketUrl = "wss://example.com/prices"; // Replace with your WebSocket URL

    function startTrading() {
        setEntryLevel(btc_current_strike);
        setIsTradePlaced(true);
        // setNextLongLevel(entryLevel + strike_distance * positions.filter((p) => p.type === "long").length)
        // console.log(nextLongLevel);
        // setNextShortLevel(entryLevel + strike_distance * positions.filter((p) => p.type === "short").length)
        // console.log(nextShortLevel);
        // nextLongLevel = entryLevel + strike_distance * positions.filter((p) => p.type === "long").length;
        // nextShortLevel = entryLevel + strike_distance * positions.filter((p) => p.type === "short").length;
        console.log("Trading started 🟢");
        console.log("Entered trade at " + btc_current_strike);
    }

    useEffect(() => {
        if (isTradePlaced) {
            if (entryLevel === null || btc_mark_price === null) return;

            if (btc_mark_price > entryLevel + strike_distance) {
                setNextLongLevel(entryLevel + strike_distance * positions.filter((p) => p.type === "long").length)
                console.log(nextLongLevel);                // Price is above entry price
                closeAllPositionsOfType("short"); // Close all short positions
                handleLongStrategy();
            } else if (btc_mark_price < entryLevel - strike_distance) {
                setNextShortLevel(entryLevel + strike_distance * positions.filter((p) => p.type === "short").length)
                console.log(nextShortLevel);
                // Price is below entry price
                closeAllPositionsOfType("long"); // Close all long positions
                handleShortStrategy();
            }
        }
    }, [btc_mark_price]);

    const handleLongStrategy = () => {
        const lastPosition = positions[positions.length - 1];
        // nextLongLevel =
        //     entryLevel + strike_distance * positions.filter((p) => p.type === "long").length;
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
        // nextShortLevel =
        //     entryLevel - strike_distance * positions.filter((p) => p.type === "short").length;
        console.log(nextShortLevel);
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
                <div>Entry Strike - {entryLevel || "Not set"}</div>
                <div>Current Strike - {btc_mark_price || "Not Fetching..."}</div>
                {/* <div>Up Strike - {upStrike}</div> */}
                {/* <div>Down Strike - {downStrike}</div> */}
            </div>
            <div>
                <button onClick={startTrading}>Start Trading</button>

                {/* <button onClick={trade}>Start Trading</button>
            <button onClick={stopTrading}>Stop Trading</button>
            <button onClick={closeAllPosition}>Close Positions</button>
            <button onClick={getDataBack}>Reload</button> */}
            </div>
            <div className="section3 entries">
                <div>
                    <div><u>Open Entries</u></div>
                    <div>
                        {positions.map((pos, idx) => (
                            <div key={idx}>
                                {pos.type.toUpperCase()} at {pos.price} (Time: {pos.time})
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div><u>Trade Log</u></div>
                    <div>
                        {tradeLog.map((log, idx) => (
                            <div key={idx}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StrategyTwo