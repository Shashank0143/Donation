import React, { useRef, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import ScreenContainer from '../components/ScreenContainer';

import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import appStore from '../store/appStore';
import { deleteAccountApi, handleGuestLogout, updateProfile } from '../api/auth.api';
import Fonts from '../constants/Fonts';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { moderateScale, scale, verticalScale } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import DeleteAccountModal from '../components/DeleteAccountModal';
import LogoutModal from '../components/LogoutModal';

export default function ProfileScreen({ navigation }: any) {
  const formatDateForDisplay = (
    selectedDate: Date,
  ) => {
    const year =
      selectedDate.getFullYear();

    const month = String(
      selectedDate.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      selectedDate.getDate(),
    ).padStart(2, '0');

    return `${day}-${month}-${year}`;
  };

  const user = appStore.user;


  /*
   * ----------------------------------------------------
   * EXISTING PROFILE VALUES
   * ----------------------------------------------------
   */

  const [firstName, setFirstName] = useState(
    user?.first_name ?? '',
  );

  const [lastName, setLastName] = useState(
    user?.Last_name ?? '',
  );

  const [address, setAddress] = useState(
    user?.address ?? '',
  );

  const [phone, setPhone] = useState(
    user?.Phone_no ?? '',
  );

  const [dob, setDob] = useState(
    user?.dob
      ? formatDateForDisplay(new Date(user?.dob))
      : '',
  );

  /*
   * Existing profile image
   *
   * profileImage = image currently being displayed
   * selectedImage = temporary newly selected image
   */

  const [profileImage, setProfileImage] = useState(
    user?.profileimage ?? '',
  );

  const [selectedImage, setSelectedImage] =
    useState<any>(null);

  /*
   * ----------------------------------------------------
   * ORIGINAL PROFILE SNAPSHOT
   * ----------------------------------------------------
   *
   * This remains unchanged while user is editing.
   * We compare current values against this object
   * to determine whether Save Changes should be enabled.
   */

  const originalProfile = useRef({
    firstName: user?.first_name ?? '',
    lastName: user?.Last_name ?? '',
    address: user?.address ?? '',
    phone: user?.Phone_no ?? '',
    dob: user?.dob
      ? formatDateForDisplay(new Date(user.dob))
      : '',
    profileImage: user?.profileimage ?? '',
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loginType, setLoginType] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('LOGIN_TYPE').then(setLoginType);
    }, []),
  );

  // Permanently deletes the account. The server deletes the user's data and
  // revokes Sign in with Apple tokens, so no separate Apple logout call is needed.
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccountApi();
    } catch (error) {
      // deleteAccountApi already shows an error toast; keep the account and the dialog open.
      setIsDeleting(false);
      return;
    }

    if (loginType === 'google') {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
      }
    }

    await AsyncStorage.removeItem('LOGIN_TYPE');
    appStore.clearSession();
    setIsDeleting(false);
    setDeleteModalVisible(false);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
  const resetProfileData = useCallback(() => {
    const currentUser = appStore.user;

    const currentFirstName =
      currentUser?.first_name ?? '';

    const currentLastName =
      currentUser?.Last_name ?? '';

    const currentAddress =
      currentUser?.address ?? '';

    const currentPhone =
      currentUser?.Phone_no ?? '';

    const currentDob =
      currentUser?.dob
        ? formatDateForDisplay(
          new Date(currentUser.dob),
        )
        : '';

    const currentProfileImage =
      currentUser?.profileimage ?? '';

    // Reset editable fields
    setFirstName(currentFirstName);
    setLastName(currentLastName);
    setAddress(currentAddress);
    setPhone(currentPhone);
    setDob(currentDob);

    // Reset image
    setProfileImage(currentProfileImage);

    // Remove any temporary image
    setSelectedImage(null);

    // Reset original snapshot
    originalProfile.current = {
      firstName: currentFirstName,
      lastName: currentLastName,
      address: currentAddress,
      phone: currentPhone,
      dob: currentDob,
      profileImage: currentProfileImage,
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetProfileData();
    }, [resetProfileData]),
  );
  /*
   * ----------------------------------------------------
   * UI STATES
   * ----------------------------------------------------
   */

  const [imagePickerVisible, setImagePickerVisible] =
    useState(false);

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [tempDob, setTempDob] =
    useState<Date | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  /*
   * ----------------------------------------------------
   * CHECK WHETHER PROFILE HAS CHANGES
   * ----------------------------------------------------
   */
  const [guestAlertModalVisible, setGuestAlertModalVisible] = useState(false);

  const hasChanges =
    firstName !== originalProfile.current.firstName ||
    lastName !== originalProfile.current.lastName ||
    address !== originalProfile.current.address ||
    phone !== originalProfile.current.phone ||
    dob !== originalProfile.current.dob ||
    selectedImage !== null;

  /*
   * ----------------------------------------------------
   * CAMERA PERMISSION
   * ----------------------------------------------------
   */

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted =
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message:
              'Charitable needs access to your camera',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          },
        );

      return (
        granted ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {

      return false;
    }
  };

  /*
   * ----------------------------------------------------
   * CAMERA
   * ----------------------------------------------------
   */

  const openCamera = async () => {

    const hasPermission =
      await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.',
      );

      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        saveToPhotos: true,
      });


      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Camera Error',
          result.errorMessage ||
          'Unable to open camera',
        );

        return;
      }

      if (result.assets?.length) {
        const image = result.assets[0];


        /*
         * Display temporary image
         */
        setProfileImage(image.uri || '');

        /*
         * Keep selected image separately
         * for API submission.
         */
        setSelectedImage(image);
      }
    } catch (error) {
    }
  };

  /*
   * ----------------------------------------------------
   * GALLERY
   * ----------------------------------------------------
   */

  const openGallery = async () => {
    try {
      const result =
        await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 1,
          includeBase64: false,
          presentationStyle: 'fullScreen',
        });


      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          'Gallery Error',
          result.errorMessage ||
          'Unable to open gallery',
        );

        return;
      }

      if (result.assets?.length) {
        const image = result.assets[0];


        /*
         * Display temporary image
         */
        setProfileImage(image.uri || '');

        /*
         * Keep selected image separately
         * for API submission.
         */
        setSelectedImage(image);
      }
    } catch (error) {
    }
  };

  /*
   * ----------------------------------------------------
   * REMOVE TEMPORARY PROFILE IMAGE
   * ----------------------------------------------------
   *
   * This does NOT delete the image from the server.
   * It simply cancels the currently selected image
   * and restores the original image.
   */

  const removeSelectedImage = () => {
    setSelectedImage(null);

    setProfileImage(
      originalProfile.current.profileImage,
    );
  };

  /*
   * ----------------------------------------------------
   * DATE
   * ----------------------------------------------------
   */

  const parseDob = (value: string) => {
    if (!value) {
      return new Date();
    }

    /*
     * If existing DOB is DD-MM-YYYY
     */

    if (value.includes('-')) {
      const parts = value.split('-');

      if (parts.length === 3) {
        const day = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const year = Number(parts[2]);

        /*
         * Handle YYYY-MM-DD
         */

        if (parts[0].length === 4) {
          return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2]),
          );
        }

        return new Date(
          year,
          month,
          day,
        );
      }
    }

    return new Date(value);
  };

  const formatDateForApi = (
    value: string,
  ) => {
    if (!value) {
      return '';
    }

    const parts = value.split('-');

    if (parts.length !== 3) {
      return value;
    }

    /*
     * DD-MM-YYYY
     */

    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    /*
     * Already YYYY-MM-DD
     */

    return value;
  };

  /*
   * ----------------------------------------------------
   * SAVE PROFILE
   * ----------------------------------------------------
   */

  const handleSave = async () => {
    /*
     * Do nothing if there are no changes.
     */

    if (!hasChanges || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();

      /*
       * FIRST NAME
       */

      if (
        firstName !==
        originalProfile.current.firstName
      ) {
        formData.append(
          'first_name',
          firstName,
        );
      }

      /*
       * LAST NAME
       */

      if (
        lastName !==
        originalProfile.current.lastName
      ) {
        formData.append(
          'last_name',
          lastName,
        );
      }

      /*
       * ADDRESS
       */

      if (
        address !==
        originalProfile.current.address
      ) {
        formData.append(
          'address',
          address,
        );
      }

      /*
       * PHONE
       */

      if (
        phone !==
        originalProfile.current.phone
      ) {
        formData.append(
          'phoneno',
          phone,
        );
      }

      /*
       * DOB
       */

      if (
        dob !==
        originalProfile.current.dob
      ) {
        formData.append(
          'dob',
          formatDateForApi(dob),
        );
      }

      /*
       * PROFILE IMAGE
       *
       * Only send an image when the user
       * selected a new one.
       */

      if (selectedImage) {
        formData.append(
          'profileIMage',
          {
            uri: selectedImage.uri,
            type:
              selectedImage.type ||
              'image/jpeg',
            name:
              selectedImage.fileName ||
              'profile.jpg',
          } as any,
        );
      }


      /*
       * API
       */

      const response =
        await updateProfile(
          formData,
          user?.userid,
          appStore?.token,
        );


      /*
       * ------------------------------------------------
       * UPDATE LOCAL USER ONLY AFTER SUCCESS
       * ------------------------------------------------
       */

      if (appStore.user) {
        appStore.user.first_name =
          firstName;

        appStore.user.Last_name =
          lastName;

        appStore.user.address =
          address;

        appStore.user.Phone_no =
          phone;

        appStore.user.dob =
          formatDateForApi(dob);

        /*
         * If a new image was uploaded,
         * profileImage currently contains
         * the selected image URI.
         *
         * If your API returns the new server
         * image URL, replace this with that URL.
         */
        if (selectedImage) {
          appStore.user.profileimage =
            profileImage;
        }
      }

      /*
       * ------------------------------------------------
       * UPDATE ORIGINAL SNAPSHOT
       * ------------------------------------------------
       *
       * From this point, current values are considered
       * the saved values.
       */

      originalProfile.current = {
        firstName,
        lastName,
        address,
        phone,
        dob,
        profileImage,
      };

      /*
       * The selected image is no longer temporary.
       */

      setSelectedImage(null);

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully',
      });
    } catch (error: any) {

      Toast.show({
        type: 'error',
        text1: 'Unable to update profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * ----------------------------------------------------
   * DATE PICKER
   * ----------------------------------------------------
   */

  const openDatePicker = () => {
    const currentDate = parseDob(dob);

    setTempDob(currentDate);
    setShowDatePicker(true);
  };

  /*
   * ----------------------------------------------------
   * UI
   * ----------------------------------------------------
   */

  return (
    <ScreenContainer
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: verticalScale(40),
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>


          <Text style={styles.heading}>
            Profile
          </Text>
          {/*{loginType !== 'guest' ? (
            <View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Delete account"
                onPress={() => setDeleteModalVisible(true)}
              >
                <Image
                  source={require('../assets/images/deactivate.png')}
                  style={{ height: verticalScale(24), width: scale(24) }}
                // resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          ) : null}*/}

          <DeleteAccountModal
            visible={deleteModalVisible}
            onCancel={() => setDeleteModalVisible(false)}
            onConfirm={handleDeleteAccount}
            isDeleting={isDeleting}
          /> 
        </View>

        {/* PROFILE IMAGE */}

        <View
          style={styles.profileContainer}
        >
          <View>
            <Image
              source={{
                uri: profileImage,
              }}
              resizeMode="cover"
              style={styles.profileImage}
            />

            {/* ----------------------------------------
                REMOVE TEMPORARY IMAGE BUTTON
                ---------------------------------------- */}

            {selectedImage && (
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={
                  removeSelectedImage
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.removeImageText
                  }
                >
                  ×
                </Text>
              </TouchableOpacity>
            )}

            {/* CAMERA BUTTON */}

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() =>
                setImagePickerVisible(true)
              }
            >
              <Image
                source={require('../assets/images/camera.png')}
                style={{
                  height: verticalScale(18),
                  width: scale(18),
                }}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {firstName} {lastName}
          </Text>
        </View>

        {/* PROFILE FORM */}

        <View style={styles.card}>
          <InputField
            label="First Name"
            icon={require('../assets/images/person.png')}
            value={firstName}
            onChangeText={setFirstName}
          />

          <InputField
            label="Last Name"
            icon={require('../assets/images/person.png')}
            value={lastName}
            onChangeText={setLastName}
          />

          <InputField
            label="Address"
            icon={require('../assets/images/map-pin-blue.png')}
            value={address}
            onChangeText={setAddress}
            multiline={true}
          />

          <InputField
            label="Phone Number"
            icon={require('../assets/images/phone.png')}
            value={phone}
            keyBoardType="numeric"
            maxLength={12}
            onChangeText={setPhone}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openDatePicker}
          >
            <InputField
              label="Date of Birth"
              icon={require('../assets/images/calendar.png')}
              value={dob}
              editable={false}
            />
          </TouchableOpacity>
        </View>

        {/* SAVE BUTTON */}

        <TouchableOpacity
          style={[
            styles.saveBtn,
            !hasChanges &&
            styles.saveBtnDisabled,
          ]}
          onPress={() => {
            if (loginType === 'guest') {
              setGuestAlertModalVisible(true);
            } else {
              handleSave();
            }
          }
          }
          disabled={
            !hasChanges || isSaving
          }
          activeOpacity={0.8}
        >
          <Text style={styles.saveText}>
            {isSaving
              ? 'Saving...'
              : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        {loginType !== 'guest' ? (
          <>
            <TouchableOpacity
              style={styles.deleteAccountBtn}
              onPress={() => setDeleteModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteAccountText}>
                Delete Account
              </Text>
            </TouchableOpacity>
            <Text style={styles.deleteAccountHint}>
              Permanently deletes your account and all associated data.
            </Text>
          </>
        ) : null}
        <LogoutModal
          visible={guestAlertModalVisible}
          onCancel={() => setGuestAlertModalVisible(false)}
          onConfirm={() => {
            setGuestAlertModalVisible(false);
            handleGuestLogout(navigation)
          }}
          description="Please login to save changes to your profile."
          title="Hey Guest!"
          buttonText="Login"
        />

      </ScrollView>

      {/* ------------------------------------------------
          DATE PICKER
      ------------------------------------------------- */}

      {showDatePicker && (
        <>
          {Platform.OS === 'android' ? (
            <DateTimePicker
              value={parseDob(dob)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(
                event,
                selectedDate,
              ) => {
                if (
                  event.type ===
                  'dismissed'
                ) {
                  setShowDatePicker(false);
                  return;
                }

                setShowDatePicker(false);

                if (selectedDate) {
                  const formattedDate =
                    formatDateForDisplay(
                      selectedDate,
                    );

                  setDob(formattedDate);
                }
              }}
            />
          ) : (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => {
                setTempDob(null);
                setShowDatePicker(false);
              }}
            >
              <View
                style={
                  styles.datePickerOverlay
                }
              >
                <View
                  style={
                    styles.datePickerContainer
                  }
                >
                  {/* HEADER */}

                  <View
                    style={
                      styles.datePickerHeader
                    }
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setTempDob(null);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={
                          styles.datePickerCancel
                        }
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <Text
                      style={
                        styles.datePickerTitle
                      }
                    >
                      Date of Birth
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        if (tempDob) {
                          const formattedDate =
                            formatDateForDisplay(
                              tempDob,
                            );

                          setDob(
                            formattedDate,
                          );
                        }

                        setTempDob(null);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={
                          styles.datePickerDone
                        }
                      >
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* PICKER */}

                  <DateTimePicker
                    value={
                      tempDob ||
                      parseDob(dob)
                    }
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={(
                      event,
                      selectedDate,
                    ) => {
                      if (selectedDate) {
                        setTempDob(
                          selectedDate,
                        );
                      }
                    }}
                    textColor="#000000"
                    themeVariant="light"
                  />
                </View>
              </View>
            </Modal>
          )}
        </>
      )}

      {/* ------------------------------------------------
          IMAGE PICKER MODAL
      ------------------------------------------------- */}

      <Modal
        visible={imagePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setImagePickerVisible(false)
        }
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() =>
            setImagePickerVisible(false)
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.bottomSheet}
          >
            <View
              style={
                styles.dragIndicator
              }
            />

            <Text
              style={styles.sheetTitle}
            >
              Update Profile Photo
            </Text>

            {/* CAMERA */}

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setImagePickerVisible(
                  false,
                );

                openCamera();
              }}
            >
              <View
                style={styles.iconCircle}
              >
                <Image
                  source={require('../assets/images/camera.png')}
                  style={{
                    height: verticalScale(24),
                    width: scale(24),
                  }}
                />
              </View>

              <Text
                style={styles.optionText}
              >
                Take Photo
              </Text>
            </TouchableOpacity>

            {/* GALLERY */}

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                setImagePickerVisible(
                  false,
                );

                openGallery();
              }}
            >
              <View
                style={styles.iconCircle}
              >
                <Image
                  source={require('../assets/images/photo.png')}
                  style={{
                    height: verticalScale(24),
                    width: scale(24),
                  }}
                />
              </View>

              <Text
                style={styles.optionText}
              >
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                setImagePickerVisible(false)
              }
            >
              <Text
                style={styles.cancelText}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
}

/*
 * ----------------------------------------------------
 * INPUT FIELD
 * ----------------------------------------------------
 */

const InputField = ({
  label,
  icon,
  value,
  onChangeText,
  editable = true,
  keyBoardType,
  maxLength,
  multiline,
}: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>
      {label}
    </Text>

    <View style={styles.inputWrapper}>
      <Image
        source={icon}
        style={{
          height: verticalScale(18),
          width: scale(18),
        }}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#999"
        editable={editable}
        maxLength={maxLength ?? 500}
        keyboardType={
          keyBoardType ?? 'default'
        }
        multiline={multiline ?? false}
      />
    </View>
  </View>
);

/*
 * ----------------------------------------------------
 * STYLES
 * ----------------------------------------------------
 */

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(32),
  },

  dragIndicator: {
    width: scale(60),
    height: verticalScale(5),
    borderRadius: moderateScale(10),
    backgroundColor: '#D8DDE5',
    alignSelf: 'center',
    marginBottom: verticalScale(20),
  },

  sheetTitle: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#23345D',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
  },

  iconCircle: {
    width: scale(50),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#4594BB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#273142',
    marginLeft: scale(15),
  },

  cancelButton: {
    marginTop: verticalScale(15),
    height: verticalScale(54),
    borderRadius: moderateScale(16),
    backgroundColor: '#F1F4F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    color: '#23345D',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F5F7',
    paddingHorizontal: scale(20),
  },

  heading: {
    marginTop: verticalScale(20),
    fontSize: moderateScale(32),
    color: '#23345D',
    fontFamily: Fonts.PlayfairDisplay.regular,
  },

  profileContainer: {
    alignItems: 'center',
    marginTop: verticalScale(25),
    marginBottom: verticalScale(25),
  },

  profileImage: {
    width: scale(110),
    height: verticalScale(110),
    borderRadius: moderateScale(55),
  },

  cameraBtn: {
    position: 'absolute',
    right: scale(-2),
    bottom: verticalScale(5),
    width: scale(34),
    height: verticalScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#1E719D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },

  removeImageBtn: {
    position: 'absolute',
    top: verticalScale(-4),
    right: scale(-4),
    width: scale(28),
    height: verticalScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },

  removeImageText: {
    color: '#FFF',
    fontSize: moderateScale(20),
    lineHeight: verticalScale(22),
    fontFamily: Fonts.Inter.bold,
  },

  userName: {
    marginTop: verticalScale(15),
    fontSize: moderateScale(20),
    fontFamily: Fonts.Inter.bold,
    color: '#273142',
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(24),
    padding: scale(20),
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: moderateScale(10),
    elevation: 2,
  },

  fieldContainer: {
    marginBottom: verticalScale(18),
  },

  label: {
    fontSize: moderateScale(12),
    fontFamily: Fonts.Inter.semiBold,
    color: '#1E6B8A',
    marginBottom: verticalScale(8),
  },

  inputWrapper: {
    minHeight: verticalScale(48),
    borderWidth: 1,
    borderColor: '#D8DDE5',
    borderRadius: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(15),
  },

  input: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: moderateScale(14),
    fontFamily: Fonts.Inter.medium,
    color: '#1F2937',
  },

  saveBtn: {
    marginTop: verticalScale(24),
    height: verticalScale(56),
    backgroundColor: '#4D97C7',
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
  },

  saveBtnDisabled: {
    backgroundColor: '#C8CDD3',
  },

  saveText: {
    color: '#FFF',
    fontSize: moderateScale(16),
    fontFamily: Fonts.Inter.semiBold,
  },

  deleteAccountBtn: {
    marginTop: verticalScale(12),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    borderWidth: 1,
    borderColor: '#F5C2C0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteAccountText: {
    color: '#E53935',
    fontSize: moderateScale(15),
    fontFamily: Fonts.Inter.semiBold,
  },

  deleteAccountHint: {
    marginTop: verticalScale(6),
    textAlign: 'center',
    color: '#777777',
    fontSize: moderateScale(12),
    fontFamily: Fonts.Inter.regular,
  },

  logoutBtn: {
    marginTop: verticalScale(10),
    height: verticalScale(56),
    backgroundColor: '#0b4f7d',
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },

  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },

  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingBottom: verticalScale(20),
  },

  datePickerHeader: {
    height: verticalScale(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  datePickerTitle: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Inter.semiBold,
    color: '#23345D',
  },

  datePickerCancel: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Inter.medium,
    color: '#666666',
  },

  datePickerDone: {
    fontSize: moderateScale(16),
    fontFamily: Fonts.Inter.semiBold,
    color: '#23345D',
  },
});