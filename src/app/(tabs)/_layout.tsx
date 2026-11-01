import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { colors } from '@/shared/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return function TabIcon({ focused, size }: { focused: boolean; size: number }) {
    return <Ionicons name={name} color={focused ? colors.primary : colors.muted} size={size} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.card },
        tabBarLabelStyle: { fontFamily: 'PlusJakartaSans_600SemiBold' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Aprender', tabBarIcon: tabIcon('school') }} />
      <Tabs.Screen name="niveles" options={{ title: 'Niveles', tabBarIcon: tabIcon('layers') }} />
      <Tabs.Screen name="ranking" options={{ title: 'Ranking', tabBarIcon: tabIcon('trophy') }} />
      <Tabs.Screen name="ajustes" options={{ title: 'Ajustes', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
