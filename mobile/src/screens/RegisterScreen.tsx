import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  navigation: any;
}

export default function RegisterScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
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

  const darkCardBorder = isDark ? { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' } : {};

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
    navigation.navigate('OTPVerification', {
      phoneNumber,
      name,
      password,
      state,
      city,
    });
  };

  const inputStyle = { marginBottom: 14, backgroundColor: theme.colors.background.card };
  const outlineColor = isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel;
  const inputTheme = { colors: { onSurfaceVariant: theme.colors.text.secondary } };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <MaterialCommunityIcons name="account-plus" size={64} color={theme.colors.primary.main} />
            <Text variant="headlineLarge" style={{ color: theme.colors.text.primary, fontWeight: '700', marginTop: 8 }}>
              Create Account
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.text.secondary, marginTop: 4 }}>
              Join Riddhi Siddhi Trading Co.
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 24 }}>
            {[1, 2].map((s) => (
              <View
                key={s}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: s === step || s < step ? theme.colors.primary.main : theme.colors.background.card,
                  borderWidth: s === step || s < step ? 0 : 2,
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text variant="labelLarge" style={{ color: s === step || s < step ? '#FFF' : theme.colors.text.disabled, fontWeight: '700' }}>
                  {s}
                </Text>
              </View>
            ))}
          </View>

          {/* Form Card */}
          <Card style={[{
            backgroundColor: theme.colors.background.card,
            borderRadius: 16,
            marginBottom: 16,
          }, darkCardBorder]}>
            <Card.Content style={{ paddingVertical: 24 }}>
              {step === 1 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                    <MaterialCommunityIcons name="cellphone" size={22} color={theme.colors.primary.main} />
                    <Text variant="titleMedium" style={{ color: theme.colors.text.primary, fontWeight: '700' }}>
                      Personal Information
                    </Text>
                  </View>

                  <TextInput
                    label="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    mode="outlined"
                    maxLength={10}
                    left={<TextInput.Icon icon="phone" color={theme.colors.primary.main} />}
                    outlineColor={outlineColor}
                    activeOutlineColor={theme.colors.primary.main}
                    textColor={theme.colors.text.primary}
                    style={inputStyle}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    left={<TextInput.Icon icon="account" color={theme.colors.primary.main} />}
                    outlineColor={outlineColor}
                    activeOutlineColor={theme.colors.primary.main}
                    textColor={theme.colors.text.primary}
                    style={inputStyle}
                    theme={inputTheme}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                    <MaterialCommunityIcons name="shield-lock" size={22} color={theme.colors.primary.main} />
                    <Text variant="titleMedium" style={{ color: theme.colors.text.primary, fontWeight: '700' }}>
                      Security & Location
                    </Text>
                  </View>

                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock" color={theme.colors.primary.main} />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                        color={theme.colors.text.secondary}
                      />
                    }
                    outlineColor={outlineColor}
                    activeOutlineColor={theme.colors.primary.main}
                    textColor={theme.colors.text.primary}
                    style={inputStyle}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    left={<TextInput.Icon icon="lock-check" color={theme.colors.primary.main} />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        color={theme.colors.text.secondary}
                      />
                    }
                    outlineColor={outlineColor}
                    activeOutlineColor={theme.colors.primary.main}
                    textColor={theme.colors.text.primary}
                    style={inputStyle}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="State"
                    value={state}
                    onChangeText={setState}
                    mode="outlined"
                    left={<TextInput.Icon icon="map-marker" color={theme.colors.primary.main} />}
                    outlineColor={outlineColor}
                    activeOutlineColor={theme.colors.primary.main}
                    textColor={theme.colors.text.primary}
                    style={inputStyle}
                    theme={inputTheme}
                  />

                  <TextInput
                    label="City"
                    value={city}
                    onChangeText={setCity}
                    mode="outlined"
                    left={<TextInput.Icon icon="city" color={theme.colors.primary.main} />}
                    outlineColor={outlineColor}
                    activeOutlineColor={theme.colors.primary.main}
                    textColor={theme.colors.text.primary}
                    style={inputStyle}
                    theme={inputTheme}
                  />
                </>
              )}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                {step > 1 && (
                  <Button
                    mode="outlined"
                    onPress={() => setStep(step - 1)}
                    textColor={theme.colors.text.primary}
                    style={{ flex: 1, borderRadius: 12, borderColor: isDark ? 'rgba(255,255,255,0.12)' : theme.colors.primary.pastel }}
                    contentStyle={{ paddingVertical: 4 }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  mode="contained"
                  onPress={handleNext}
                  loading={loading}
                  disabled={loading}
                  buttonColor={theme.colors.primary.main}
                  textColor="#FFFFFF"
                  style={{ flex: 2, borderRadius: 12 }}
                  contentStyle={{ paddingVertical: 6 }}
                >
                  {step === 2 ? 'Register' : 'Next'}
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Login link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
            <Text variant="bodyMedium" style={{ color: theme.colors.text.secondary }}>
              Already have an account?
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.primary.main, fontWeight: '700' }}
              onPress={() => navigation.navigate('Login')}
            >
              Login
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
