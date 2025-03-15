import React, { use, useEffect } from 'react'
import useAuthContext from '../hooks/useAuthContext'
import LearningStyleSurvey from '../components/survey/Survey';

const Home = () => {
    const { state } = useAuthContext()
    const {user} = state;

    return (
        <div className='bg-white w-full h-[100vh]'>
        <h1 className='text-black'>Welcome {user?.name}</h1>
        <LearningStyleSurvey />
        </div>
    )
}

export default Home
