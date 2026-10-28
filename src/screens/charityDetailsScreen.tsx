import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Share,
} from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { observer } from 'mobx-react-lite';
import appStore from '../store/appStore';
import { handleGuestLogout, saveItem } from '../api/auth.api';
import Toast from 'react-native-toast-message';
import Fonts from '../constants/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../components/LogoutModal';

function CharityDetailsScreen({
  route,
  navigation,
}: any) {
  const { webcategory, websiteid } = route.params;
  const category = appStore.categories.find(
    (item: any) => item.Category === webcategory,
  );

  const charity = category?.Websites?.find(
    (item: any) => item.websiteid === websiteid,
  );
  const insets = useSafeAreaInsets();

  if (!charity) {
    return null;
  }
  const isLiked = charity.IsLiked;
  const user = appStore.user;

  const openUrl = async (url: string) => {
    if (!url) {
      return;
    }

    // const supported = await Linking.canOpenURL(url);
    const supported = true;
    if (supported) {
      Linking.openURL(url);
    }
  };
  const handleShare = async () => {
    const charityUrl = charity.websiteurl;

    try {
      await Share.share({
        title: charity?.websiteName || 'Support this charity',
        message: `Support ${charity?.websiteName || 'this charity'} ❤️\n\n${charityUrl}`,
        url: charityUrl,
      });
    } catch (error) {
    }
  };
  const loginType = AsyncStorage.getItem('LOGIN_TYPE');
  const [guestAlertModalVisible, setGuestAlertModalVisible] = useState(false);
  return (
    <ScreenContainer style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // paddingBottom: 40,
        }}>

        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/images/chevron-left.png')}
              style={{ height: verticalScale(20), width: scale(20) }}
            // resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={async () => {
                if (await loginType == 'guest') {
                  setGuestAlertModalVisible(true);
                  return;
                }
                if (isLiked) {
                  let res = await saveItem(charity.websiteid, false, user?.userid);
                  if (res?.success) {

                    appStore.removeSavedWebsite(
                      charity.websiteid,
                    );
                    // Toast.show({
                    //   type: 'success',
                    //   text1: 'UnSaved successfully',
                    // });
                  }
                } else {
                  let res = await saveItem(charity.websiteid, true, user?.userid);
                  if (res?.success) {

                    appStore.addSavedWebsite(charity);
                    // Toast.show({
                    //   type: 'success',
                    //   text1: 'Saved successfully',
                    // });
                  }
                }
              }}>
              {isLiked ? <Image
                source={require('../assets/images/filled_heart.png')}
                style={{ height: verticalScale(22), width: scale(22) }}
              // resizeMode="contain"
              /> : <Image
                source={require('../assets/images/heart.png')}
                style={{ height: verticalScale(22), width: scale(22) }}
              // resizeMode="contain"
              />}
            </TouchableOpacity>
            <LogoutModal
              visible={guestAlertModalVisible}
              onCancel={() => setGuestAlertModalVisible(false)}
              onConfirm={() => {
                setGuestAlertModalVisible(false);
                handleGuestLogout(navigation)
                // Navigate to login screen or handle login logic
              }}
              description="Please login to save charities to your account."
              title="Hey Guest!"
              buttonText="Login"
            />

            <TouchableOpacity
              style={{ marginLeft: scale(18) }}
              onPress={async ()=> {
                handleShare();
              } }
            >
              <Image
                source={require('../assets/images/share.png')}
                style={{ height: verticalScale(22), width: scale(22) }}
              // resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logo */}

        <View style={styles.logoContainer}>
          <Image
            source={{
              uri:
                charity.iconurl ||
                'https://via.placeholder.com/500',
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Main Card */}

        <View style={styles.card}>
          <Text style={styles.title}>
            {charity.websiteName}
          </Text>

          {charity.location ? (
            <View style={styles.locationRow}>
              <Image
                source={require('../assets/images/map-pin.png')}
                style={{ height: verticalScale(16), width: scale(16) }}
              // resizeMode="contain"
              />

              <Text style={styles.location}>
                {charity.location}
              </Text>
            </View>
          ) : null}

          {charity.desc ? (
            <Text style={styles.description}>
              {charity.desc}
            </Text>
          ) : null}

          {/* Dynamic Sections */}


          <View style={styles.infoContainer}>
            <View
              // key={index}
              style={styles.sectionItem}>
              <View style={styles.iconBox}>
                <Image
                  source={require('../assets/images/heart_blue.png')}
                  style={{ height: verticalScale(18), width: scale(18) }}
                // resizeMode="contain"
                />
              </View>

              <View style={{ width: scale(250) }}>
                <Text style={styles.sectionTitle}>
                  Our Mission
                </Text>

                <Text style={styles.sectionText}>
                  {charity.ourmission}
                </Text>
              </View>
            </View>
            <View
              // key={index}
              style={styles.sectionItem}>
              <View style={styles.iconBox}>
                <Image
                  source={require('../assets/images/users.png')}
                  style={{ height: verticalScale(18), width: scale(18) }}
                // resizeMode="contain"
                />
              </View>

              <View style={{ width: scale(250) }}>
                <Text style={styles.sectionTitle}>
                  Who They Help
                </Text>

                <Text style={styles.sectionText}>
                  {charity.whotheyHelp}
                </Text>
              </View>
            </View>
            <View
              // key={index}
              style={styles.sectionItem}>
              <View style={styles.iconBox}>
                <Image
                  source={require('../assets/images/star.png')}
                  style={{ height: verticalScale(18), width: scale(18) }}
                // resizeMode="contain"
                />
              </View>

              <View style={{ width: scale(250) }}>
                <Text style={styles.sectionTitle}>
                  Impact
                </Text>

                <Text style={styles.sectionText}>
                  {charity.impact}
                </Text>
              </View>
            </View>
          </View>



        </View>
      </ScrollView>
      {/* Donate Button */}
      <View style={{ backgroundColor: 'white', paddingHorizontal: scale(30), paddingBottom: insets.bottom + verticalScale(5), paddingTop: verticalScale(10) }}>
        {charity.donatelink ? (
          <TouchableOpacity
            style={styles.donateBtn}
            onPress={() => {
                openUrl(charity.donatelink)
            }
            }>
            <Text style={styles.donateText}>
              Donate Now
            </Text>

            <Image
              source={require('../assets/images/heart_white.png')}
              style={{ height: verticalScale(22), width: scale(22) }}
            // resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}

        {/* Website Button */}

        {charity.websiteurl ? (
          <TouchableOpacity
            style={styles.websiteBtn}
            onPress={() =>
              openUrl(charity.websiteurl)
            }>
            <Text style={styles.websiteText}>
              Visit Website
            </Text>

            <Image
              source={require('../assets/images/globe.png')}
              style={{ height: verticalScale(22), width: scale(22) }}
            // resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}</View>
    </ScreenContainer>
  );
}

export default observer(CharityDetailsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9EBFA',
  },

  header: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(16),
    marginBottom: verticalScale(20),
  },

  logo: {
    width: scale(180),
    height: verticalScale(90),
    borderRadius: moderateScale(24),
    backgroundColor: '#FFF',
  },

  card: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    padding: scale(20),
    height: '100%',
  },

  title: {
    fontSize: moderateScale(22),
    color: '#1F2937',
    fontFamily: Fonts.PlayfairDisplay.extraBold,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  location: {
    marginLeft: scale(5),
    color: '#6B7280',
    fontSize: moderateScale(13),
    fontFamily: Fonts.Inter.medium,
  },

  description: {
    marginTop: verticalScale(12),
    color: '#6B7280',
    fontSize: moderateScale(13),
    lineHeight: verticalScale(20),
    fontFamily: Fonts.Inter.regular,
  },

  infoContainer: {
    backgroundColor: '#F5F8FC',
    borderRadius: moderateScale(20),
    padding: scale(18),
    marginTop: verticalScale(25),
  },

  sectionItem: {
    flexDirection: 'row',
    marginBottom: verticalScale(20),
  },

  iconBox: {
    width: scale(36),
    height: verticalScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#EAF3FB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: scale(12),
  },

  sectionTitle: {
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.bold,
    color: '#1F2937',
  },

  sectionText: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(12),
    color: '#6B7280',
    fontFamily: Fonts.Inter.regular,
  },

  donateBtn: {
    height: verticalScale(52),
    borderRadius: moderateScale(28),
    backgroundColor: '#4A96C4',
    marginTop: verticalScale(25),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  donateText: {
    color: '#FFF',
    fontSize: moderateScale(16),
    fontFamily: Fonts.Inter.bold,
    marginRight: scale(10),
  },

  websiteBtn: {
    height: verticalScale(54),
    borderRadius: moderateScale(28),
    borderWidth: 1.5,
    borderColor: '#4A96C4',
    marginTop: verticalScale(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  websiteText: {
    color: '#4A96C4',
    fontSize: moderateScale(16),
    fontFamily: Fonts.Inter.bold,
    marginRight: scale(10),
  },
});