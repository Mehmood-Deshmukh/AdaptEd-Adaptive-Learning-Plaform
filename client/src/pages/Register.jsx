import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Create an account</h2>
        <p className="text-left mt-4 mb-2">Full Name</p>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
         <p className="text-left  mb-2">Email Address</p>
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
         <p className="text-left mb-2">Password</p>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />
         <p className="text-left  mb-2">Confirm Password</p>
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />

        <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 cursor-pointer	">
          Create account
        </button>

        <p className="mt-4 text-gray-600">
    
          Already have an account? <Link to="/login" className="text-blue-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
