import React, { createContext, useReducer, useEffect } from 'react';
import api from '../api.js';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

// Create context
export const AuthContext = createContext();

// Initial state
const initialState = {
  isAuthenticated: false,
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
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      return {
        ...state,
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

  // Set auth token for API requests
  const setAuthToken = async (user) => {
    if (user) {
      // Get the ID token from Firebase user
      const token = await user.getIdToken();
      // Set the token in api headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Remove the token from api headers
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Load user function - called when auth state changes
  const handleAuthStateChanged = async (user) => {
    console.log('AuthContext handleAuthStateChanged: user object:', user);
    if (user) {
      console.log('AuthContext handleAuthStateChanged: User is authenticated');
      try {
        // Set the auth token for API requests
        await setAuthToken(user);

        // Get additional user data from your backend if needed
        // This is optional - you can also just use the Firebase user data
        try {
          const res = await api.get('/api/auth/me');
          // Combine Firebase user with any additional backend data
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            ...res.data
          };
          
          dispatch({
            type: 'USER_LOADED',
            payload: userData
          });
        } catch (err) {
          // If backend call fails, still authenticate with Firebase data
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          };
          
          dispatch({
            type: 'USER_LOADED',
            payload: userData
          });
        }
      } catch (err) {
        dispatch({ 
          type: 'AUTH_ERROR',
          payload: err.message
        });
      }
    } else {
      console.log('AuthContext handleAuthStateChanged: User is NOT authenticated');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log('AuthContext useEffect: Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChanged);
    
    // Cleanup subscription on unmount
    return () => {
      console.log('AuthContext useEffect: Cleaning up auth state listener');
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Google Sign-In
  const login = async () => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await signInWithPopup(auth, googleProvider);
      // The user info will be handled by the onAuthStateChanged listener
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.message
      });
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      // The auth state change will be handled by the onAuthStateChanged listener
    } catch (err) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: err.message
      });
    }
  };

  // Clear errors
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};