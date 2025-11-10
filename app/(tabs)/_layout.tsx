import { Icon } from '@/components/ui/icon';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useColor } from '@/hooks/useColor';
import { PlatformPressable } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { Home, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const primary = useColor('primary');

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: primary,
          headerShown: false,
          tabBarButton: (props) => (
            <PlatformPressable
              {...props}
              onPressIn={(ev) => {
                if (process.env.EXPO_OS === 'ios') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                props.onPressIn?.(ev);
              }}
            />
          ),
          tabBarBackground: () => {
            if (Platform.OS === 'ios') {
              return (
                <BlurView
                  tint='systemChromeMaterial'
                  intensity={100}
                  style={StyleSheet.absoluteFill}
                />
              );
            }
            return null;
          },
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Icon name={Home} size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name='explore'
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => (
              <Icon name={MessageCircle} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
      
      <View style={styles.floatingToggle}>
        <ModeToggle />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  floatingToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
});
