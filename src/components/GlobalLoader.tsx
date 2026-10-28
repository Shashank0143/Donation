import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import appStore from '../store/appStore';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

const GlobalLoader = observer(() => {
  if (!appStore.isLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <ActivityIndicator
          size="large"
          color="#4D97C7"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },

  loaderBox: {
    width: scale(70),
    height: verticalScale(70),
    borderRadius: moderateScale(16),
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GlobalLoader;