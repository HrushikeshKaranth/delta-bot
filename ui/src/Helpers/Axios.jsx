import axios from 'axios'

const instance = axios.create({
    baseURL: "https://cdn-ind.testnet.deltaex.org/v2"
    // baseURL: "https://api.india.delta.exchange/v2"
});

export default instance;


// REST API Endpoint URL for Delta Exchange India

// Production-India - https://api.india.delta.exchange/v2
// Testnet-India - https://cdn-ind.testnet.deltaex.org/v2


// REST API Endpoint URL for Delta Exchange Global

// Production-Global - https://api.delta.exchange/v2
// Testnet-Global - https://testnet-api.delta.exchange/v2