import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  ImageBackground,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { observer } from 'mobx-react-lite';
import appStore from '../store/appStore';
import { applelogoutApi, handleGuestLogout, saveItem } from '../api/auth.api';

const { width } = Dimensions.get('window');
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import LogoutModal from '../components/LogoutModal';
import Fonts from '../constants/Fonts';
import { scale, verticalScale, moderateScale } from '../utils/responsive';
import appleAuth from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';





function HomeScreen({ navigation }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const carouselRef = useRef<FlatList>(null);
  const user = appStore.user;
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [guestAlertModalVisible, setGuestAlertModalVisible] = useState(false);
  const loginType = AsyncStorage.getItem('LOGIN_TYPE');
  const handleLogout = async () => {
    try {
      const loginType = await AsyncStorage.getItem('LOGIN_TYPE');


      setLogoutModalVisible(false);
      console.log('Logout type:', loginType);
      if (loginType === 'google') {
        await GoogleSignin.signOut();
      }

      if (loginType === 'apple') {

        // Call your backend logout API
        await applelogoutApi();
      }

      await AsyncStorage.removeItem('LOGIN_TYPE');



      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

    } catch (error) {

    }
  };


  const causes = appStore.categories
    .slice(0, 4)
    .map((item: any) => ({
      ...item
    }));

  const charities = appStore.categories
    .flatMap(
      (category: any) => category.Websites || [],
    )
    .filter(
      (website: any) => website.webrank === 1,
    );
  const isSaved = (websiteId: number) => {
    return appStore.savedWebsites.some(
      item => item.websiteid === websiteId,
    );
  };

  const allWebsites = appStore.categories.flatMap(
    (category: any) => category.Websites || [],
  );

  const filteredWebsites =
    searchText.trim().length > 0
      ? allWebsites.filter((item: any) =>
        item.websiteName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()),
      )
      : [];
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';

    return 'Good evening';
  };
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(40), paddingHorizontal: scale(20) }}>
        {/* Header */}
        <View style={[styles.header]}>
          <View style={{ width: scale(298) }}>
            <Text style={styles.heading}>
              {getGreeting()}, {user?.first_name || 'Guest'}
            </Text>

            <Text style={styles.subHeading}>
              Let's make a difference today.
            </Text>
          </View>
          <View>
            <TouchableOpacity style={styles.notificationBtn}
              onPress={() => setLogoutModalVisible(true)}
            >
              <Image
                source={require('../assets/images/logout.png')}
                style={{ height: verticalScale(24), width: scale(24) }}
              // resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <LogoutModal
            visible={logoutModalVisible}
            onCancel={() => setLogoutModalVisible(false)}
            onConfirm={handleLogout}
            description="Are you sure you want to logout from your account?"
            title="Logout?"
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Image
            source={require('../assets/images/search.png')}
            style={{ height: verticalScale(18), width: scale(18) }}
          // resizeMode="contain"
          />

          <TextInput
            placeholder="Search charities"
            placeholderTextColor="#6B7280"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {searchText.trim().length > 0 &&
          filteredWebsites.length > 0 && (
            <View style={styles.searchResults}>
              {filteredWebsites.slice(0, 8).map(
                (item: any) => (
                  <TouchableOpacity
                    key={item.websiteid}
                    style={styles.searchItem}
                    onPress={() => {
                      setSearchText('');

                      navigation.navigate(
                        'CharityDetails',
                        {
                          webcategory: item.webcategory,
                          websiteid: item.websiteid
                        },
                      );
                    }}>
                    <Image
                      source={require('../assets/images/search.png')}
                      style={{ height: verticalScale(16), width: scale(16) }}
                    // resizeMode="contain"
                    />
                    <View
                      style={{
                        marginLeft: scale(10),
                        flex: 1,
                      }}>
                      <Text
                        style={
                          styles.searchItemTitle
                        }>
                        {item.websiteName}
                      </Text>

                      <Text
                        style={
                          styles.searchItemCategory
                        }>
                        {item.webcategory}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}
        {searchText.trim().length > 0 &&
          filteredWebsites.length === 0 && (
            <View style={styles.searchResults}>
              <Text
                style={{
                  padding: scale(15),
                  color: '#6B7280',
                }}>
                No charities found
              </Text>
            </View>
          )}

        {/* Causes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Popular Causes
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Explore');
            }}
          >
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}>
          {causes.map(item => (

            <TouchableOpacity
              key={item.Category}
              style={styles.causeItem}
              onPress={() =>
                navigation.navigate('CauseDetails', {
                  categoryName: item.Category,
                })
              }>
              <View>
                <View>
                  <Image
                    source={{
                      uri: item.category_icon?.replace(
                        '/image/upload/',
                        '/image/upload/f_webp,q_auto/'
                      ),
                      // uri: "https://cdn-icons-png.flaticon.com/128/3579/3579201.png"
                    }}
                    style={styles.categoryIcon}
                    resizeMode="cover"
                  />
                </View>
              </View>

              <Text style={styles.causeText}>
                {item.Category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Charity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Featured Charity
          </Text>

          {/* <TouchableOpacity>
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity> */}
        </View>

        <FlatList
          ref={carouselRef}
          data={charities}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          onMomentumScrollEnd={event => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x /
              width,
            );

            setActiveIndex(index);
          }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { width: width - scale(40) },
              ]}>
              <ImageBackground
                source={{
                  uri:
                    item.webimageurl ||
                    'https://via.placeholder.com/500',
                  // uri:'https://www.cancer.org/adobe/dynamicmedia/deliver/dm-aid--a526dff4-0dc6-4239-8c09-d35ae66fa1f1/fy27q1-august-hero-givingday-hero-708x398.jpg?preferwebp=true&width=1440&quality=82'
                }}
                style={styles.ImageBackground}
                resizeMode="cover"
              >
                <View style={styles.cardImage}>
                  <TouchableOpacity
                    style={styles.favoriteBtn}
                    onPress={async () => {
                      if (await loginType == 'guest') {
                        setGuestAlertModalVisible(true);
                        return;
                      }
                      if (item.IsLiked) {
                        let res = await saveItem(item.websiteid, false, user?.userid);
                        if (res?.success) {

                          appStore.removeSavedWebsite(
                            item.websiteid,
                          );
                        }
                      } else {
                        let res = await saveItem(item.websiteid, true, user?.userid);
                        if (res?.success) {
                          appStore.addSavedWebsite(item);
                        }
                      }
                    }}
                  >
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

                  <View style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.cardTitle}
                      // numberOfLines={2}
                      // ellipsizeMode='tail'
                      >
                        {item.websiteName}
                      </Text>
                    </View>

                    <Text style={styles.cardDescription}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {item.desc}
                    </Text>

                    <TouchableOpacity
                      style={styles.learnMoreBtn}
                      onPress={() => {
                        navigation.navigate('CharityDetails', {
                          webcategory: item.webcategory,
                          websiteid: item.websiteid
                        });
                      }
                      }
                    >
                      <Text
                        style={styles.learnMoreText}>
                        Learn More →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}
        />

        {/* Pagination */}
        <View style={styles.pagination}>
          {charities.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex &&
                styles.activeDot,
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
export default observer(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F6',
    paddingHorizontal: scale(20),
  },

  header: {
    marginTop: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heading: {
    fontSize: moderateScale(24),
    color: '#1B2A4A',
    fontFamily: Fonts.PlayfairDisplay.bold,
  },

  subHeading: {
    marginTop: verticalScale(6),
    color: '#6B7280',
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.regular,
  },

  notificationBtn: {
    width: scale(50),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    marginTop: verticalScale(24),
    height: verticalScale(46),
    backgroundColor: '#FFF',
    borderRadius: moderateScale(28),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },

  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.regular,
    marginLeft: scale(10),
    color: '#6B7280',
  },

  sectionHeader: {
    marginTop: verticalScale(28),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.PlayfairDisplay.bold,
    color: '#23345D',
  },

  viewAll: {
    color: '#1E6B8A',
    fontSize: moderateScale(13),
    fontFamily: Fonts.Inter.semiBold,
  },

  causeItem: {
    marginTop: verticalScale(18),
    marginRight: scale(16),
    alignItems: 'center',
    width: scale(80),
  },

  causeText: {
    marginTop: verticalScale(10),
    textAlign: 'center',
    fontSize: moderateScale(11),
    fontFamily: Fonts.Inter.semiBold,
  },

  card: {
    height: verticalScale(320),
    marginTop: verticalScale(20),
    borderRadius: moderateScale(30),
    overflow: 'hidden',
  },

  ImageBackground: {
    width: '100%',
    height: '100%',
  },

  cardImage: {
    width: '100%',
    height: '100%',
    padding: scale(20),
    flex: 1,
    justifyContent: 'space-between',
  },

  favoriteBtn: {
    backgroundColor: '#FFF',
    width: scale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(23),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },

  cardContent: {
    justifyContent: 'space-between',
    // height: verticalScale(180),
    backgroundColor: '#FFF',
    borderRadius: moderateScale(20),
    padding: scale(16),
  },

  cardTitle: {
    fontSize: moderateScale(18),
    fontFamily: Fonts.PlayfairDisplay.bold,
    color: '#1B2A4A',
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardDescription: {
    fontFamily: Fonts.Inter.regular,
    color: '#6B7280',
    lineHeight: verticalScale(18),
    marginBottom: verticalScale(10),
    fontSize: moderateScale(12),
  },

  learnMoreBtn: {
    backgroundColor: '#4594BB',
    height: verticalScale(36),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  learnMoreText: {
    color: '#FFF',
    fontSize: moderateScale(13),
    fontFamily: Fonts.Inter.bold,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(18),
  },

  dot: {
    width: scale(8),
    height: verticalScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#D0D0D0',
    marginHorizontal: scale(4),
  },

  activeDot: {
    width: scale(24),
    backgroundColor: '#4B96C8',
  },

  searchResults: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(16),
    marginTop: verticalScale(8),
    paddingVertical: verticalScale(6),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(5),
    zIndex: 999,
  },

  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
  },

  searchItemTitle: {
    fontSize: moderateScale(14),
    color: '#23345D',
    fontWeight: '600',
  },

  searchItemCategory: {
    fontSize: moderateScale(11),
    color: '#6B7280',
    marginTop: verticalScale(2),
  },

  categoryIcon: {
    width: scale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(16),
  },
});