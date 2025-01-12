import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';

function BtcPrice() {
    const { btc_mark_price, getQuotes, closeQuotes } = useContext(GlobalContext);

    return (
        <>
            <div><u>Bitcoin</u> - {btc_mark_price}</div>
            <div>
                <button onClick={getQuotes}>Start Stream</button>
                <button onClick={closeQuotes}>Stop Stream</button>
            </div>
        </>
    )
}

export default BtcPrice