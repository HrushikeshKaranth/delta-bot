import { useEffect, useRef, useState } from "react";
import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";  // Styles for the datepicker
import { format } from 'date-fns';
import axios from "../Helpers/Axios";

function StrategyThree() {
    const { btc_mark_price, btc_current_strike, strike_distance, getProductId, generateSignature, api_key, api_secret, closeAllPosition } = useContext(GlobalContext);

    // const [entryLevel, setEntryLevel] = useState(null);
    // const [btc_mark_price, setbtc_mark_price] = useState(null);
    // const [positions, setPositions] = useState([]); // Array of open trades
    // const [tradeLog, setTradeLog] = useState([]); // To log trades for display
    const [isTradePlaced, setIsTradePlaced] = useState(false);

    const [entryPrice, setEntryPrice] = useState(null); // Initial price for the first straddle
    const [positions, setPositions] = useState([]); // Open trades
    const [tradeLog, setTradeLog] = useState([]); // Logs of trades
    const [activeStrikes, setActiveStrikes] = useState({ put: null, call: null }); // Active options for adjustments
    const [contract, setContract] = useState('')
    const [selectedDate, setSelectedDate] = useState(null);
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setContract(date ? format(date, 'ddMMyy') : '');
        localStorage.setItem("contract", date ? format(date, 'ddMMyy') : '');
    };

    function startTrading() {
        setEntryPrice(btc_current_strike);
        enterTrade("short_put", btc_current_strike);
        enterTrade("short_call", btc_current_strike);
        console.log(`Short straddle created at ${entryPrice}`);
        setIsTradePlaced(true);
        console.log("Trading started 🟢");
    }

    useEffect(() => {
        if (isTradePlaced) {

            if (btc_mark_price === null) return;
            else {
                // Handle price movements
                handlePriceMovement();
            }
        }
    }, [btc_mark_price]);

    const handlePriceMovement = () => {
        const nearestStrike = Math.round(btc_mark_price / strike_distance) * strike_distance;

        if (btc_mark_price > entryPrice) {
            // Price is moving up
            handleUpwardMovement(nearestStrike);
        } else if (btc_mark_price < entryPrice) {
            // Price is moving down
            handleDownwardMovement(nearestStrike);
        }
    };

    const handleUpwardMovement = (nearestStrike) => {
        const lastStrike = positions
            .filter((pos) => pos.type === "short_put")
            .map((pos) => pos.strike)
            .sort((a, b) => b - a)[0]; // Highest strike PUT sold

        if (!positions.some((pos) => pos.type === "short_put" && pos.strike === nearestStrike)) {
            if (lastStrike === undefined || nearestStrike > lastStrike) {
                enterTrade("short_put", nearestStrike);
                console.log(`Sold PUT at strike ${nearestStrike}`);
            }
        }

        // Exit PUTs if price reverses
        positions
            .filter((pos) => pos.type === "short_put" && pos.strike > nearestStrike)
            .forEach((pos) => exitTrade("short_put", pos.strike));
    };

    const handleDownwardMovement = (nearestStrike) => {
        const lastStrike = positions
            .filter((pos) => pos.type === "short_call")
            .map((pos) => pos.strike)
            .sort((a, b) => a - b)[0]; // Lowest strike CALL sold

        if (!positions.some((pos) => pos.type === "short_call" && pos.strike === nearestStrike)) {
            if (lastStrike === undefined || nearestStrike < lastStrike) {
                enterTrade("short_call", nearestStrike);
                console.log(`Sold CALL at strike ${nearestStrike}`);
            }
        }

        // Exit CALLs if price reverses
        positions
            .filter((pos) => pos.type === "short_call" && pos.strike < nearestStrike)
            .forEach((pos) => exitTrade("short_call", pos.strike));
    };

    const enterTrade = (type, strike) => {
        if (positions.some((pos) => pos.type === type && pos.strike === strike)) return;

        const newPosition = { type, strike, time: new Date().toISOString() };
        setPositions((prev) => [...prev, newPosition]);
        setTradeLog((prev) => [...prev, `Entered ${type.toUpperCase()} at strike ${strike}`]);
        console.log(`Entered ${type.toUpperCase()} at strike ${strike}`);
    };

    const exitTrade = (type, strike) => {
        setPositions((prev) =>
            prev.filter((pos) => !(pos.type === type && pos.strike === strike))
        );
        setTradeLog((prev) => [...prev, `Exited ${type.toUpperCase()} at strike ${strike}`]);
        console.log(`Exited ${type.toUpperCase()} at strike ${strike}`);
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
                <div>Entry Strike - {entryPrice || "Not set"}</div>
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

export default StrategyThree