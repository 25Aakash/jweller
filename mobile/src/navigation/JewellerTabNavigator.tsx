import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/jeweller/DashboardScreen';
import CustomersScreen from '../screens/jeweller/CustomersScreen';
import AllTransactionsScreen from '../screens/jeweller/AllTransactionsScreen';
import AllBookingsScreen from '../screens/jeweller/AllBookingsScreen';
import JewellerSettingsScreen from '../screens/jeweller/JewellerSettingsScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function JewellerTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.disabled,
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#E0E0E0',
          borderTopWidth: 0.5,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1E1E1E' : theme.colors.primary.dark,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDark ? theme.colors.text.primary : '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={AllTransactionsScreen}
        options={{
          tabBarLabel: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={AllBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gold" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={JewellerSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
