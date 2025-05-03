import axios from 'axios';

// Set default baseURL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default axios;