import React, { useContext } from 'react'
import { GlobalContext } from '../Context/GlobalState';

function BtcPrice() {
    const { btc_mark_price, getQuotes, closeQuotes, startWs, getQuotesLive, closeQuotesLive } = useContext(GlobalContext);

    return (
        <>
            <div><u>Bitcoin</u> - {btc_mark_price}</div>
            <div>
                {/* <button onClick={startWs}>Authenticate Web Socket</button> */}
                <button onClick={getQuotesLive}>Start Price Stream</button>
                <button onClick={closeQuotesLive}>Stop Price Stream</button>
            </div>
        </>
    )
}

export default BtcPrice