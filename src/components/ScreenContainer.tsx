import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

export default function ScreenContainer({
  children,
  style,
}: any) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#EBF3FF', '#FFF0F6', '#FFFDF0']}
      locations={[0, 0.5, 1]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={{flex: 1, ...style}}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          // paddingBottom:insets.bottom
          // paddingHorizontal: 20,
        }}>
        {children}
      </View>
    </LinearGradient>
  );
}