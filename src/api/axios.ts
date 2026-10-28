// import axios from 'axios';


// export default api;
import axios from 'axios';
import appStore from '../store/appStore';

const api = axios.create({
  baseURL: 'https://brijkosh.com/api',
  // baseURL: 'https://c7b1-2401-4900-1f37-26cb-1e0-8c1c-93e8-d8c5.ngrok-free.app/api',
  timeout: 30000,
});

api.interceptors.request.use(
  config => {
    // console.log('🌐 AXIOS REQUEST');
    // console.log('URL:', `${config.baseURL}${config.url}`);
    // console.log('Method:', config.method);
    // console.log('Headers:', config.headers);
    // console.log('Data:', config.data);
    appStore.setLoading(true);
    return config;
  },
  error => {
    appStore.setLoading(false);
    // console.log('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    // console.log('✅ AXIOS RESPONSE');
    // console.log('Status:', response.status);
    // console.log('URL:', response.config.url);
    // console.log('Data:', response.data);
    appStore.setLoading(false);
    return response;
  },
  error => {
    // console.log('❌ AXIOS RESPONSE ERROR');
    // console.log('URL:', error.config?.url);
    // console.log('Status:', error.response?.status);
    // console.log('Data:', error.response?.data);
    appStore.setLoading(false);
    return Promise.reject(error);
  }
);

export default api;