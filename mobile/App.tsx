import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import * as Updates from 'expo-updates';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import PhoneInputScreen from './src/screens/PhoneInputScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
// JewellerLoginScreen removed — unified login via LoginScreen
import TabNavigator from './src/navigation/TabNavigator';
import JewellerTabNavigator from './src/navigation/JewellerTabNavigator';
import AddMoneyScreen from './src/screens/wallet/AddMoneyScreen';
import TransactionsScreen from './src/screens/wallet/TransactionsScreen';
import BookGoldScreen from './src/screens/gold/BookGoldScreen';
import GoldBookingScreen from './src/screens/gold/GoldBookingScreen';
import BookingsScreen from './src/screens/gold/BookingsScreen';
import SilverBookingScreen from './src/screens/silver/SilverBookingScreen';
import SilverBookingsScreen from './src/screens/silver/SilverBookingsScreen';
import GoldPriceScreen from './src/screens/jeweller/GoldPriceScreen';
import SilverPriceScreen from './src/screens/jeweller/SilverPriceScreen';
import CustomerDetailsScreen from './src/screens/jeweller/CustomerDetailsScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme, isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  const isJeweller = user?.role === 'ADMIN';

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? theme.colors.background.secondary : theme.colors.primary.dark,
          },
          headerTintColor: isDark ? theme.colors.text.primary : '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Main"
              component={isJeweller ? JewellerTabNavigator : TabNavigator}
              options={{ headerShown: false }}
            />
            {!isJeweller && (
              <>
                <Stack.Screen
                  name="AddMoney"
                  component={AddMoneyScreen}
                  options={{ title: 'Add Money' }}
                />
                <Stack.Screen
                  name="Transactions"
                  component={TransactionsScreen}
                  options={{ title: 'All Transactions' }}
                />
                <Stack.Screen
                  name="BookGold"
                  component={BookGoldScreen}
                  options={{ title: 'Book Gold' }}
                />
                <Stack.Screen
                  name="GoldBooking"
                  component={GoldBookingScreen}
                  options={{ title: 'Book Gold' }}
                />
                <Stack.Screen
                  name="Bookings"
                  component={BookingsScreen}
                  options={{ title: 'My Bookings' }}
                />
                <Stack.Screen
                  name="SilverBooking"
                  component={SilverBookingScreen}
                  options={{ title: 'Book Silver' }}
                />
                <Stack.Screen
                  name="SilverBookings"
                  component={SilverBookingsScreen}
                  options={{ title: 'My Silver Bookings' }}
                />
              </>
            )}
            {isJeweller && (
              <>
                <Stack.Screen
                  name="GoldPrice"
                  component={GoldPriceScreen}
                  options={{ title: 'Update Gold Price' }}
                />
                <Stack.Screen
                  name="SilverPrice"
                  component={SilverPriceScreen}
                  options={{ title: 'Update Silver Price' }}
                />
                <Stack.Screen
                  name="CustomerDetails"
                  component={CustomerDetailsScreen}
                  options={{ title: 'Customer Details' }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Login' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Register' }}
            />

            <Stack.Screen
              name="PhoneInput"
              component={PhoneInputScreen}
              options={{ title: 'Phone Input' }}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
              options={{ title: 'Verify OTP' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        console.log('Error checking for updates:', e);
      }
    }
    checkForUpdates();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
