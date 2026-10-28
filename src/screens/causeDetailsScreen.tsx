import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { observer } from 'mobx-react-lite';
import appStore from '../store/appStore';
import { handleGuestLogout, saveItem } from '../api/auth.api';
import Toast from 'react-native-toast-message';
import Fonts from '../constants/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutModal from '../components/LogoutModal';
function CauseDetailsScreen({
  route,
  navigation,
}: any) {
  const { categoryName } = route.params;
  const user = appStore.user;
  const category = appStore.categories.find(
    item => item.Category === categoryName,
  );
  const toggleFavorite = async (website: any) => {
    if (website.IsLiked) {
      let res = await saveItem(website.websiteid, false, user?.userid);
      if (res?.success) {
        appStore.removeSavedWebsite(
          website.websiteid,
        );
        // Toast.show({
        //   type: 'success',
        //   text1: 'UnSaved successfully',
        // });
      }
    } else {
      let res = await saveItem(website.websiteid, true, user?.userid);
      if (res?.success) {

        appStore.addSavedWebsite(website);
        // Toast.show({
        //   type: 'success',
        //   text1: 'Saved successfully',
        // });
      }
    }
  };
  const insets = useSafeAreaInsets();
  const websites = category?.Websites || [];
  const [guestAlertModalVisible, setGuestAlertModalVisible] = useState(false);
  const loginType = AsyncStorage.getItem('LOGIN_TYPE');
  return (
    <ScreenContainer style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + verticalScale(5) }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}>
        <Image
          source={require('../assets/images/chevron-left.png')}
          style={{ height: verticalScale(28), width: scale(28) }}
        // resizeMode="contain"
        />
      </TouchableOpacity>
      <View>
        <Image
          source={{
            uri: category.category_icon.replace(
              '/image/upload/',
              '/image/upload/f_webp,q_auto/'
            ),
            // uri: 'https://cdn-icons-png.flaticon.com/128/3579/3579201.png'
          }}
          resizeMode="contain"
          style={[{ height: verticalScale(64), width: scale(64), borderRadius: moderateScale(32), alignSelf: 'center' }]}
        />

        <Text style={styles.heading}>
          {category.Category}
        </Text>

        <Text style={styles.description}>
          {category.webcategory_desc}
        </Text>
      </View>

      <FlatList
        data={websites}
        // keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        // style = {{paddingBottom:40}}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('CharityDetails', {
                webcategory: item.webcategory,
                websiteid: item.websiteid
              });
            }
            }
          >
            <View style={styles.orgCard}>
              <Image
                source={{
                  uri:
                    item.iconurl,
                }}
                style={styles.logo}
                resizeMode='contain'
              />
              {/* <View style={{ width: '180' , backgroundColor: 'red',flex: 1,  justifyContent: 'center', alignContent: 'center',alignSelf: 'center',alignItems: 'center',}}> */}
              <Text style={styles.orgName}>
                {item.websiteName}
              </Text>
              {/* </View> */}

              <TouchableOpacity
                onPress={async () => {
                  if (await loginType == 'guest') {
                    setGuestAlertModalVisible(true);
                    return;
                  }
                  toggleFavorite(item)
                }}>
                {item.IsLiked ? <Image
                  source={require('../assets/images/filled_heart.png')}
                  style={{ height: verticalScale(20), width: scale(20) }}
                // resizeMode="contain"
                /> : <Image
                  source={require('../assets/images/heart.png')}
                  style={{ height: verticalScale(20), width: scale(20) }}
                // resizeMode="contain"
                />}
              </TouchableOpacity>
              <LogoutModal
                visible={guestAlertModalVisible}
                onCancel={() => setGuestAlertModalVisible(false)}
                onConfirm={() => {
                  setGuestAlertModalVisible(false);
                  handleGuestLogout(navigation)
                }}
                description="Please login to save charities to your account."
                title="Hey Guest!"
                buttonText="Login"
              />
            </View>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}
export default observer(CauseDetailsScreen);

const styles = StyleSheet.create({
  backBtn: {
    marginTop: verticalScale(15),
    width: scale(40),
  },

  heading: {
    marginBottom: verticalScale(12),
    textAlign: 'center',
    fontSize: moderateScale(36),
    color: '#1F2937',
    fontFamily: Fonts.PlayfairDisplay.regular,
  },

  description: {
    textAlign: 'center',
    color: '#535B5B',
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.regular,
    marginBottom: verticalScale(30),
    paddingHorizontal: scale(20),
  },

  orgCard: {
    height: verticalScale(80),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',
  },

  logo: {
    width: scale(96),
    height: verticalScale(50),
    borderRadius: moderateScale(8),
    backgroundColor: '#FFF',
  },

  orgName: {
    flex: 1,
    marginLeft: scale(15),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.semiBold,
    color: '#000000',
  },
});