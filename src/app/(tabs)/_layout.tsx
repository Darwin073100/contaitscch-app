import { Tabs } from 'expo-router';

import { colors } from '@/shared/theme';
import { Icon, type IconName } from '@/shared/ui';

function tabIcon(name: IconName) {
  return function TabIcon({ focused }: { focused: boolean }) {
    return <Icon name={name} color={focused ? 'primary' : 'muted'} size="lg" />;
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
      <Tabs.Screen
        name="index"
        options={{ title: 'Aprender', tabBarIcon: tabIcon('map-marker-path') }}
      />
      <Tabs.Screen
        name="niveles"
        options={{ title: 'Niveles', tabBarIcon: tabIcon('layers-outline') }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: 'Ranking', tabBarIcon: tabIcon('chart-bar') }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ title: 'Ajustes', tabBarIcon: tabIcon('cog-outline') }}
      />
    </Tabs>
  );
}
