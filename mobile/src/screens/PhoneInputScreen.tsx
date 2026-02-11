import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { theme } from '../theme/theme';

interface Props {
  navigation: any;
  route: any;
}

export default function PhoneInputScreen({ navigation, route }: Props) {
  const { name: registeredName, phoneNumber: registeredPhone } = route.params || {};
  const [phoneNumber, setPhoneNumber] = useState(registeredPhone || '');
  const [loading, setLoading] = useState(false);
  const { sendOTP } = useAuth();

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phoneNumber);
      Alert.alert('Success', 'OTP sent! Check your backend console for the OTP code.');
      navigation.navigate('OTPVerification', { 
        phoneNumber,
        name: registeredName 
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#F5F5F5']} style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>💎</Text>
            <Text style={styles.title}>Riddhi Siddhi</Text>
            <Text style={styles.subtitle}>Trading Co.</Text>
          </View>

          <GlassCard intensity={90} style={styles.formCard}>
            <Text style={styles.formTitle}>Enter Phone Number</Text>
            
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
              outlineColor={theme.colors.primary.pastel}
              activeOutlineColor={theme.colors.primary.main}
              theme={{
                colors: {
                  background: '#FFFFFF',
                  text: theme.colors.text.primary,
                },
              }}
            />

            <GradientButton
              title="Send OTP"
              onPress={handleSendOTP}
              loading={loading}
              colors={theme.colors.gradients.primary}
              style={styles.button}
            />
          </GlassCard>
        </View>
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
  button: {
    marginTop: theme.spacing.md,
  },
});
