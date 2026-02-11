import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import {
  checkBiometricSupport,
  setBiometricEnabled,
  storeCredentials,
} from '../utils/biometric';
import { theme } from '../theme/theme';

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
          <Text style={styles.title}>Enable Quick Login?</Text>
          <Text style={styles.message}>
            Use {biometricType === 'face' ? 'Face ID' : 'Fingerprint'} to login quickly and
            securely without entering your password every time.
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>Faster login</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>🔐</Text>
              <Text style={styles.benefitText}>More secure</Text>
            </View>
            <View style={styles.benefit}>
              <Text style={styles.benefitIcon}>✨</Text>
              <Text style={styles.benefitText}>Convenient</Text>
            </View>
          </View>

          <GradientButton
            title={`Enable ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'}`}
            onPress={handleEnable}
            colors={theme.colors.gradients.primary}
            style={styles.enableButton}
          />

          <Text style={styles.skipButton} onPress={handleSkip}>
            Maybe Later
          </Text>

          <Text style={styles.disclaimer}>
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
    padding: theme.spacing.lg,
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  benefits: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  benefit: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.primary.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  benefitText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  enableButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  skipButton: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.lg,
  },
  disclaimer: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.disabled,
    textAlign: 'center',
  },
});
