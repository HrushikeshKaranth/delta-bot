import { BTC_STRIKE_DISTANCE } from "./GlobalState";
export default (state, action ) => {
    switch(action.type){
        case 'SET_BTC_STRIKE_DISTANCE':
            return{
                ...state,
                strike_distance: action.payload
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