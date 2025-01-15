import React, { useContext, useEffect, useState } from 'react'
import { GlobalContext } from '../Context/GlobalState';
// import { getProfileInfo } from "../Helpers/HelperFunctions";

function Login() {
    const { auth, username, email } = useContext(GlobalContext);

    // Function to clear local storage data
    function clearCache(){
        localStorage.clear();
        console.log("Storage cleared!");
    }

    return (
        <>
            <div className="name">
                <div><u>Uname</u> - {username}</div>
                <div><u>E-mail</u> - {email}</div>
            </div>

            <div className="login">
                <button className="loginButton" onClick={auth}>Authenticate</button>
                <button onClick={clearCache}>Clear Cache</button>
            </div>
            
        </>
    )
}

export default Login