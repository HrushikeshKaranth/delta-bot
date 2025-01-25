import { useEffect, useState } from "react";
import React, { useContext } from 'react'
import { BTC_STRIKE_DISTANCE, GlobalContext } from '../Context/GlobalState';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";  // Styles for the datepicker
import { format } from 'date-fns';
import axios from "../Helpers/Axios";

function StrategyFour() {
    // Context 
    const { isAuth, isConnected, btc_mark_price, btc_current_strike, btcStrikeDistance, setBtcStrikeDistance, strike_distance, generateSignature, api_key, api_secret, closeAllPosition } = useContext(GlobalContext);
    // console.log(btcStrikeDistance);
    // console.log(strike_distance);
    // console.log(BTC_STRIKE_DISTANCE);
    // States
    const [entryStrike, setEntryStrike] = useState(0);
    let [upStrike, setUpStrike] = useState(0);
    let [downStrike, setDownStrike] = useState(0);
    const [openStrikes, setOpenStrikes] = useState({ 'data': [] }); let open = openStrikes.data;
    const [closedStrikes, setClosedStrikes] = useState({ 'data': [] }); let closed = closedStrikes.data;
    const [allStrikes, setAllStrikes] = useState({ 'data': [] }); let all = allStrikes.data;
    const [contract, setContract] = useState('')
    // let [putStrikes, setPutStrikes] = useState([]);
    let [putStrikesSorted, setPutStrikesSorted] = useState({ 'data': [] }); let putStrikesData = putStrikesSorted.data
    let putStrikesSortedArr = [];
    let [putStrikesIndex, setPutStrikesIndex] = useState([]);
    // let [callStrikes, setCallStrikes] = useState([]);
    let [callStrikesSorted, setCallStrikesSorted] = useState({ 'data': [] }); let callStrikesData = callStrikesSorted.data
    let callStrikesSortedArr = [];
    let [callStrikesIndex, setCallStrikesIndex] = useState([]);

    const [selectedDate, setSelectedDate] = useState(null);
    // Function to handle date format for the contract
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setContract(date ? format(date, 'ddMMyy') : '');
        localStorage.setItem("contract", date ? format(date, 'ddMMyy') : '');
    };

    const [isReloaded, setIsReloaded] = useState(false);
    const [isUpStrikePlaced, setIsUpStrikePlaced] = useState(false);
    const [isDownStrikePlaced, setIsDownStrikePlaced] = useState(false);
    const [isTradePlaced, setIsTradePlaced] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false)
    const [isStrikesLoaded, setIsStrikesLoaded] = useState(false)

    // Function to reload all the date from localstorage
    function getDataBack() {
        let data = ({ 'data': (localStorage.getItem("allStrikes") ? localStorage.getItem("allStrikes").split(',') : []) });
        setAllStrikes(data);

        data = ({ 'data': (localStorage.getItem("openStrikes") ? localStorage.getItem("openStrikes").split(',') : []) });
        setOpenStrikes(data);

        data = ({ 'data': (localStorage.getItem("closedStrikes") ? localStorage.getItem("closedStrikes").split(',') : []) });
        setClosedStrikes(data);

        setEntryStrike(localStorage.getItem('entryStrike'));
        setContract(localStorage.getItem('contract'));
        setDownStrike(localStorage.getItem('downStrike'));
        setUpStrike(localStorage.getItem('upStrike'));
        setBtcStrikeDistance(localStorage.getItem('strikeDistance'));
        setIsReloaded(true);
    }

    // Function to return contract symbol for calls
    function getCallStrikeSymbol(strike) {
        return 'C-BTC-' + strike + '-' + contract;
        // return 'C-ETH-' + strike + '-' + contract;
    }
    // Function to return contract symbol for puts
    function getPutStrikeSymbol(strike) {
        return 'P-BTC-' + strike + '-' + contract;
        // return 'P-ETH-' + strike + '-' + contract;
    }

    // Function to place orders
    function placeOrder(symbol, side) {
        console.log('Executing: ' + symbol);
        let bestBid = 0;
        axios.get(`/l2orderbook/${symbol}`)
            .then((res) => {
                console.log(res);
                if (side == 'sell')
                    bestBid = res.data.result.buy[0].price;
                if (side == 'buy')
                    bestBid = res.data.result.sell[0].price;
                console.log(bestBid);
            })
            .catch((err) => {
                console.log(err);
            })
        const method = 'POST'
        const path = '/v2/orders'
        const query_string = ''
        let payload = {
            "product_symbol": symbol,
            "size": 100,
            "side": side,
            "order_type": "limit_order",
            "limit_price": bestBid,
            "reduce_only": false
        }
        payload = JSON.stringify(payload);
        const timestamp = Date.now() / 1000 | 0; // timestamp in epoch unix format
        const signature_data = method + timestamp + path + query_string + payload;
        const signature = generateSignature(api_secret, signature_data)
        let reqHeaders = {
            'api-key': api_key,
            'timestamp': timestamp,
            'signature': signature,
            'Content-Type': 'application/json'
        }

        // let activeOrderBody ={
        //     'product'
        // }
        // const activeOrdersPath = 'v2/orders';

        axios({
            method: 'POST',
            url: '/orders',
            headers: reqHeaders,
            data: payload
        })
            .then((res) => { console.log(res); return true })
            .catch((err) => {
                console.log(err.response.data.error.code); return false
            })
    }

    // Function to get option products
    function getProducts() {
        setIsDataLoaded(false);
        // https://api.india.delta.exchange/v2/products
        const method = 'GET'
        const path = '/v2/products'
        const timestamp = Date.now() / 1000 | 0
        let params = 'contract_types=call_options,put_options&states=live'
        let d = '/v2/positions/margined?contract_types=call_options'
        // params = JSON.stringify(params)
        const payload = ''
        const signature_data = method + timestamp + path + '?' + params
        const signature = generateSignature(api_secret, signature_data)
        let reqHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': api_key,
            'signature': signature,
            'timestamp': timestamp
        }

        axios({
            method: 'GET',
            url: '/products',
            headers: reqHeaders,
            params: {
                contract_types: 'call_options,put_options',
                states: 'live'
            }
        })
            .then((res) => {

                let putStrikes = res.data.result
                    .filter((category) => category.symbol.split('-')[3] == contract)
                    .filter((category) => category.contract_unit_currency == 'BTC')
                    .filter((category) => category.contract_type == 'put_options')
                    .sort((a, b) => a.strike_price - b.strike_price)

                let callStrikes = res.data.result
                    .filter((category) => category.symbol.split('-')[3] == contract)
                    .filter((category) => category.contract_unit_currency == 'BTC')
                    .filter((category) => category.contract_type == 'call_options')
                    .sort((a, b) => a.strike_price - b.strike_price)

                let indexc = callStrikes.findIndex((data) => data.strike_price == btc_current_strike);
                let indexp = putStrikes.findIndex((data) => data.strike_price == btc_current_strike);

                let till = indexp + 10;
                let arr = [];
                for (let j = indexp > 10 ? indexp - 10 : 0; j <= till; j++) {
                    putStrikesData.push(putStrikes[j])
                    // putStrikesSortedArr.push(putStrikes[j])
                }
                // setPutStrikesSorted(arr);
                // console.log(putStrikesSortedArr);

                till = indexc + 10;
                arr = [];
                for (let j = indexc > 10 ? indexc - 10 : 0; j <= till; j++) {
                    callStrikesData.push(callStrikes[j])
                    // callStrikesSortedArr.push(callStrikes[j])
                }
                // setCallStrikesSorted(arr);
                // console.log(callStrikesSortedArr[0]);

                // setIsStrikesLoaded(true);
                setIsDataLoaded(true);
            })
            .catch((err) => { console.log(err); })
    }

    // useEffect(() => { getProducts() }, [btc_current_strike])

    // Function to recheck if the trade has executed
    function reCheckExecutedOrder() {
        const method = 'GET'
        const path = '/v2/positions/margined'
        const timestamp = Date.now() / 1000 | 0
        let params = 'contract_types=call_options'
        let d = '/v2/positions/margined?contract_types=call_options'
        // params = JSON.stringify(params)
        const payload = ''
        const signature_data = method + timestamp + path + '?' + params
        const signature = generateSignature(api_secret, signature_data)
        let reqHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': api_key,
            'signature': signature,
            'timestamp': timestamp
        }

        axios({
            method: 'GET',
            url: '/positions/margined',
            headers: reqHeaders,
            params: { contract_types: 'call_options' }
        })
            .then((res) => { console.log(res); })
            .catch((err) => { console.log(err); })
    }

    // Function to start trading
    function trade() {
        // Checking if it's a fresh trade and not reloaded from local storage
        if (!isReloaded) {
            setEntryStrike(btc_current_strike);
            setDownStrike(btc_current_strike - strike_distance);
            setUpStrike(btc_current_strike + strike_distance);
            let callSymbol = getCallStrikeSymbol(btc_current_strike);
            let putSymbol = getPutStrikeSymbol(btc_current_strike);
            placeOrder(getCallStrikeSymbol(btc_current_strike), 'sell')
            placeOrder(getPutStrikeSymbol(btc_current_strike), 'sell')
            console.log("Trading started 🟢");
            console.log("Sold - " + btc_current_strike + " CE and PE");

            all.push(btc_current_strike + ' Short Straddle at - ' + btc_mark_price);
            localStorage.setItem("TimeStamp", new Date());
            localStorage.setItem("allStrikes", all);
            localStorage.setItem('upStrike', btc_current_strike + strike_distance)
            localStorage.setItem('downStrike', btc_current_strike - strike_distance)
            localStorage.setItem("entryStrike", btc_current_strike);
            setIsTradePlaced(true);
        }
        else if (isReloaded) { setIsTradePlaced(true); };
    }

    // Function to set local storage data
    function setLocalStorageData() {
        localStorage.setItem("openStrikes", open);
        localStorage.setItem("allStrikes", all);
        localStorage.setItem("closedStrikes", closed);
    }

    // Monitor Price movement 
    useEffect(() => {
        // If trade is placed
        if (isTradePlaced) {
            if (isUpStrikePlaced && btc_mark_price < entryStrike) {
                let exit = open.pop();
                all.push('Exited ' + exit + ' PE at - ' + btc_mark_price);
                placeOrder(getPutStrikeSymbol(exit), 'buy')
                closed.push(exit);
                setUpStrike(entryStrike + strike_distance);
                setDownStrike(entryStrike - strike_distance);

                setLocalStorageData();
                localStorage.setItem('upStrike', entryStrike + strike_distance)
                localStorage.setItem('downStrike', entryStrike - strike_distance)
                console.log("Exited - " + exit + " PE");
                setIsUpStrikePlaced(false);
                console.log('No Open Positions');
            }
            else if (isDownStrikePlaced && btc_mark_price > entryStrike) {
                let exit = open.pop();
                all.push('Exited ' + exit + ' CE at - ' + btc_mark_price);
                placeOrder(getCallStrikeSymbol(exit), 'buy')
                closed.push(exit);
                setUpStrike(entryStrike + strike_distance);
                setDownStrike(entryStrike - strike_distance);

                setLocalStorageData();
                localStorage.setItem('upStrike', entryStrike + strike_distance)
                localStorage.setItem('downStrike', entryStrike - strike_distance)

                console.log("Exited - " + exit + " CE");
                setIsDownStrikePlaced(false);
                console.log('No Open Positions');
            }
            // upside
            else if (btc_mark_price > entryStrike) {
                // no downside entry should be present
                if (btc_mark_price >= upStrike) {
                    console.log("Sold - " + upStrike + " PE");
                    all.push('Sold ' + upStrike + ' PE at - ' + btc_mark_price);

                    placeOrder(getPutStrikeSymbol(upStrike), 'sell')
                    open.push(upStrike);

                    setIsUpStrikePlaced(true);
                    setIsDownStrikePlaced(false);
                    setUpStrike(upStrike + strike_distance);

                    setLocalStorageData();
                    localStorage.setItem('upStrike', upStrike + strike_distance)
                    localStorage.setItem('downStrike', downStrike)
                }
                else if (btc_mark_price <= upStrike - strike_distance * 2) {

                    let exit = open.pop();
                    console.log("Exited - " + exit + " PE");

                    placeOrder(getPutStrikeSymbol(exit), 'buy')
                    closed.push(exit);
                    all.push('Exited ' + exit + ' PE at - ' + btc_mark_price);

                    setUpStrike(upStrike - strike_distance);

                    setLocalStorageData();
                    localStorage.setItem('upStrike', upStrike - strike_distance)
                    localStorage.setItem('downStrike', downStrike)
                }
                console.log('Upside');
            }
            // downside
            else if (btc_mark_price < entryStrike) {
                if (btc_mark_price <= downStrike) {
                    console.log("Sold - " + downStrike + " CE");
                    placeOrder(getCallStrikeSymbol(downStrike), 'sell')

                    all.push('Sold ' + downStrike + ' CE at - ' + btc_mark_price);
                    open.push(downStrike);

                    setIsUpStrikePlaced(false);
                    setIsDownStrikePlaced(true);
                    setDownStrike(downStrike - strike_distance);

                    setLocalStorageData();
                    localStorage.setItem('downStrike', downStrike - strike_distance);
                    localStorage.setItem('upStrike', upStrike)
                }
                else if (btc_mark_price >= downStrike + strike_distance * 2) {

                    let exit = open.pop();
                    all.push('Exited ' + exit + ' CE at - ' + btc_mark_price);
                    console.log("Exited - " + exit + " CE");

                    placeOrder(getCallStrikeSymbol(exit), 'buy')
                    closed.push(exit);
                    setDownStrike(downStrike + strike_distance);

                    setLocalStorageData();
                    localStorage.setItem('downStrike', downStrike + strike_distance);
                    localStorage.setItem('upStrike', upStrike);
                }
                console.log('Downside');
            }
            // console.log("Monitoring... 🟢");
        }
        else {
            console.log('Not Trading anything');
        }
    }, [btc_mark_price])

    // Function to reset everything
    function resetEverything() {
        setEntryStrike(0);
        setUpStrike(0);
        setDownStrike(0);
        setOpenStrikes({ 'data': [] }); open = openStrikes.data;
        setClosedStrikes({ 'data': [] }); closed = closedStrikes.data;
        setAllStrikes({ 'data': [] }); all = allStrikes.data;
        setIsTradePlaced(false);
        setIsReloaded(false);
        setIsUpStrikePlaced(false);
        setIsDownStrikePlaced(false);
    }
    // console.log(callStrikes);
    return (
        <div className="section3">

            {/* <div className="optionStrikes">
                <div><u>Calls</u></div>
                {
                    isDataLoaded && callStrikesSorted.data.map((data) => {
                        return <div className={data.strike_price == btc_current_strike ? "currentStrike" : ''}
                            key={data.id}>{data.strike_price}</div>
                    })
                }
            </div> */}
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
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Select a date"
                            />
                        </div>
                        <div><div>Set Strike Distance:</div>
                            <input type="text" defaultValue={btcStrikeDistance} onChange={(e) => {
                                setBtcStrikeDistance(parseInt(e.target.value));
                                localStorage.setItem("strikeDistance", e.target.value);
                            }} /></div>
                    </div>
                </div>
                <div>
                    <div>Entry Strike - {entryStrike}</div>
                    <div>Current Strike - {btc_current_strike}</div>
                    <div>Up Strike - {upStrike}</div>
                    <div>Down Strike - {downStrike}</div>
                </div>
                <div>
                    <button onClick={trade}>Start Trading</button>
                    <button onClick={reCheckExecutedOrder}>Recheck</button>
                    <button onClick={() => {
                        closeAllPosition();
                        setIsTradePlaced(false);
                        all.push(entryStrike + ' Short Straddle closed at - ' + btc_mark_price);
                    }}>Close Positions</button>
                    <button onClick={getDataBack}>Reload</button>
                    <button onClick={resetEverything}>Reset</button>
                    <button onClick={getProducts}>Get Products</button>
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
                        <div><u>Trade Log</u></div>
                        <div>
                            {allStrikes.data.map((item, idx) => { return <div key={idx}>{item}</div> })}
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="optionStrikes">
                <div><u>Puts</u>
                </div>{
                    isDataLoaded && putStrikesSorted.data.map((data) => {
                        return <div className={data.strike_price == btc_current_strike ? "currentStrike" : ''}
                            key={data.id}>{data.strike_price}</div>
                    })
                }</div> */}
        </div>
    )
}

export default StrategyFour