import React, { use, useEffect } from 'react'
import useAuthContext from '../hooks/useAuthContext'

const Home = () => {
    const { state } = useAuthContext()
    const {user} = state;

    return (
        <div>
        <h1>Welcome {user?.name}</h1>
        </div>
    )
}

export default Home
