import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import DisclaimerScreen from '../screens/DisclaimerScreen';
import SessionLocationScreen from '../screens/SessionLocationScreen';
import LicenseActivationScreen from '../screens/LicenseActivationScreen';
import AboutScreen from '../screens/AboutScreen';
import HomeScreen from '../screens/HomeScreen';
import CodeBlueScreen from '../screens/CodeBlueScreen';
import SummaryScreen from '../screens/SummaryScreen';
import AuditDashboard from '../screens/AuditDashboard';
import ReversibleCausesScreen from '../screens/ReversibleCausesScreen';
import { storage } from '../services/storage';

// Define navigation types (for safety)
type RootStackParamList = {
  Bootstrap: undefined;
  Login: undefined;
  SessionLocation: undefined;
  LicenseActivation: undefined;
  Disclaimer: undefined;
  Home: undefined;
  CodeBlue: undefined;
  Summary: undefined;
  AuditDashboard: undefined;
  ReversibleCauses: undefined;
  About: undefined;
};

// Create navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// Simple app theme
const AppTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0ea5e9', // blue
    background: '#ffffff',
    text: '#111827',
    border: '#e5e7eb',
    card: '#ffffff',
    notification: '#0ea5e9',
  },
};

// Boot screen – decides where to go
function Bootstrap({ navigation }: any) {
  React.useEffect(() => {
    (async () => {
      const profile = await storage.get('userProfile');
      // Always ask session location when profile exists
      if (!profile?.name || !profile?.email) {
        navigation.replace('Login');
      } else {
        navigation.replace('SessionLocation');
      }
    })();
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#0ea5e9" />
    </View>
  );
}

// Main navigator
export default function RootNavigator() {
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator initialRouteName="Bootstrap" screenOptions={{ headerTitleStyle: { fontWeight: '600' } }}>
        <Stack.Screen name="Bootstrap" component={Bootstrap} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Staff Login' }} />
  <Stack.Screen name="SessionLocation" component={SessionLocationScreen} options={{ title: 'Session Location' }} />
        <Stack.Screen name="LicenseActivation" component={LicenseActivationScreen} options={{ title: 'Activate License' }} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} options={{ title: 'Disclaimer' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MEDRESUS' }} />
        <Stack.Screen name="CodeBlue" component={CodeBlueScreen} options={{ title: 'Code Blue' }} />
        <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Summary' }} />
        <Stack.Screen name="AuditDashboard" component={AuditDashboard} options={{ title: 'Audit Dashboard' }} />
        <Stack.Screen name="ReversibleCauses" component={ReversibleCausesScreen} options={{ title: '4H & 4T' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About & Legal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
