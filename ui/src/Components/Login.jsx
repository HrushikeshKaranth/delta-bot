import React, { useContext, useState } from 'react'
import { getProfileInfo } from "../Helpers/HelperFunctions";
import { GlobalContext } from '../Context/GlobalState';

function Login() {
    const { startWs } = useContext(GlobalContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    function logout(){
        localStorage.clear();
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
                        await startWs();
                        if (data1) {
                            setUsername(data1.username);
                            setEmail(data1.email);
                        } else {
                            console.log("Couldn't Authenticate! ");
                        }
                    }}
                >Authenticate</button>
                <button onClick={logout}>Logout</button>
            </div>
            
        </>
    )
}

export default Login