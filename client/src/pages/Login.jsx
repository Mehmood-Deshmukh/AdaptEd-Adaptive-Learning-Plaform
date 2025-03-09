import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate inputs
    if (!email || !password) {
      console.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }
    
    // Simulate API call to authenticate user
    console.log('Attempting login with:', { email, rememberMe });
    
    // This would be replaced with your actual authentication API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login successful');
      // You would typically redirect the user or update application state here
      // Example: navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full shadow-4" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-5">
          <h2 className="text-4xl font-bold mb-2 text-primary">Welcome Back</h2>
          <p className="text-color-secondary text-sm">Sign in to continue to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-column gap-4">
          <div className="flex flex-column gap-2">
            <label htmlFor="email" className="font-medium text-sm">Email Address</label>
            <span className="p-input-icon-left w-full">
              <i className="pi pi-envelope" />
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-inputtext-sm"
                required
              />
            </span>
          </div>
          
          <div className="flex flex-column gap-2">
            <label htmlFor="password" className="font-medium text-sm">Password</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              toggleMask
              className="w-full p-inputtext-sm"
              feedback={false}
              required
            />
          </div>
          
          <div className="flex justify-content-between align-items-center">
            <div className="flex align-items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.checked)}
                className="p-checkbox-sm"
              />
              <label htmlFor="rememberMe" className="text-sm">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-primary text-sm no-underline hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <Button
            type="submit"
            label="Sign In"
            icon="pi pi-lock-open"
            className="w-full p-button-primary p-button-raised"
            loading={isLoading}
          />
          

          
          <p className="text-center mt-2 text-sm">
            Don't have an account? <Link to="/register" className="text-primary font-medium no-underline hover:underline">Sign up</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

export default Login;