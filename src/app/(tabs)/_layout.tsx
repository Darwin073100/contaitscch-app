import { Tabs } from 'expo-router';

import { useThemeColors } from '@/shared/theme';
import { Icon, type IconName } from '@/shared/ui';

function tabIcon(name: IconName) {
  return function TabIcon({ focused }: { focused: boolean }) {
    return <Icon name={name} color={focused ? 'accent' : 'dim'} size="lg" />;
  };
}

export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.dim,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: 'PlusJakartaSans_700Bold' },
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
