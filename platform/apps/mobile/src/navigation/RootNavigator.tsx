import { useEffect, useState, useCallback } from "react";
import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import PatientDirectoryScreen from "../screens/PatientDirectoryScreen";
import SyncQueueScreen from "../screens/SyncQueueScreen";
import ProfileScreen from "../screens/ProfileScreen";
import CaptureScreen from "../screens/CaptureScreen";
import ScreeningResultScreen from "../screens/ScreeningResultScreen";
import RegisterPatientScreen from "../screens/RegisterPatientScreen";
import LoginScreen from "../screens/LoginScreen";
import { colors } from "../theme/tokens";
import { getStoredToken } from "../api/client";
import { AuthContext } from "./AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Icon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? colors.primary : colors.steel }}>{symbol}</Text>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.steel,
        tabBarStyle: { backgroundColor: colors.surfaceContainerLowest, borderTopColor: colors.sand },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <Icon symbol="⌂" focused={focused} /> }}
      />
      <Tab.Screen
        name="Patients"
        component={PatientDirectoryScreen}
        options={{ tabBarIcon: ({ focused }) => <Icon symbol="👥" focused={focused} /> }}
      />
      <Tab.Screen
        name="CaptureTab"
        component={CaptureScreen}
        options={{ title: "Capture", tabBarIcon: ({ focused }) => <Icon symbol="📷" focused={focused} /> }}
      />
      <Tab.Screen
        name="Sync"
        component={SyncQueueScreen}
        options={{ tabBarIcon: ({ focused }) => <Icon symbol="⟳" focused={focused} /> }}
      />
      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <Icon symbol="●" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

/** Root stack: tabs + full-screen flows (capture -> result, register patient). */
export default function RootNavigator() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = still checking

  const checkAuth = useCallback(async () => {
    const token = await getStoredToken();
    setAuthed(!!token);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authed === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!authed) {
    return <LoginScreen onAuthenticated={() => setAuthed(true)} />;
  }

  return (
    <AuthContext.Provider value={{ signOut: () => setAuthed(false) }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Capture" component={CaptureScreen} />
          <Stack.Screen name="ScreeningResult" component={ScreeningResultScreen} />
          <Stack.Screen
            name="RegisterPatient"
            component={RegisterPatientScreen}
            options={{ headerShown: true, title: "Register Patient" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
});
