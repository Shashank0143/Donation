import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { scale , verticalScale , moderateScale } from '../utils/responsive';
const DeleteAccountModal = ({ visible, onCancel, onConfirm, isDeleting = false }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>

      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/deactivate.png')}
              style={{ height: verticalScale(24), width: scale(24) }}
            // resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Delete Account?</Text>

          {/* Description */}
          <Text style={styles.description}>
            This permanently deletes your account and all associated data: your
            name, email address, profile photo, phone number, address, date of
            birth, and saved charities. If you signed in with Apple, we also
            revoke this app's access to your Apple ID. This cannot be undone.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              disabled={isDeleting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={onConfirm}
              disabled={isDeleting}>
              <Text style={styles.logoutText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccountModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(25),
  },

  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: scale(25),
    alignItems: 'center',
  },

  iconContainer: {
    width: scale(64),
    height: verticalScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },

  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#222222',
    marginBottom: verticalScale(8),
  },

  description: {
    fontSize: moderateScale(15),
    color: '#777777',
    textAlign: 'center',
    lineHeight: verticalScale(22),
    marginBottom: verticalScale(25),
  },

  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(12),
  },

  cancelButton: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#555555',
  },

  logoutButton: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: moderateScale(12),
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});