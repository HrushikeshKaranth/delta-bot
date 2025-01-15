import React, { createContext, useEffect, useReducer, useRef, useState } from "react";
import AppReducer from './AppReducer'
import { generateSignature } from '../Helpers/HelperFunctions';
import useWebSocket, { ReadyState } from 'react-use-websocket';
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
    const wsRefLive = useRef(null);

    // Creating WebSocket connection
    
    //   useEffect(() => {
        //     // Open WebSocket on component mount
        //     startWs();
        //     // Cleanup WebSocket on component unmount
        //     return () => {
//       if (wsRefLive.current) {
    //         wsRefLive.current.close();
    //       }
    //     };
    //   }, []);
    
    // Reducer function
    const [state, dispatch] = useReducer(AppReducer, initialState);
    
    const [isConnected, setIsConnected] = useState(false);
    const [connectionLight, setConnectionLight] = useState('🟡');
    
    
    // Authentication details for private channels
    const method = 'GET';
    const timestamp = Date.now() / 1000 | 0;
    const path = '/live';
    const signatureData = method + timestamp + path;
    const signature = generateSignature(API_SECRET, signatureData);
    let [check, setCheck] = useState(0);
    let intervalId = useRef();

    // let intervalId = interval.current;
    const heartbeat = 0;

    function checkConnection(){
        setCheck(check = check + 1)
    }
    intervalId = setInterval(checkConnection, 5000);
    useEffect(()=>{
        if(isConnected){
            if (!wsRefLive.current || wsRefLive.current.readyState == WebSocket.CLOSED) {
                console.log('Web Socket Connection is Closed');
            } //check if websocket instance is closed, try to restart
            else{
                startWs();
                console.log('Web Socket Connection is now Open');
                console.log(wsRefLive.current.readyState);
                // clearInterval(intervalId);
            }
        }
        else{
            console.log('idk');
            wsRefLive.current = null;
            startWs();
            // // intervalId = setInterval(checkConnection, 5000);
            // if (!wsRefLive.current || wsRefLive.current.readyState == WebSocket.CLOSED) {
            //     startWs();
            //     // console.log('Web Socket Connection is Closed');
            // } 
            // else{console.log(wsRefLive.current.readyState);}
        }
        console.log(wsRefLive.current.readyState);
     },[isConnected,check])
    
    // Function to start web socket
    // console.log(intervalId);
    function startWs() {
        // clearInterval(intervalId.current);
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

        // Web socket on-open event
        wsRefLive.current.onopen = (event) => {
            // console.log('On open');
            if(wsRefLive.current.readyState == WebSocket.OPEN){
                wsRefLive.current.send(JSON.stringify(message));
            }
            // intervalId = setInterval(() => {
                //     wsRefLive.current.send(JSON.stringify(heartbeat));
                // }, 36000);
                // console.log(event.data);
            };
            
            
            // Web socket on-message event
            wsRefLive.current.onmessage = (event) => {
                let json;
                try {
                    // console.log(event);
                    if (event != null) {
                        json = JSON.parse(event.data);
                    }
                    else{setConnectionLight('🔴')}
                    
                    // for updating bitcoin realtime price
                    if (json != null && json.p) {
                    dispatch({
                        type: 'SET_BTC_PRICE',
                        payload: parseInt(JSON.parse(event.data).p)
                    });
                    setConnectionLight('🟢');
                }
                else(setConnectionLight('🔴'));
                
                // For Authentication purpose 
                if (json != null && json.message) {
                    if (JSON.parse(event.data).message == 'Authenticated') {
                        console.log("User Authentication Successfull 🟢 ");
                        setIsConnected(true);
                        setConnectionLight('🟢');
                        // clearInterval(intervalId);
                        clearInterval(intervalId.current);
                    }
                    else { 
                        console.log("User Authentication Failed 🔴");
                        setConnectionLight('🟡');
                        setIsConnected(false);
                        intervalId = setInterval(checkConnection, 5000);
                        // wsRefLive.current.close();
                        // intervalId.current = setInterval(() => {
                        //     console.log('In interval - Reconnecting ...');
                            // restartWs();
                        // }, 5000);
                     }
                }

            } catch (err) { console.log(err) }
        };

        // Web socket on-close event
        wsRefLive.current.onclose = (event) => {
            console.log('In on close event');
            console.log('Web Socket connection closed!');
            setIsConnected(false);
            setConnectionLight('🔴');
            // intervalId.current = setInterval(() => {
            //     console.log('In interval - Reconnecting ...');
            //     restartWs();
            // }, 5000);
        };

        // Calling on-open and on-message functions
        // wsRefLive.current.onopen();
        // wsRefLive.current.onmessage();
    }

    // Function to reconnect to web socket if connection fails
    function restartWs(){
        console.log('In restart function');
        if (!wsRefLive.current) { 
            console.log('Trying to close existing connection');
            wsRefLive.current.close();
            // wsRefLive.current = null;
        }
        else {
            console.log('calling start function');
            startWs();
            // wsRefLive.current = new WebSocket(testurl);
        }
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
            setConnectionLight,
            startWs,
            restartWs,
            getQuotesLive,
            closeQuotesLive
        }}>
            {children}
        </GlobalContext.Provider>
    )
}