import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text, TextInput as RNTextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../api/endpoints';
import GradientButton from '../components/GradientButton';
import GlassCard from '../components/GlassCard';
import SuccessAnimation from '../components/SuccessAnimation';
import BiometricSetupPopup from '../components/BiometricSetupPopup';
import { useTheme } from '../context/ThemeContext';

interface Props {
  route: any;
  navigation: any;
}

export default function OTPVerificationScreen({ route, navigation }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const { phoneNumber, name, password, state, city } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    sendOTP();
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendOTP = async () => {
    try {
      await authAPI.sendOTP(phoneNumber);
      setResendTimer(60);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (index === 5 && value) {
      const otpCode = newOtp.join('');
      if (otpCode.length === 6) {
        handleVerify(otpCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      await authAPI.registerWithOTP(phoneNumber, code, name, password, state, city);
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid OTP');
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    // Show biometric setup popup after success animation
    setShowBiometricSetup(true);
  };

  const handleBiometricSetupComplete = () => {
    setShowBiometricSetup(false);
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#F5F5F5']} style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <SuccessAnimation visible={showSuccess} onComplete={handleSuccessComplete} />
      
      <BiometricSetupPopup
        visible={showBiometricSetup}
        phoneNumber={phoneNumber}
        password={password}
        onComplete={handleBiometricSetupComplete}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phone}>{phoneNumber}</Text>
          </Text>
        </View>

        <GlassCard intensity={90} style={styles.formCard}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <RNTextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                editable={!loading}
              />
            ))}
          </View>

          <GradientButton
            title="Verify & Register"
            onPress={() => handleVerify()}
            loading={loading}
            colors={theme.colors.gradients.primary}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>
                Resend OTP in {resendTimer}s
              </Text>
            ) : (
              <Text style={styles.resendLink} onPress={sendOTP}>
                Resend OTP
              </Text>
            )}
          </View>
        </GlassCard>

        <Text style={styles.backLink} onPress={() => navigation.goBack()}>
          ← Back to Registration
        </Text>
      </View>
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
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phone: {
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  otpInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: theme.colors.primary.pastel,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    backgroundColor: '#FFFFFF',
  },
  otpInputFilled: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  verifyButton: {
    marginTop: theme.spacing.md,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  resendTimer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.disabled,
  },
  resendLink: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeight.bold,
  },
  backLink: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
