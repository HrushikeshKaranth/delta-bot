import { BTC_STRIKE_DISTANCE } from "./GlobalState";
export default (state, action ) => {
    // let strikeDistance = 500;
    switch(action.type){
        case 'TRANSACTION_ERROR':
            return{
                ...state,
                error: action.payload
            }
        case 'SET_BTC_PRICE':
            return{
                ...state,
                btc_mark_price: action.payload,
                btc_current_strike: Math.round(action.payload / BTC_STRIKE_DISTANCE) * BTC_STRIKE_DISTANCE
            }
        default:
            return state
    }
}