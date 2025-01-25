import React, { createContext, useEffect, useReducer, useRef, useState } from "react";
import AppReducer from './AppReducer'
import axios from "../Helpers/Axios";
import CryptoJS from "crypto-js";


// Initial state
const initialState = {
    btc_mark_price: 0,
    btc_current_strike: 0,
    strike_distance: 0,
    error: null,
    loading: true
}

// Create context
export const GlobalContext = createContext(initialState);

// Api info
// *** Prod API details ***
// export const API_KEY = '2MeKJycZ6M3Dz0eU2qECNSD9UZWF9g';
// export const API_SECRET = 'nJx90OdRW6n2Fw31kRuSsz2LrWIzvfgqiryCYS9bILvQWvCU9Q9hnDoVoo3L'
// const testurl = "wss://socket.india.delta.exchange";
// const userId = 35296206;

// *** Test API details ***
export const API_KEY = 'MbcOp0ClHgZSjo7J1PvUHLrnlPPjQA';
export const API_SECRET = 'QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY';
const testurl = "wss://socket-ind.testnet.deltaex.org";
const userId = 98816916;
// -----

export let BTC_STRIKE_DISTANCE = 200;
// console.log(BTC_STRIKE_DISTANCE);

// Provider component
export const GlobalProvider = ({ children }) => {
    // Reference variable for web socket
    const wsRefLive = useRef(null);

    const [btcStrikeDistance, setBtcStrikeDistance] = useState(200);
    BTC_STRIKE_DISTANCE = btcStrikeDistance;
    // console.log(BTC_STRIKE_DISTANCE);
    // Reducer function
    const [state, dispatch] = useReducer(AppReducer, initialState);

    // States
    const [isConnected, setIsConnected] = useState(false);
    const [isAuth, setIsAuth] = useState(true);
    const [connectionLight, setConnectionLight] = useState('🟡');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    let [check, setCheck] = useState(0);

    // Reference variable for setInterval function
    let intervalId = useRef();

    function checkConnection() {
        setIsConnected(true);
        setCheck(check = check + 1);
        // netCheck();
    }
    // intervalId.current? clearInterval(intervalId.current):intervalId.current = setInterval(checkConnection, 5000);
    // function clearCheck() { clearInterval(intervalId.current) }
    function intervalSetter() {
        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = setInterval(checkConnection, 5000);
        // intervalId.current = setInterval(checkConnection, 5000);
    }

    // Periodically check and reset connection if it's down 
    // function netCheck(){
    //     if (isConnected && !isAuth) restartWs();
    //     else console.log('Not connected'); 
    // }
    useEffect(() => {
        if (isConnected) {
            if (!isAuth) {
                restartWs();
            }
            else {
                // console.log('Connected'); 
            }
        }
        else { console.log('Not connected'); }

    }, [check])

    // Function to call for authentication 
    function auth() {
        if (getProfileInfo()) startWs();
        else window.location.reload();
    }

    // Authentication details for private channels
    const method = 'GET';
    const timestamp = Date.now() / 1000 | 0;
    const path = '/live';
    const signatureData = method + timestamp + path;
    const signature = generateSignature(API_SECRET, signatureData);

    // Function to start web socket and authorize private channel for realtime data
    function startWs() {
        if (!wsRefLive.current) wsRefLive.current = new WebSocket(testurl);
        // Message body for authentication request
        const message = {
            type: "auth",
            payload: {
                "api-key": API_KEY,
                "signature": signature,
                "timestamp": timestamp
            }
        };

        setIsConnected(true);
        // console.log('here');
        // Web socket on-open event
        wsRefLive.current.onopen = (event) => {
            console.log('Initializing connection');
            if (wsRefLive.current.readyState == WebSocket.OPEN) {
                wsRefLive.current.send(JSON.stringify(message));
            }
        };

        // Web socket on-close event
        wsRefLive.current.onclose = (event) => {
            console.log('Connection closed!');
            setIsAuth(false);
            setConnectionLight('🔴');
            intervalSetter();
        };

        // Web socket on-message event
        wsRefLive.current.onmessage = (event) => {
            // console.log(event);
            let json;
            try {
                if (event && 'data' in event) {
                    json = JSON.parse(event.data);

                    // For Authentication purpose 
                    if ('message' in json) {
                        if (json.message == 'Authenticated') {
                            console.log("User Authentication Successfull 🟢 ");
                            setConnectionLight('🟢');
                            setIsAuth(true);
                            getQuotesLive();
                            intervalSetter();
                        }
                        else {
                            console.log("User Authentication Failed 🔴");
                            console.log(json);
                            setIsAuth(false);
                            setConnectionLight('🟡');
                            wsRefLive.current.close();
                        }
                    }

                    // For streaming Realtime Bitcoin price data
                    if ('price' in json) {
                        dispatch({
                            type: 'SET_BTC_PRICE',
                            payload: parseInt(json.price)
                        });
                        setConnectionLight('🟢');
                    }
                    else (setConnectionLight('🔴'));
                }
                else { setConnectionLight('🔴') }
            } catch (err) {
                console.log(err);
                wsRefLive.current.close();
            }
        };

        // Calling on-open and on-message functions
        wsRefLive.current.onopen();
        wsRefLive.current.onmessage();
    }

    // Function to reconnect to web socket if connection fails
    function restartWs() {

        if (!wsRefLive.current || wsRefLive.current.readyState == WebSocket.CLOSED) {
            console.log('Resetting Connection 🟡');
            wsRefLive.current = null;
            startWs();
        }
        else {
            console.log('Force closing Web socket and Resetting connection');
            wsRefLive.current = null;
            startWs();

        }
        // if (wsRefLive.current == null) {
        //     console.log('Resetting Connection 🟡');
        //     startWs();
        // }
    }

    // Function to generate Signature for Api Authentication
    function generateSignature(secret, message) {
        // Convert secret and message to bytes-utf8
        const secretBytes = CryptoJS.enc.Utf8.parse(secret);
        const messageBytes = CryptoJS.enc.Utf8.parse(message);

        // HMAC-SHA256 calculation
        const hash = CryptoJS.HmacSHA256(messageBytes, secretBytes);

        // Convert to hexadecimal string
        const signature = hash.toString(CryptoJS.enc.Hex);
        return signature;
    }

    // Function to get profile details
    async function getProfileInfo() {

        const payload = ''
        const method = 'GET'
        const path = '/v2/profile'
        const query_string = ''
        const timestamp = Date.now() / 1000 | 0; // Timestamp in epoch unix format
        const signature_data = method + timestamp + path + query_string + payload
        const signature = generateSignature(API_SECRET, signature_data)

        const req_headers = {
            'api-key': API_KEY,
            'timestamp': timestamp,
            'signature': signature,
            'Content-Type': 'application/json',
        }

        await axios.get('/profile', { headers: req_headers })
            .then((res) => {
                if (res) {
                    console.log(res);
                    setUsername(res.data.result.nick_name);
                    setEmail(res.data.result.email);
                    return true;
                }
            })
            .catch((err) => { return false })
    }

    // Function to subscribe to the bitcoin realtime data
    function getQuotesLive() {
        // Subscribe body for Bitcoin
        // BTC = .DEXBTUSD
        // ETH = .DEETHUSD
        const subscribeBtc = {
            "type": "subscribe",
            "payload": {
                "channels": [
                    {
                        "name": "spot_price",
                        "symbols": [
                            ".DEXBTUSD"
                        ]
                    }
                ]
            }
        }
       
        wsRefLive.current.send(JSON.stringify(subscribeBtc));
        console.log('Price stream started 🟢');
    }

    // Function to unsubscribe bitcoin realtime data
    function closeQuotesLive() {
        // Unsubscribe body for Bitcoin
        const unSubscribeBtc = {
            "type": "unsubscribe",
            "payload": {
                "channels": [
                    {
                        "name": "spot_price",
                        "symbols": [
                            ".DEXBTUSD"
                        ]
                    }
                ]
            }
        }

        wsRefLive.current.send(JSON.stringify(unSubscribeBtc));
        // wsRefLive.current.close();
    }

    // Function to close all open positions
    function closeAllPosition() {
        const method = 'POST'
        const path = '/v2/positions/close_all'
        // const query_string = ''
        let payload =
        {
            "close_all_portfolio": true,
            "close_all_isolated": true,
            "user_id": userId
        }
        payload = JSON.stringify(payload);
        // timestamp in epoch unix format
        const timestamp = Date.now() / 1000 | 0
        const signature_data = method + timestamp + path + payload;
        const signature = generateSignature(API_SECRET, signature_data)
        let reqHeaders = {
            'Content-Type': 'application/json',
            'api-key': API_KEY,
            'signature': signature,
            'timestamp': timestamp
        }

        axios({
            method: 'POST',
            url: '/positions/close_all',
            headers: reqHeaders,
            data: payload
        })
            .then((res) => { console.log(res); })
            .catch((err) => { console.log(err); })
    }

    // Function to change default Leverage
    async function changeLeverage(symbol) {

        async function getSymboId(symbol) {
            await axios.get(`/products/${symbol}`)
                .then((res) => { return res.data.result.id; })
                .catch((err) => { console.log(err); return false })
        }

        let product_id = await getSymboId(symbol);
        path = `v2/products/${product_id}/orders/leverage`
        let requestUrl = `/products/${product_id}/orders/leverage`

        const method = 'POST'
        // const query_string = ''
        // timestamp in epoch unix format
        const timestamp = Date.now() / 1000 | 0
        const signature_data = method + timestamp + path;
        const signature = generateSignature(API_SECRET, signature_data)
        let reqHeaders = {
            'Content-Type': 'application/json',
            'api-key': API_KEY,
            'signature': signature,
            'timestamp': timestamp
        }
        let payload =
        {
            "leverage": 10
        }

        axios({
            method: 'POST',
            url: requestUrl,
            headers: reqHeaders,
            data: payload
        })
            .then((res) => { console.log(res); })
            .catch((err) => { console.log(err); })
    }

    function getProductId(symbol) {
        // let id = ''
        axios.get(`/products/${symbol}`)
            .then((res) => {
                //   console.log(res);
                return res.data.result.id;
            })
            .catch((err) => { console.log(err); return false })
        // return id;
    }

    // Function to get option products
    function getProducts(){
        // https://api.india.delta.exchange/v2/products
        const method = 'GET'
        const path = '/v2/products'
        const timestamp = Date.now() / 1000 | 0
        let params = 'contract_types=call_options,put_options&states=live'
        let d ='/v2/positions/margined?contract_types=call_options'
        // params = JSON.stringify(params)
        const payload = ''
        const signature_data = method + timestamp + path +'?'+params
        const signature = generateSignature(API_SECRET, signature_data)
        let reqHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': API_KEY,
            'signature': signature,
            'timestamp': timestamp
        }

        axios({
            method: 'GET',
            url: '/products',
            headers: reqHeaders,
            params:{
                contract_types:'call_options,put_options',
                states:'live'
            }
        })
            .then((res) => { console.log(res); 
                const availablePutStrikes = res.data.result
                .filter((category)=> category.symbol.split('-')[3] == '230125')
                .filter((category)=> category.contract_unit_currency == 'BTC')
                .filter((category)=> category.contract_type == 'put_options')
                .sort((a, b) => a.strike_price - b.strike_price)
                console.log(availablePutStrikes);
                const availableCallStrikes = res.data.result
                .filter((category)=> category.symbol.split('-')[3] == '230125')
                .filter((category)=> category.contract_unit_currency == 'BTC')
                .filter((category)=> category.contract_type == 'call_options')
                .sort((a, b) => a.strike_price - b.strike_price)
                console.log(availableCallStrikes);
            })
            .catch((err) => { console.log(err); })
    }

    return (
        <GlobalContext.Provider value={{
            api_key: API_KEY,
            api_secret: API_SECRET,
            error: state.error,
            loading: state.loading,
            btc_mark_price: state.btc_mark_price,
            btc_current_strike: state.btc_current_strike,
            strike_distance: BTC_STRIKE_DISTANCE,
            wsReset: wsRefLive.current,
            wsResetRef: intervalId.current,
            isConnected,
            connectionLight,
            username,
            email,
            check,
            isAuth,
            auth,
            setIsConnected,
            setConnectionLight,
            setBtcStrikeDistance,
            getProfileInfo,
            startWs,
            restartWs,
            getQuotesLive,
            closeQuotesLive,
            checkConnection,
            closeAllPosition,
            generateSignature,
            getProductId

        }}>
            {children}
        </GlobalContext.Provider>
    )
}