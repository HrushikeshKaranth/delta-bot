import axios from 'axios'

const instance = axios.create({
    baseURL: "https://cdn-ind.testnet.deltaex.org/v2"
});

export default instance;