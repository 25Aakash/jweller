import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, Text, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';
import GlassCard from '../components/GlassCard';
import { theme } from '../theme/theme';

interface Props {
  navigation: any;
}

export default function RegisterScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
      if (!name) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!password || password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (!state || !city) {
        Alert.alert('Error', 'Please enter your location');
        return;
      }
      handleRegister();
    }
  };

  const handleRegister = () => {
    // Navigate to OTP with registration data
    // Note: jewellerId is now hardcoded or set by backend for single jeweller app
    navigation.navigate('OTPVerification', {
      phoneNumber,
      name,
      password,
      state,
      city,
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s === step && styles.stepDotActive,
            s < step && styles.stepDotCompleted,
          ]}
        >
          <Text style={[styles.stepText, (s === step || s < step) && styles.stepTextActive]}>
            {s}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#F5F5F5']} style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.emoji}>✨</Text>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Riddhi Siddhi Trading Co.</Text>
            </View>

            {renderStepIndicator()}

            <GlassCard intensity={90} style={styles.formCard}>
              {step === 1 && (
                <>
                  <Text style={styles.stepTitle}>📱 Personal Information</Text>
                  <TextInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    mode="outlined"
                    style={styles.input}
                    maxLength={10}
                    left={<TextInput.Icon icon="phone" color={theme.colors.primary.main} />}
                    outlineColor={theme.colors.primary.pastel}
                    activeOutlineColor={theme.colors.primary.main}
                    theme={{
                      colors: {
                        background: '#FFFFFF',
                        text: theme.colors.text.primary,
                      },
                    }}
                  />
                  <TextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" color={theme.colors.primary.main} />}
                    outlineColor={theme.colors.primary.pastel}
                    activeOutlineColor={theme.colors.primary.main}
                    theme={{
                      colors: {
                        background: '#FFFFFF',
                        text: theme.colors.text.primary,
                      },
                    }}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={styles.stepTitle}>🔐 Security & Location</Text>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={styles.input}
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
                      },
                    }}
                  />
                  <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-check" color={theme.colors.primary.main} />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        color={theme.colors.primary.main}
                      />
                    }
                    outlineColor={theme.colors.primary.pastel}
                    activeOutlineColor={theme.colors.primary.main}
                    theme={{
                      colors: {
                        background: '#FFFFFF',
                        text: theme.colors.text.primary,
                      },
                    }}
                  />
                  <TextInput
                    label="State"
                    value={state}
                    onChangeText={setState}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="map-marker" color={theme.colors.primary.main} />}
                    outlineColor={theme.colors.primary.pastel}
                    activeOutlineColor={theme.colors.primary.main}
                    theme={{
                      colors: {
                        background: '#FFFFFF',
                        text: theme.colors.text.primary,
                      },
                    }}
                  />
                  <TextInput
                    label="City"
                    value={city}
                    onChangeText={setCity}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="city" color={theme.colors.primary.main} />}
                    outlineColor={theme.colors.primary.pastel}
                    activeOutlineColor={theme.colors.primary.main}
                    theme={{
                      colors: {
                        background: '#FFFFFF',
                        text: theme.colors.text.primary,
                      },
                    }}
                  />
                </>
              )}

              <View style={styles.buttonContainer}>
                {step > 1 && (
                  <GradientButton
                    title="Back"
                    onPress={() => setStep(step - 1)}
                    colors={theme.colors.gradients.sunset}
                    style={styles.backButton}
                  />
                )}
                <GradientButton
                  title={step === 2 ? 'Register' : 'Next'}
                  onPress={handleNext}
                  loading={loading}
                  colors={theme.colors.gradients.primary}
                  style={styles.nextButton}
                />
              </View>
            </GlassCard>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                Login
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    borderWidth: 2,
    borderColor: theme.colors.primary.pastel,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  stepDotCompleted: {
    backgroundColor: theme.colors.secondary.main,
    borderColor: theme.colors.secondary.main,
  },
  stepText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.disabled,
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  loginText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
  },
  loginLink: {
    color: theme.colors.primary.dark,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
