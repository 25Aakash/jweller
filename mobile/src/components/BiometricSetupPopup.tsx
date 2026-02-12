import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import {
  checkBiometricSupport,
  setBiometricEnabled,
  storeCredentials,
} from '../utils/biometric';
import { useTheme } from '../context/ThemeContext';

interface BiometricSetupPopupProps {
  visible: boolean;
  phoneNumber: string;
  password: string;
  onComplete: () => void;
}

export default function BiometricSetupPopup({
  visible,
  phoneNumber,
  password,
  onComplete,
}: BiometricSetupPopupProps) {
  const { theme, isDark } = useTheme();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    if (visible) {
      checkBiometric();
    }
  }, [visible]);

  const checkBiometric = async () => {
    const { available, type } = await checkBiometricSupport();
    setBiometricAvailable(available);
    setBiometricType(type);
  };

  const handleEnable = async () => {
    await setBiometricEnabled(true);
    await storeCredentials(phoneNumber, password);
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!biometricAvailable) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <GlassCard intensity={95} style={styles.popup}>
          <Text style={styles.icon}>
            {biometricType === 'face' ? '👤' : '👆'}
          </Text>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Enable Quick Login?</Text>
          <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
            Use {biometricType === 'face' ? 'Face ID' : 'Fingerprint'} to login quickly and
            securely without entering your password every time.
          </Text>

          <View style={styles.benefits}>
            <View style={[styles.benefit, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text.primary }]}>Faster login</Text>
            </View>
            <View style={[styles.benefit, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.benefitIcon}>🔐</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text.primary }]}>More secure</Text>
            </View>
            <View style={[styles.benefit, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.benefitIcon}>✨</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text.primary }]}>Convenient</Text>
            </View>
          </View>

          <GradientButton
            title={`Enable ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'}`}
            onPress={handleEnable}
            colors={theme.colors.gradients.primary}
            style={styles.enableButton}
          />

          <Text style={[styles.skipButton, { color: theme.colors.text.secondary }]} onPress={handleSkip}>
            Maybe Later
          </Text>

          <Text style={[styles.disclaimer, { color: theme.colors.text.disabled }]}>
            You can enable or disable this anytime in Settings
          </Text>
        </GlassCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  benefits: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  benefit: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  enableButton: {
    width: '100%',
    marginBottom: 12,
  },
  skipButton: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
  },
});
