import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import { useAuth } from '../context/AuthContext';
import GradientButton from '../components/GradientButton';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const { loginWithPassword } = useAuth();

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
    <LinearGradient
      colors={['#FAFAFA', '#FFFFFF', '#F5F5F5']}
      style={styles.container}
    >
      {/* Soft decorative circles */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>💎</Text>
            <Text style={styles.title}>Riddhi Siddhi</Text>
            <Text style={styles.subtitle}>Trading Co.</Text>
            <View style={styles.taglineContainer}>
              <Text style={styles.tagline}>Your Trusted Gold Partner</Text>
            </View>
          </View>

          {/* Login Form in Glass Card */}
          <GlassCard intensity={90} style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            
            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
              maxLength={10}
              disabled={loading}
              left={<TextInput.Icon icon="phone" color={theme.colors.primary.main} />}
              placeholder="9876543210"
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              theme={{
                colors: {
                  background: '#FFFFFF',
                  text: theme.colors.text.primary,
                  placeholder: theme.colors.text.disabled,
                },
              }}
              textColor={theme.colors.text.primary}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              disabled={loading}
              left={<TextInput.Icon icon="lock" color={theme.colors.primary.main} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  color={theme.colors.primary.main}
                />
              }
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              theme={{
                colors: {
                  background: '#FFFFFF',
                  text: theme.colors.text.primary,
                  placeholder: theme.colors.text.disabled,
                },
              }}
              textColor={theme.colors.text.primary}
            />

            <GradientButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              colors={theme.colors.gradients.primary}
              style={styles.loginButton}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Register
              </Text>
            </View>
          </GlassCard>



          {/* Check for Updates */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleCheckUpdate}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color={theme.colors.primary.main} />
            ) : (
              <Text style={styles.updateText}>🔄 Check for Updates</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary.light,
    opacity: 0.3,
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.secondary.light,
    opacity: 0.3,
    bottom: -50,
    left: -50,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary.dark,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  taglineContainer: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.dark,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  registerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
  },
  registerLink: {
    color: theme.colors.primary.dark,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },

  updateButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  updateText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
