import React from 'react'
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen  p-5 w-full max-w-md mx-auto">
       <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-md">
    <h2 className="mb-8 text-5xl font-bold">Welcome back</h2>

    <p className='text-center text-gray-600'>Sign in to access your account</p>
   
    <div className="w-full mt-5">
      <p className="text-left">Email Address</p>
      <input type="email" placeholder="Email Address" className="w-full border border-gray-400 p-2 rounded-md" />
      
      <p className="text-left mt-4">Password</p>
      <input type="password" placeholder="Password" className="w-full border border-gray-400 p-2 rounded-md" />
    </div>
  
    <div className="options w-full flex justify-between mt-4">
      <label><input type="checkbox" /> Remember me</label>
      <Link to="/forgot-password" className="text-blue-500">Forgot password?</Link>
    </div>
  
    <button className="mt-4 bg-blue-500 text-white p-2 rounded-md w-full cursor-pointer		">Sign in</button>
  
    <p className="mt-4">Don't have an account? <Link to="/signup" className="text-blue-500">Sign up</Link></p>
    </div>
  </div>
  
  );
};


export default Login
