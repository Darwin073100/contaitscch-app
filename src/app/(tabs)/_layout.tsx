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
        options={{ title: 'Niveles', tabBarIcon: tabIcon('layers-outline') }}
      />
      <Tabs.Screen
        name="aprender"
        options={{ title: 'Aprender', tabBarIcon: tabIcon('map-marker-path') }}
      />
      <Tabs.Screen
        name="glosario"
        options={{ title: 'Glosario', tabBarIcon: tabIcon('book-open-page-variant-outline') }}
      />
      <Tabs.Screen name="ranking" options={{ title: 'Ranking', tabBarIcon: tabIcon('podium') }} />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: tabIcon('account-outline') }}
      />
    </Tabs>
  );
}
