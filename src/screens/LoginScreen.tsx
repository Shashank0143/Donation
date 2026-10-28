import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { Alert } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleLoginApi, googleLoginApi, guestLoginApi } from '../api/auth.api';
import appStore from '../store/appStore';
import Fonts from '../constants/Fonts';
import Toast from 'react-native-toast-message';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import { appleAuth } from '@invertase/react-native-apple-authentication';
// import { AsyncStorage } from 'react-native';


export default function LoginScreen({ navigation }: any) {

  const onGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const response = await GoogleSignin.signIn();
      if (!response?.data) {
        return

      }
      await AsyncStorage.setItem('LOGIN_TYPE', 'google');
      const payload = {
        idToken: response.data?.idToken,
        // idToken: 0,
      };


      const apiResponse = await googleLoginApi(payload);
      appStore.setLoginData(apiResponse.data);

      navigation.replace('MainTabs');
    } catch (error: any) {

      if (
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        Toast.show({
          type: 'error',
          text1: "User cancelled login"
        })
      } else if (
        error.code === statusCodes.IN_PROGRESS
      ) {
        Toast.show({
          type: 'error',
          text1: "Sign in already in progress"
        })
      } else if (
        error.code ===
        statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        Toast.show({
          type: 'error',
          text1: "Play services not available"
        })
      } else {
        Toast.show({
          type: 'error',
          text1: error
        })
      }
    }
  };

  const onGuestLogin = async () => {
    try {

      await AsyncStorage.setItem('LOGIN_TYPE', 'guest');

      const apiResponse = await guestLoginApi();
      appStore.setLoginData(apiResponse.data);

      navigation.replace('MainTabs');
    } catch (error: any) {

      if (
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        Toast.show({
          type: 'error',
          text1: "User cancelled login"
        })
      } else if (
        error.code === statusCodes.IN_PROGRESS
      ) {
        Toast.show({
          type: 'error',
          text1: "Sign in already in progress"
        })
      } else if (
        error.code ===
        statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        Toast.show({
          type: 'error',
          text1: "Play services not available"
        })
      } else {
        Toast.show({
          type: 'error',
          text1: error
        })
      }
    }
  };

  const handleAppleLogin = async () => {

    try {


      const appleAuthRequestResponse =
        await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,

          requestedScopes: [
            appleAuth.Scope.FULL_NAME,
            appleAuth.Scope.EMAIL,
          ],
        });


      const credentialState =
        await appleAuth.getCredentialStateForUser(
          appleAuthRequestResponse.user
        );

      if (
        credentialState !==
        appleAuth.State.AUTHORIZED
      ) {
        return;
      }

      await AsyncStorage.setItem('LOGIN_TYPE', 'apple');
      const payload = {
        code: appleAuthRequestResponse.authorizationCode,
        idToken: appleAuthRequestResponse.identityToken,
        user: {
          "name": { "firstName": appleAuthRequestResponse.fullName?.givenName || null, "lastName": appleAuthRequestResponse.fullName?.familyName || null }, "email": appleAuthRequestResponse?.email || null
        }
      };

      // appStore.authCode = appleAuthRequestResponse.authorizationCode??"";
      // ==================================================
      // 11. Navigate after successful login
      // ==================================================
      let apiResponse = await appleLoginApi(payload);
      apiResponse.data["authorizationCode"] = appleAuthRequestResponse.authorizationCode;
      appStore.setLoginData(apiResponse.data);
      navigation.replace('MainTabs');
    } catch (error) {

    }
  };
  return (
    <ScreenContainer style={{ paddingHorizontal: scale(20) }}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          Welcome Back
        </Text>

        <View style={styles.divider} />

        {/* Center Illustration */}
        <View style={styles.centerSection}>
          <Image
            source={require('../assets/images/login-lock.png')}
            style={styles.lockImage}
            resizeMode="contain"
          />

          <Text style={styles.subText}>
            Log in to continue making a
            {'\n'}
            difference.
          </Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={onGoogleLogin}>
            <Image
              //   name="logo-google"
              source={require('../assets/images/google.png')}
              style={styles.googleAppleImage}
              //   color="#EA4335"
              resizeMode="contain"
            />

            <Text style={styles.buttonText}>
              Log in with Google
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleLogin}>
            <Image
              source={require('../assets/images/apple.png')}
              style={styles.googleAppleImage}
              resizeMode="contain"
            />

            <Text style={styles.buttonText}>
              Log in with Apple
            </Text>
          </TouchableOpacity>}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={onGuestLogin}>
            <Image
              //   name="logo-google"
              source={require('../assets/images/person.png')}
              style={styles.googleAppleImage}
              //   color="#EA4335"
              resizeMode="contain"
            />

            <Text style={styles.buttonText}>
              Login As Guest
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Decoration */}
        <View style={styles.bottomContainer}>
          <Image
            source={require('../assets/images/login-leaf.png')}
            style={styles.bottomImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mainContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
  },

  heading: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(38),
    textAlign: 'center',
    color: '#1F2937',
    fontFamily: Fonts.PlayfairDisplay.regular,
  },

  divider: {
    height: verticalScale(1),
    backgroundColor: '#E4E4E4',
    marginTop: verticalScale(15),
  },

  centerSection: {
    alignItems: 'center',
    marginTop: verticalScale(40),
  },

  lockImage: {
    width: scale(250),
    height: verticalScale(214),
  },

  googleAppleImage: {
    width: scale(20),
    height: verticalScale(20),
  },

  subText: {
    marginTop: verticalScale(25),
    fontSize: moderateScale(14),
    textAlign: 'center',
    color: '#1F2937',
    fontFamily: Fonts.Inter.medium,
  },

  buttonContainer: {
    marginTop: verticalScale(40),
    gap: verticalScale(15),
  },

  socialButton: {
    height: verticalScale(40),
    borderWidth: 1,
    borderColor: '#CFCFD2',
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  buttonText: {
    flex: 1,
    textAlign: 'center',
    marginRight: scale(25),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.medium,
    color: '#000000',
  },

  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  bottomImage: {
    width: scale(390),
    height: verticalScale(140),
    marginBottom: verticalScale(30),
  },
});