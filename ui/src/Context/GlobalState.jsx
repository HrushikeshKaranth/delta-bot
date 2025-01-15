import React, { createContext, useEffect, useReducer, useRef, useState } from "react";
import AppReducer from './AppReducer'
import { generateSignature } from '../Helpers/HelperFunctions';
import useWebSocket, { ReadyState } from 'react-use-websocket';
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
export const PROD_API_KEY = 'HeCTgCW9ROo2YHAnHooZiLj1FWOQrq';
export const PROD_API_SECRET = 'ueNyuEg3iGqsKzD6ZZBESCzxQF8HcTdRnzQzuTx7SuS8LQT0Amly54oQaFEp'
export const API_KEY = 'MbcOp0ClHgZSjo7J1PvUHLrnlPPjQA';
export const API_SECRET = 'QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY'
export const BTC_STRIKE_DISTANCE = 500;
const produrl = "wss://socket.india.delta.exchange";
const testurl = "wss://socket-ind.testnet.deltaex.org";
// -----

// Provider component
export const GlobalProvider = ({ children }) => {
    // Reference variable for web socket
    const wsRefLive = useRef(null);

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
    }
    // intervalId.current = setInterval(checkConnection, 5000);

    // Periodically check and reset connection if it's down 
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
        else { window.location.reload() }
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
        // message body for authentication request
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
            if (wsRefLive.current.readyState == WebSocket.OPEN) {
                wsRefLive.current.send(JSON.stringify(message));
            }
        };

        // Web socket on-close event
        wsRefLive.current.onclose = (event) => {
            console.log('Connection closed!');
            setIsAuth(false);
            setConnectionLight('🔴');
            if (intervalId.current) clearInterval(intervalId.current);
            intervalId.current = setInterval(checkConnection, 5000);
        };

        // Web socket on-message event
        wsRefLive.current.onmessage = (event) => {
            let json;
            try {
                if (event != null) {
                    json = JSON.parse(event.data);
                }
                else { setConnectionLight('🔴') }

                // for updating bitcoin realtime price
                if (json != null && json.p) {
                    dispatch({
                        type: 'SET_BTC_PRICE',
                        payload: parseInt(JSON.parse(event.data).p)
                    });
                    setConnectionLight('🟢');
                }
                else (setConnectionLight('🔴'));

                // For Authentication purpose 
                if (json != null && json.message) {
                    if (JSON.parse(event.data).message == 'Authenticated') {
                        console.log("User Authentication Successfull 🟢 ");
                        setConnectionLight('🟢');
                        setIsAuth(true);
                        getQuotesLive();
                        if (intervalId.current) clearInterval(intervalId.current);
                        intervalId.current = setInterval(checkConnection, 5000);
                    }
                    else {
                        console.log("User Authentication Failed 🔴");
                        setIsAuth(false);
                        setConnectionLight('🟡');
                        if (intervalId.current) clearInterval(intervalId.current);
                        intervalId.current = setInterval(checkConnection, 5000);
                        // if (wsRefLive.current != null) wsRefLive.current.close();
                    }
                }
            } catch (err) { console.log(err) }
        };

        // Calling on-open and on-message functions
        wsRefLive.current.onopen();
        wsRefLive.current.onmessage();
    }

    // Function to reconnect to web socket if connection fails
    function restartWs() {

        if (!wsRefLive.current || wsRefLive.current.readyState == WebSocket.CLOSED) {
            console.log('Resetting Connection 1 🟡');
            wsRefLive.current = null;
            startWs();
        }
        if (wsRefLive.current == null) {
            console.log('Resetting Connection 2 🟡');
            startWs();
        }
    }

    // Function to generate Signature for Api Authentication
    function generateSignature(secret, message) {
        const secretBytes = CryptoJS.enc.Utf8.parse(secret); // Convert secret to bytes
        const messageBytes = CryptoJS.enc.Utf8.parse(message); // Convert message to bytes

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
        // timestamp in epoch unix format
        const timestamp = Date.now() / 1000 | 0
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
        const subscribeBtc = {
            "type": "subscribe",
            "payload": {
                "channels": [
                    {
                        "name": "v2/spot_price",
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
        wsRefLive.current.close();
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
            auth,
            setIsConnected,
            setConnectionLight,
            getProfileInfo,
            startWs,
            restartWs,
            getQuotesLive,
            closeQuotesLive,
            checkConnection
        }}>
            {children}
        </GlobalContext.Provider>
    )
}