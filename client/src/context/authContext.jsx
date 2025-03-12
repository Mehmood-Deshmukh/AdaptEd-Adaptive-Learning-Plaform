import React, { useEffect } from "react";

import { createContext, useReducer } from "react";

const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    Loading: true,
    user: null,
};

const authReducer = (state, action) => {
    switch (action.type){
        case "LOGIN_SUCCESS":
        case "REGISTER_SUCCESS":
            localStorage.setItem("token", action.payload.token);
            return {
                ...state,
                isAuthenticated: true,
                Loading: false,
                user: action.payload.user,
            };
        case "LOADING":
            return {
                ...state,
                Loading: true,
            };
        case "LOGOUT":
            localStorage.removeItem("token");
            return {
                ...state,
                isAuthenticated: false,
                Loading: false,
                user: null,
            };
        case "UPDATE_USER":
            return {
                ...state,
                user: action.payload,
            };
        default:
            return state;
    }
}

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const checkAuth = async (token) => {
        try {

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/check-auth`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            

            if (res.ok) {
                const data = await res.json();
                dispatch({
                    type: "LOGIN_SUCCESS",
                    payload: { user: data.data, token },
                });
            } else {
                dispatch({ type: "LOGOUT" });
            }
        } catch (error) {

            dispatch({ type: "LOGOUT" });
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            checkAuth(token);
        } else {
            dispatch({ type: "LOGOUT" });
        }
    }
    , []);
        

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};


export { AuthContext, AuthProvider };