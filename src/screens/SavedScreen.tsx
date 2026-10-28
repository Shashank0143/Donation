import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';

import ScreenContainer from '../components/ScreenContainer';
import { observer } from 'mobx-react-lite';
import appStore from '../store/appStore';
import { handleGuestLogout, saveItem } from '../api/auth.api';
import Toast from 'react-native-toast-message';
import Fonts from '../constants/Fonts';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import LogoutModal from '../components/LogoutModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SavedScreen({ navigation }: any) {
  const saved = appStore.savedWebsites;
  const user = appStore.user;
  const removeSaved = async (
    websiteId: number,
  ) => {
    try {
      // await unsaveWebsiteApi(websiteId);
      let res = await saveItem(websiteId, false, user?.userid);
      if (res?.success) {

        appStore.removeSavedWebsite(
          websiteId,
        );
      }
    } catch (error) {
    }
  };
  const [guestAlertModalVisible, setGuestAlertModalVisible] = useState(false);
  const loginType = AsyncStorage.getItem('LOGIN_TYPE');
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity style={{ flexDirection: 'row' }}
        onPress={() => {
          navigation.navigate('CharityDetails', {
            webcategory: item.webcategory,
            websiteid: item.websiteid
          });
        }
        }
      >
        <Image
          source={{
            uri:
              item.iconurl ||
              'https://via.placeholder.com/150',
          }}
          style={styles.logo}
        />

        <View style={styles.info}>
          <Text style={styles.name}>
            {item.websiteName}
          </Text>

          <Text style={styles.location}
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          if (await loginType == 'guest') {
            setGuestAlertModalVisible(true);
          } else {
            removeSaved(item.websiteid);
          }
        }}
      >
        <Image
          source={require('../assets/images/filled_heart.png')}
          style={{ height: 22, width: 22 }}
        // resizeMode="contain"
        />
      </TouchableOpacity>
      <LogoutModal
        visible={guestAlertModalVisible}
        onCancel={() => setGuestAlertModalVisible(false)}
        onConfirm={() => {
          setGuestAlertModalVisible(false);
          handleGuestLogout(navigation)
        }}
        description="Please login to unsave charities to your account."
        title="Hey Guest!"
        buttonText="Login"
      />
    </View>
  );

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.heading}>Saved</Text>

      <FlatList
        data={saved}
        keyExtractor={item =>
          item.websiteid.toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('../assets/images/heart.png')}
              style={{ height: 60, width: 60 }}
            // resizeMode="contain"
            />
            <Text style={styles.emptyText}>
              No saved charities yet
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
export default observer(SavedScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F5F7',
    paddingHorizontal: scale(24),
  },

  heading: {
    fontSize: moderateScale(38),
    color: '#23345D',
    fontFamily: Fonts.PlayfairDisplay.regular,
    marginTop: verticalScale(20),
    marginBottom: verticalScale(25),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: moderateScale(8),
    elevation: 2,
    justifyContent: 'space-between',
  },

  logo: {
    width: scale(72),
    height: verticalScale(72),
    borderRadius: moderateScale(14),
    resizeMode: 'contain',
  },

  info: {
    marginLeft: scale(14),
    width: scale(182),
  },

  name: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Inter.bold,
    color: '#273142',
  },

  location: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(13),
    fontFamily: Fonts.Inter.regular,
    color: '#7A8595',
  },

  emptyContainer: {
    marginTop: verticalScale(120),
    alignItems: 'center',
  },

  emptyText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(18),
    color: '#7A8595',
  },
});