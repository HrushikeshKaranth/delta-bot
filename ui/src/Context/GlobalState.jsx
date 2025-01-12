import React, { createContext, useReducer, useRef } from "react";
import AppReducer from './AppReducer'
import axios from 'axios';

// Initial state
const initialState = {
    transactions: [],
    btc_mark_price: 0,
    btc_current_strike: 0,
    error: null,
    loading: true
}

// Create context
export const GlobalContext = createContext(initialState);

// Api info
export const API_KEY = 'MbcOp0ClHgZSjo7J1PvUHLrnlPPjQA';
export const API_SECRET = 'QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY'

// Subscribe body for Bitcoin
const subscribe = {
    "type": "subscribe",
    "payload": {
        "channels": [
            {
                "name": "v2/ticker",
                "symbols": [
                    "BTCUSD"
                ]
            }
        ]
    }
}

// Provider component
export const GlobalProvider = ({ children }) => {

    // Creating websocket 
    const wsRef = useRef();
    if (!wsRef.current) { wsRef.current = new WebSocket('wss://socket.india.delta.exchange') }

    const [state, dispatch] = useReducer(AppReducer, initialState);

    // Function to start web socket and stream price updates
    function getQuotes() {
        wsRef.current.onopen = (event) => {
            wsRef.current.send(JSON.stringify(subscribe));
        };
        wsRef.current.onmessage = function (event) {
            let json;
            try {
                json = JSON.parse(event.data);
                if (json.symbol === "BTCUSD") {
                    dispatch({
                        type: 'SET_BTC_PRICE',
                        payload: parseInt(json.mark_price)
                    })
                }
                // if (json.symbol === "BTCUSD") setBtc(parseInt(json.mark_price))
            } catch (err) { console.log(err) }
        };
        wsRef.current.onopen();
        wsRef.current.onmessage();
        console.log('Price stream started 🟢');
    }

    // Function to close web socket
    function closeQuotes() {
        wsRef.current.close();
        console.log("Price stream closed 🔴");
    }

    // Actions
    async function getTransactions() {
        try {
            const res = await axios.get('/api/v1/transactions/');

            dispatch({
                type: 'GET_TRANSACTIONS',
                payload: res.data.data
            })
        } catch (error) {
            dispatch({
                type: 'TRANSACTIONS_ERROR',
                payload: error.response.data.error
            });
        }
    }
    async function deleteTransaction(id) {
        try {
            await axios.delete(`/api/v1/transactions/${id}`);

            dispatch({
                type: 'DELETE_TRANSACTION',
                payload: id
            });
        } catch (error) {
            dispatch({
                type: 'TRANSACTIONS_ERROR',
                payload: error.response.data.error
            });
        }
    }

    async function addTransaction(transaction) {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }

        try {
            const res = await axios.post('/api/v1/transactions/', transaction, config);

            dispatch({
                type: 'ADD_TRANSACTION',
                payload: res.data.data
            });

        } catch (error) {
            dispatch({
                type: 'TRANSACTIONS_ERROR',
                payload: error.response.data.error
            });
        }
    }

    return (
        <GlobalContext.Provider value={{
            transactions: state.transactions,
            error: state.error,
            loading: state.loading,
            btc_mark_price: state.btc_mark_price,
            btc_current_strike: state.btc_current_strike,
            getTransactions,
            deleteTransaction,
            addTransaction,
            getQuotes,
            closeQuotes
        }}>
            {children}
        </GlobalContext.Provider>
    )
}