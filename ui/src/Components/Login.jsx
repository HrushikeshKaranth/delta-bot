import React, { useContext, useState } from 'react'
import { getProfileInfo } from "../Helpers/HelperFunctions";
import { GlobalContext } from '../Context/GlobalState';

function Login() {
    const { startWs } = useContext(GlobalContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    function clearCache(){
        localStorage.clear();
        console.log("Cache cleared!");
    }
    return (
        <>
            <div className="name">
                <div><u>Uname</u> - {username}</div>
                <div><u>E-mail</u> - {email}</div>
            </div>

            <div className="login">
                <button className="loginButton"
                    onClick={async () => {
                        let data1 = await getProfileInfo();
                        if (data1) {
                            await startWs();
                            setUsername(data1.username);
                            setEmail(data1.email);
                        } else {
                            console.log("Couldn't Authenticate! ");
                        }
                    }}
                >Authenticate</button>
                <button onClick={clearCache}>Clear Cache</button>
            </div>
            
        </>
    )
}

export default Login