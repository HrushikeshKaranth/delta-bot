import React, { createContext, useReducer, useRef } from "react";
import AppReducer from './AppReducer'
import { generateSignature } from '../Helpers/HelperFunctions'

// Initial state
const initialState = {
    btc_mark_price: 0,
    btc_current_strike: 0,
    strike_distance: 200,
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
    // Reducer function
    const [state, dispatch] = useReducer(AppReducer, initialState);

    // Creating WebSocket connection
    const wsRefLive = useRef();
    if (!wsRefLive.current) { wsRefLive.current = new WebSocket(testurl) }

    // Authentication details for private channels
    const method = 'GET';
    const timestamp = Date.now() / 1000 | 0;
    const path = '/live';
    const signatureData = method + timestamp + path;
    const signature = generateSignature(API_SECRET, signatureData);

    // Function to start web socket
    function startWs() {
        // message body for authentication request
        const message = {
            type: "auth",
            payload: {
                "api-key": API_KEY,
                "signature": signature,
                "timestamp": timestamp
            }
        };

        // Web socket on-open event
        wsRefLive.current.onopen = (event) => {
            wsRefLive.current.send(JSON.stringify(message));
            // console.log(event.data);
        };

        // Web socket on-message event
        wsRefLive.current.onmessage = function (event) {
            let json;
            try {
                json = JSON.parse(event.data);

                // for updating bitcoin realtime price
                if (json.price) {
                    dispatch({
                        type: 'SET_BTC_PRICE',
                        payload: parseInt(JSON.parse(event.data).price)
                    })
                }

                // For Authentication purpose 
                if(json.message){
                    if (JSON.parse(event.data).message == 'Authenticated') {
                        console.log("Authentication Successfull 🟢 ");
                    }
                }

            } catch (err) { console.log("Waiting for Data...") }
        };

        // Calling on-open and on-message functions
        wsRefLive.current.onopen();
        wsRefLive.current.onmessage();
    }

    // Function to subscribe to the bitcoin realtime data
    function getQuotesLive() {
        // Subscribe body for Bitcoin
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
            startWs,
            getQuotesLive,
            closeQuotesLive
        }}>
            {children}
        </GlobalContext.Provider>
    )
}