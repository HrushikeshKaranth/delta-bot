import React, { useContext, useEffect, useRef, useState } from 'react'
import { GlobalContext } from '../Context/GlobalState';

function BtcPrice() {
    const { btc_mark_price, getQuotesLive, closeQuotesLive, wsReset, startWs, restartWs, connectionLight, isConnected

    } = useContext(GlobalContext);
    return (

        <>
            {/* <div><span>{connectionLight}</span><u>Bitcoin</u> - {btc_mark_price}</div> */}
            <div><span>{connectionLight}</span><u>Etherium</u> - {btc_mark_price}</div>
            {/* <div>
                <button onClick={getQuotesLive}>Start Price Stream</button>
                <button onClick={closeQuotesLive}>Stop Price Stream</button>
            </div> */}
        </>
    )
}

export default BtcPrice