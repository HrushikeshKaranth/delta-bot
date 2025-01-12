import React, { useState } from 'react'
import { getProfileInfo } from "../Helpers/HelperFunctions";

function Login() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    return (
        <>
            <div className="name">
                <div><u>Username</u> - {username}</div>
                <div><u>Email</u> - {email}</div>
            </div>

            <div className="login">
                <button className="loginButton"
                    onClick={async () => {
                        let data = await getProfileInfo();
                        setUsername(data.username);
                        setEmail(data.email);
                    }}
                >Login</button>
            </div>
        </>
    )
}

export default Login