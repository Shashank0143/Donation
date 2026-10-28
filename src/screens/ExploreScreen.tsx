import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import { observer } from 'mobx-react-lite';
import appStore from '../store/appStore';
import Fonts from '../constants/Fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from '../utils/responsive';



function ExploreScreen() {
  const navigation = useNavigation<any>();
  const categories = appStore.categories;
  const [searchText, setSearchText] = useState('');

  const allWebsites = appStore.categories.flatMap(
    (category: any) => category.Websites || [],
  );
  const insets = useSafeAreaInsets();
  const filteredWebsites =
    searchText.trim().length > 0
      ? allWebsites.filter((item: any) =>
        item.websiteName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()),
      )
      : [];
  return (
    <ScreenContainer style={{
      flex: 1,
      backgroundColor: '#EEF4FD',
      paddingHorizontal: scale(24), paddingBottom: insets.bottom + verticalScale(5)
    }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: verticalScale(30) }}>

        <Text style={styles.heading}>Explore</Text>

        <View style={styles.searchContainer}>
          <Image
            source={require('../assets/images/search.png')}
            style={{ height: verticalScale(18), width: scale(18) }}
          // resizeMode="contain"
          />
          <TextInput
            placeholder="Search charities..."
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

        {categories.map(item => (
          <TouchableOpacity
            // key={item.id}
            activeOpacity={0.8}
            style={styles.card}
            onPress={() =>
              navigation.navigate('CauseDetails', {
                categoryName: item.Category,
              })
            }>
            <View
            >
              <Image
                source={{
                  uri: item.category_icon.replace(
                    '/image/upload/',
                    '/image/upload/f_webp,q_auto/'
                  ),
                  // uri: 'https://cdn-icons-png.flaticon.com/128/3579/3579201.png'
                }}

                // resizeMode="cover"

                style={[{ height: verticalScale(44), width: scale(44), borderRadius: moderateScale(32) }]}
              />
              {/* <Image
                source={{
                  uri:
                    "https://plus.unsplash.com/premium_photo-1666672388644-2d99f3feb9f1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                }}
                style={[{ height: "100%", width: "100%", backgroundColor: "yellow", borderRadius: 14 }]}
              /> */}
            </View>

            <View style={styles.info}>
              <Text style={styles.title}>
                {item.Category}
              </Text>

              <Text style={styles.subtitle}>
                {item.TotalEntries} Organisation
              </Text>
            </View>

            <Image
              source={require('../assets/images/chevron-right.png')}
              style={{ height: verticalScale(22), width: scale(22) }}
            // resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
export default observer(ExploreScreen);

const styles = StyleSheet.create({
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

  container: {
    flex: 1,
    backgroundColor: '#EEF4FD',
    paddingHorizontal: scale(24),
  },

  heading: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(36),
    fontFamily: Fonts.PlayfairDisplay.regular,
    color: '#1F2937',
  },

  searchContainer: {
    marginTop: verticalScale(18),
    height: verticalScale(42),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.regular,
    color: '#111827',
  },

  card: {
    marginTop: verticalScale(14),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    height: verticalScale(68),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: moderateScale(10),
    elevation: 2,
  },

  iconContainer: {},

  info: {
    flex: 1,
    marginLeft: scale(16),
  },

  title: {
    fontSize: moderateScale(15),
    fontFamily: Fonts.Inter.semiBold,
    color: '#1F2937',
  },

  subtitle: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(12),
    fontFamily: Fonts.Inter.regular,
    color: '#6B7280',
  },
});