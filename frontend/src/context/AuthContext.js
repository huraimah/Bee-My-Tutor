import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token
  const setAuthToken = token => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Load user function
  const loadUser = async () => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
    }

    try {
      const res = await axios.get('/api/auth/me');
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
    } catch (err) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  // Load user on initial render
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register user
  const register = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      console.log('Sending registration data to server:', formData);
      const res = await axios.post('/api/auth/register', formData, config);
      console.log('Registration response:', res.data);
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });

      loadUser();
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.msg || 'Registration failed'
      });
    }
  };

  // Login user
  const login = async formData => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const res = await axios.post('/api/auth/login', formData, config);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data
      });

      loadUser();
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response.data.msg
      });
    }
  };

  // Logout
  const logout = () => dispatch({ type: 'LOGOUT' });

  // Clear errors
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  // No need for a second loadUser function as it's already defined above

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        clearError,
        loadUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};