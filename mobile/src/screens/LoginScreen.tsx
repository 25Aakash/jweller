import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const { loginWithPassword } = useAuth();

  const darkCardBorder = isDark ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' } : {};

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      if (__DEV__) {
        Alert.alert('Dev Mode', 'Updates are not available in development mode.');
        return;
      }
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert('Update Available', 'Downloading update...', [{ text: 'OK' }]);
        await Updates.fetchUpdateAsync();
        Alert.alert('Update Ready', 'Restarting app to apply update.', [
          { text: 'Restart', onPress: () => Updates.reloadAsync() },
        ]);
      } else {
        Alert.alert('Up to Date', 'You are on the latest version.');
      }
    } catch (e: any) {
      Alert.alert('Update Error', e.message || 'Could not check for updates.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(phoneNumber, password);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <MaterialCommunityIcons name="diamond-stone" size={64} color={theme.colors.primary.main} />
            <Text variant="headlineLarge" style={{ color: theme.colors.text.primary, fontWeight: '700', marginTop: 8 }}>
              Riddhi Siddhi
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary.main, fontWeight: '600' }}>
              Trading Co.
            </Text>
            <View style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.colors.primary.light,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              marginTop: 12,
            }}>
              <Text variant="labelMedium" style={{ color: theme.colors.primary.main }}>
                Your Trusted Gold Partner
              </Text>
            </View>
          </View>

          {/* Login Card */}
          <Card style={[{
            backgroundColor: theme.colors.background.card,
            borderRadius: 16,
            marginBottom: 16,
          }, darkCardBorder]}>
            <Card.Content style={{ paddingVertical: 24 }}>
              <Text variant="titleLarge" style={{
                color: theme.colors.text.primary,
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: 20,
              }}>
                Welcome Back
              </Text>

              <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                mode="outlined"
                maxLength={10}
                disabled={loading}
                placeholder="9876543210"
                left={<TextInput.Icon icon="phone" color={theme.colors.primary.main} />}
                outlineColor={isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel}
                activeOutlineColor={theme.colors.primary.main}
                textColor={theme.colors.text.primary}
                style={{ marginBottom: 14, backgroundColor: theme.colors.background.card }}
                theme={{
                  colors: {
                    onSurfaceVariant: theme.colors.text.secondary,
                  },
                }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                disabled={loading}
                left={<TextInput.Icon icon="lock" color={theme.colors.primary.main} />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    color={theme.colors.text.secondary}
                  />
                }
                outlineColor={isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel}
                activeOutlineColor={theme.colors.primary.main}
                textColor={theme.colors.text.primary}
                style={{ marginBottom: 20, backgroundColor: theme.colors.background.card }}
                theme={{
                  colors: {
                    onSurfaceVariant: theme.colors.text.secondary,
                  },
                }}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                buttonColor={theme.colors.primary.main}
                textColor="#FFFFFF"
                contentStyle={{ paddingVertical: 6 }}
                style={{ borderRadius: 12, marginBottom: 16 }}
              >
                Login
              </Button>

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
                  Don't have an account?
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.primary.main, fontWeight: '700' }}
                  onPress={() => navigation.navigate('Register')}
                >
                  Register
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Check for Updates */}
          <Button
            mode="text"
            onPress={handleCheckUpdate}
            disabled={checking}
            textColor={theme.colors.text.secondary}
            icon={checking ? undefined : 'refresh'}
            style={{ marginTop: 8 }}
          >
            {checking ? 'Checking...' : 'Check for Updates'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
