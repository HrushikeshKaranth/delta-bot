import CryptoJS from "crypto-js";
import axios from './Axios';


export const api_key = 'MbcOp0ClHgZSjo7J1PvUHLrnlPPjQA'
export const api_secret = 'QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY'

// Function to generate Signature for Api Authentication
export function generateSignature(secret, message) {
    const secretBytes = CryptoJS.enc.Utf8.parse(secret); // Convert secret to bytes
    const messageBytes = CryptoJS.enc.Utf8.parse(message); // Convert message to bytes

    // HMAC-SHA256 calculation
    const hash = CryptoJS.HmacSHA256(messageBytes, secretBytes);

    // Convert to hexadecimal string
    const signature = hash.toString(CryptoJS.enc.Hex);
    return signature;
}

// Function to return UNIX timestamp
export function getTimeStamp() {
    const now = new Date();
    const epoch = new Date(1970, 0, 1); // Unix epoch
    const timestamp = Math.floor((now - epoch) / 1000);
    return timestamp.toString();
};

export function getHeaders(payload){
    const api_key = 'MbcOp0ClHgZSjo7J1PvUHLrnlPPjQA';

    function generateSignature(secret, message) {
        const secretBytes = CryptoJS.enc.Utf8.parse(secret); // Convert secret to bytes
        const messageBytes = CryptoJS.enc.Utf8.parse(message); // Convert message to bytes
        const hash = CryptoJS.HmacSHA256(messageBytes, secretBytes);
        const signature = hash.toString(CryptoJS.enc.Hex);
        return signature;
    }
    // const payload = ''
    const method = 'GET'
    const path = '/v2/orders'
    // const query_string = ''
    // timestamp in epoch unix format
    const timestamp = Date.now() / 1000 | 0
    // const signature_data = method + timestamp + path + query_string + JSON.stringify(payload);
    const signature = generateSignature(method, path, JSON.stringify(payload))   
    console.log(signature);
    console.log();
    return {
        'api-key': api_key,
        'timestamp': timestamp,
        'signature': signature,
        'Content-Type': 'application/json',
    }
}

// Function to get profile details
export async function getProfileInfo() {

    const payload = ''
    const method = 'GET'
    const path = '/v2/profile'
    const query_string = ''
    // timestamp in epoch unix format
    const timestamp = Date.now() / 1000 | 0
    const signature_data = method + timestamp + path + query_string + payload
    const signature = generateSignature(api_secret, signature_data)

    const req_headers = {
        'api-key': api_key,
        'timestamp': timestamp,
        'signature': signature,
        'Content-Type': 'application/json',
    }

    let username, email;
    await axios.get('/profile', { headers: req_headers })
        .then((res) => {
            if (res) {
                // console.log(res);
                username = res.data.result.nick_name
                email = res.data.result.email
            }
        })
        .catch((err) => {
            console.log(err);
            return(false);
        })
    return { username, email };
}

export async function getProductId(symbol){
    let id = ''
    await axios.get(`/products/${symbol}`)
    .then((res)=>{
      console.log(res);
      id =  res.data.result.id;
    })
    .catch((err)=>{console.log(err);})
    return parseInt(id);
  }

  async function placeOrder(){
    // const headers =  getHeaders();
    let btcStrike = '95000'
    let api_key = "MbcOp0ClHgZSjo7J1PvUHLrnlPPjQA"
    let api_secret = "QIC5oezWU0MGXEb1vIqSNPe6UdYbIsCDT7nVs4hXacVPUvKWQlaXwqULA3DY"
    let symbol = 'C-BTC-'+btcStrike+'-130125'
    let payload  = {
      "product_id": await getProductId(symbol),
      "size": 10,
      "side": "sell",
      "order_type": "market_order"
    }
    payload = JSON.stringify(payload);
    const method = 'POST'
    const path = '/v2/orders'
    const query_string = ''
    // timestamp in epoch unix format
    const timestamp = Date.now() / 1000 | 0
    const signature_data = method + timestamp + path + query_string + payload;
    const signature = generateSignature(api_secret, signature_data)   
    let reqHeaders = {
      'api-key': api_key,
      'timestamp': timestamp,
      'signature': signature,
      'Content-Type': 'application/json'
  }
    await axios({
      method: 'POST',
      url: '/orders',
      headers: reqHeaders,
      data: payload  // 'data' is used instead of 'body' in axios
  })
    .then((res)=>{console.log(res);})
    .catch((err)=>{console.log(err);})

  }
