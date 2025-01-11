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
                console.log(res);
                username = res.data.result.nick_name
                email = res.data.result.email
                //   setUsername(res.data.result.nick_name)
                //   setEmail(res.data.result.email)
            }
        })
        .catch((err) => {
            console.log(err);
        })
    return { username, email };
}

// Implementation of stack data structure
export class Stack {
    // Array is used to implement stack
    constructor() {
        this.items = [];
    }

    // Stack functions
    // Push function
    push(element) {
        // push element into the items
        this.items.push(element);
    }

    // pop function
    pop() {
        // return top most element in the stack
        // and removes it from the stack
        // Underflow if stack is empty
        if (this.items.length == 0)
            return 'Underflow'
        return this.items.pop();
    }

    // peek function
    peek() {
        // return the top most element from the stack
        // but does'nt delete it.
        return this.items[this.items.length - 1];
    }

    // isEmpty function
    isEmpty() {
        // return true if stack is empty
        return this.items.length == 0;
    }

    // printStack function
    print() {
        // let str = "";
        for (let i = 0; i < this.items.length; i++)
            console.log(this.items[i]);
            // str += this.items[i] + " ";
        // return str;
    }
}