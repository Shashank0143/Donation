import Toast from 'react-native-toast-message';
import appStore from '../store/appStore';
import api from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const googleLoginApi = async (payload: any) => {
  try {
    const response = await api.post(
      '/auth/google-callback',
      payload,
    );
    console.log('✅ API SUCCESS', response);
    return response.data;
  } catch (error: any) {
    console.log('❌ API FAILED', error);
    // console.log('❌ API FAILED');

    // console.log('Error message:', error.message);
    // console.log('Error status:', error.response?.status);
    // console.log('Error data:', error.response?.data);
    // console.log('Error headers:', error.response?.headers);
    Toast.show({
      type: 'error',
      text1: error.message
    })
    throw error;
  }

};
export const guestLoginApi = async () => {
  try {
    const response = await api.post(
      '/auth/guest/login'
    );
    console.log('✅ API SUCCESS', response);
    return response.data;
  } catch (error: any) {
    console.log('❌ API FAILED', error);
    Toast.show({
      type: 'error',
      text1: error.message
    })
    throw error;
  }

};
export const handleGuestLogout = async (navigation: any) => {
  try {
    await AsyncStorage.removeItem('LOGIN_TYPE');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });

  } catch (error) {

  }
};
export const appleLoginApi = async (payload: any) => {
  try {
    const response = await api.post(
      '/auth/apple-callback',
      payload,
    );
    return response.data;
  } catch (error: any) {
    // console.log('❌ API FAILED');

    // console.log('Error message:', error.message);
    // console.log('Error status:', error.response?.status);
    // console.log('Error data:', error.response?.data);
    // console.log('Error headers:', error.response?.headers);
    Toast.show({
      type: 'error',
      text1: error.message
    })
    throw error;
  }

};
export const applelogoutApi = async () => {
  try {
    const response = await api.post('/auth/apple-logout', {
      code: appStore.authCode
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appStore.token}`,
      },
    }

    );
    console.log('✅ API SUCCESS', response);
    return response.data;
  } catch (error) {
    console.log('❌ API FAILED', error);
    // console.log(
    //   'Logout API Error:',
    //   error?.response?.data || error?.message
    // );
    throw error;
  }
};

export const deactivateAccountApi = async () => {
  try {
    const response = await api.post(
      '/users/delete-account',
      {
        userid: appStore.user?.userid,
        email: appStore.user?.email,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${appStore.token}`,
        },
      }
    );
    if (response.data.success) {

      Toast.show({
        type: 'success',
        text1: response.data.message,
      });
    }
    return response.data;
  } catch (error: any) {
    // console.log('❌ API FAILED');

    // console.log('Error message:', error.message);
    // console.log('Error status:', error.response?.status);
    // console.log('Error data:', error.response?.data);
    // console.log('Error headers:', error.response?.headers);
    Toast.show({
      type: 'error',
      text1: error.message
    })
    throw error;
  }
};
export const saveItem = async (
  websiteId: any,
  opt: any,
  userId: any
) => {

  try {
    const response = await api.post(
      '/users/saved',
      {
        websiteId,
        opt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          userId,
          Authorization: `Bearer ${appStore.token}`,
        },
      }
    );

    // console.log('✅ API SUCCESS');
    // console.log('Status:', response.status);
    // console.log('Response:', response.data);
    if (response.data.success) {

      Toast.show({
        type: 'success',
        text1: response.data.message,
      });
    }

    return response.data;
  } catch (error: any) {
    // console.log('❌ API FAILED');

    // console.log('Error message:', error.message);
    // console.log('Error status:', error.response?.status);
    // console.log('Error data:', error.response?.data);
    // console.log('Error headers:', error.response?.headers);
    Toast.show({
      type: 'error',
      text1: error.message
    })
    throw error;
  }
};

export const updateProfile = async (
  formData: FormData,
  userId: string,
  token: string,
) => {
  try {
    const response = await api.post(
      '/users/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          userId,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.data.success) {

      Toast.show({
        type: 'success',
        text1: response.data.message,
      });
    }
    return response.data;
  } catch (error: any) {
    // console.log('❌ API FAILED');

    // console.log('Error message:', error.message);
    // console.log('Error status:', error.response?.status);
    // console.log('Error data:', error.response?.data);
    // console.log('Error headers:', error.response?.headers);
    Toast.show({
      type: 'error',
      text1: error.message
    })
    throw error;
  }



};