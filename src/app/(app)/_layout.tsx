
import { Tabs, usePathname } from 'expo-router';
import {
  ClipboardTextIcon,
  CurrencyDollarIcon,
  PlantIcon,
  UsersIcon,
} from 'phosphor-react-native';

export default function AppLayout() {
  const pathname = usePathname();

  const esCultivoEspecifico =
    pathname.includes('/cultivos/') ||
    pathname.includes('/actividades/cultivo/') ||
    pathname.includes('/mano-obra/cultivo/') ||
    pathname.includes('/mano-obra/trabajador/') ||
    pathname.includes('/finanzas/cultivo/');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: '#2A2A28',
        tabBarActiveTintColor: '#1A501A',
      }}
    >
      <Tabs.Screen
        name="cultivos"
        options={{
          title: 'Cultivos',
          tabBarIcon: ({ color, size }) => (
            <PlantIcon color={(color) as string} 
            size={size} weight="regular" />
          ),
          tabBarActiveTintColor: '#1A501A',
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            if (esCultivoEspecifico) {
              navigation.navigate('cultivos', { screen: 'index' });
            }
          },
        })}
      />

      <Tabs.Screen
        name="actividades"
        options={{
          title: 'Actividades',
          tabBarIcon: ({ color, size }) => (
            <ClipboardTextIcon
              color={(color) as string}
              size={size}
              weight="regular"
            />
          ),
          tabBarActiveTintColor: esCultivoEspecifico
            ? '#2A2A28'
            : '#1A501A',
        }}
      />

      <Tabs.Screen
        name="mano-obra"
        options={{
          title: 'Mano de Obra',
          tabBarIcon: ({ color, size }) => (
            <UsersIcon color={(color) as string}
             size={size} weight="regular" />
          ),
          tabBarActiveTintColor: esCultivoEspecifico
            ? '#2A2A28'
            : '#1A501A',
        }}
      />

      <Tabs.Screen
        name="finanzas"
        options={{
          title: 'Finanzas',
          tabBarIcon: ({ color, size }) => (
            <CurrencyDollarIcon
              color={(color) as string}
              size={size}
              weight="regular"
            />
          ),
          tabBarActiveTintColor: esCultivoEspecifico
            ? '#2A2A28'
            : '#1A501A',
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('finanzas', { screen: 'index' });
          },
        })}
      />
    </Tabs>
  );
}
