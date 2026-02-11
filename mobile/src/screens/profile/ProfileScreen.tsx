import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import GradientButton from '../../components/GradientButton';
import {
  clearStoredCredentials,
  checkBiometricSupport,
  isBiometricEnabled,
  setBiometricEnabled,
} from '../../utils/biometric';
import { theme as lightTheme } from '../../theme/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const { available, type } = await checkBiometricSupport();
    setBiometricAvailable(available);
    setBiometricType(type);

    if (available) {
      const enabled = await isBiometricEnabled();
      setBiometricEnabledState(enabled);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Biometric Login',
        `Use ${biometricType === 'face' ? 'Face ID' : 'Fingerprint'} to login quickly and securely?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              await setBiometricEnabled(true);
              setBiometricEnabledState(true);
              Alert.alert('Success', 'Biometric login enabled!');
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Disable Biometric Login',
        'You will need to enter your password to login.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await setBiometricEnabled(false);
              await clearStoredCredentials();
              setBiometricEnabledState(false);
              Alert.alert('Success', 'Biometric login disabled');
            },
          },
        ]
      );
    }
  };

  const handleLogout = async () => {
    await clearStoredCredentials();
    await logout();
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={[styles.decorativeCircle1, { backgroundColor: theme.colors.primary.light }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: theme.colors.secondary.light }]} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Header */}
          <GlassCard
            gradient
            gradientColors={theme.colors.gradients.primary}
            intensity={90}
            style={styles.profileCard}
          >
            <View style={styles.profileContent}>
              <Text style={styles.profileEmoji}>👤</Text>
              <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
              <Text style={styles.profilePhone}>{user?.phone_number}</Text>
              <Text style={styles.profileLocation}>
                {user?.city && user?.state ? `📍 ${user.city}, ${user.state}` : ''}
              </Text>
            </View>
          </GlassCard>

          {/* Security Settings */}
          {biometricAvailable && (
            <GlassCard intensity={90} style={styles.settingsCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                🔐 Security
              </Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>
                    {biometricType === 'face' ? '👤' : '👆'}
                  </Text>
                  <View>
                    <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>
                      {biometricType === 'face' ? 'Face ID' : 'Fingerprint'} Login
                    </Text>
                    <Text style={[styles.settingSubtext, { color: theme.colors.text.disabled }]}>
                      Quick & secure authentication
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: theme.colors.text.disabled, true: theme.colors.primary.main }}
                  thumbColor={biometricEnabled ? theme.colors.primary.light : '#f4f3f4'}
                />
              </View>
            </GlassCard>
          )}

          {/* Theme Settings */}
          <GlassCard intensity={90} style={styles.settingsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              🎨 Appearance
            </Text>
            
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'light' && styles.themeOptionActive,
                  { borderColor: theme.colors.primary.pastel },
                  themeMode === 'light' && { borderColor: theme.colors.primary.main },
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Text style={styles.themeIcon}>☀️</Text>
                <Text style={[styles.themeText, { color: theme.colors.text.primary }]}>
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'dark' && styles.themeOptionActive,
                  { borderColor: theme.colors.primary.pastel },
                  themeMode === 'dark' && { borderColor: theme.colors.primary.main },
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Text style={styles.themeIcon}>🌙</Text>
                <Text style={[styles.themeText, { color: theme.colors.text.primary }]}>
                  Dark
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'auto' && styles.themeOptionActive,
                  { borderColor: theme.colors.primary.pastel },
                  themeMode === 'auto' && { borderColor: theme.colors.primary.main },
                ]}
                onPress={() => handleThemeChange('auto')}
              >
                <Text style={styles.themeIcon}>🔄</Text>
                <Text style={[styles.themeText, { color: theme.colors.text.primary }]}>
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Notifications */}
          <GlassCard intensity={90} style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔔</Text>
                <Text style={[styles.settingText, { color: theme.colors.text.primary }]}>
                  Notifications
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.text.disabled, true: theme.colors.primary.main }}
                thumbColor={notificationsEnabled ? theme.colors.primary.light : '#f4f3f4'}
              />
            </View>
          </GlassCard>

          {/* Account Actions */}
          <GlassCard intensity={90} style={styles.settingsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              ⚙️ Account
            </Text>
            
            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionIcon}>🔐</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Change Password
              </Text>
              <Text style={[styles.actionArrow, { color: theme.colors.text.disabled }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionIcon}>📱</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                Update Phone Number
              </Text>
              <Text style={[styles.actionArrow, { color: theme.colors.text.disabled }]}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow}>
              <Text style={styles.actionIcon}>ℹ️</Text>
              <Text style={[styles.actionText, { color: theme.colors.text.primary }]}>
                About & Help
              </Text>
              <Text style={[styles.actionArrow, { color: theme.colors.text.disabled }]}>→</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Logout Button */}
          <GradientButton
            title="Logout"
            icon="🚪"
            onPress={handleLogout}
            colors={['#FCA5A5', '#F87171', '#EF4444'] as const}
            style={styles.logoutButton}
          />

          <Text style={[styles.version, { color: theme.colors.text.disabled }]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
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
    opacity: 0.2,
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.2,
    bottom: -50,
    left: -50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: lightTheme.spacing.lg,
  },
  profileCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.lg,
  },
  profileEmoji: {
    fontSize: 64,
    marginBottom: lightTheme.spacing.sm,
  },
  profileName: {
    fontSize: lightTheme.typography.fontSize.xxl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.text.primary,
    marginBottom: lightTheme.spacing.xs,
  },
  profilePhone: {
    fontSize: lightTheme.typography.fontSize.md,
    color: lightTheme.colors.text.secondary,
    marginBottom: lightTheme.spacing.xs,
  },
  profileLocation: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.text.secondary,
  },
  settingsCard: {
    marginBottom: lightTheme.spacing.lg,
  },
  sectionTitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    fontWeight: lightTheme.typography.fontWeight.bold,
    marginBottom: lightTheme.spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: lightTheme.spacing.sm,
  },
  themeOption: {
    flex: 1,
    padding: lightTheme.spacing.md,
    borderRadius: lightTheme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: lightTheme.spacing.xs,
  },
  themeText: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lightTheme.spacing.md,
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingText: {
    fontSize: lightTheme.typography.fontSize.md,
    fontWeight: lightTheme.typography.fontWeight.medium,
  },
  settingSubtext: {
    fontSize: lightTheme.typography.fontSize.xs,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: lightTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: lightTheme.spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: lightTheme.typography.fontSize.md,
    fontWeight: lightTheme.typography.fontWeight.medium,
  },
  actionArrow: {
    fontSize: lightTheme.typography.fontSize.lg,
  },
  logoutButton: {
    marginTop: lightTheme.spacing.md,
    marginBottom: lightTheme.spacing.xl,
  },
  version: {
    textAlign: 'center',
    fontSize: lightTheme.typography.fontSize.xs,
    marginBottom: lightTheme.spacing.xl,
  },
});
