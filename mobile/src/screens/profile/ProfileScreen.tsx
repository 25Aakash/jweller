import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List, SegmentedButtons, Switch } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  clearStoredCredentials,
  checkBiometricSupport,
  isBiometricEnabled,
  setBiometricEnabled,
} from '../../utils/biometric';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
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

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearStoredCredentials();
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Profile Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Profile
          </Text>
          <List.Item
            title="Name"
            description={user?.name || 'Guest'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="account" color={theme.colors.primary.main} />}
          />
          <List.Item
            title="Phone"
            description={user?.phone_number || 'N/A'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="phone" color={theme.colors.primary.main} />}
          />
          <List.Item
            title="Location"
            description={user?.city && user?.state ? `${user.city}, ${user.state}` : 'Not available'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="map-marker" color={theme.colors.primary.main} />}
          />
          <List.Item
            title="Role"
            description={user?.role || 'Customer'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="shield-account" color={theme.colors.primary.main} />}
          />
        </Card.Content>
      </Card>

      {/* Security Settings */}
      {biometricAvailable && (
        <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
              Security
            </Text>
            <List.Item
              title={biometricType === 'face' ? 'Face ID Login' : 'Fingerprint Login'}
              description="Quick & secure authentication"
              titleStyle={{ color: theme.colors.text.primary }}
              descriptionStyle={{ color: theme.colors.text.secondary }}
              left={(props) => <List.Icon {...props} icon={biometricType === 'face' ? 'face-recognition' : 'fingerprint'} color={theme.colors.primary.main} />}
              right={() => (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  color={theme.colors.primary.main}
                />
              )}
            />
          </Card.Content>
        </Card>
      )}

      {/* Appearance */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Appearance
          </Text>
          <SegmentedButtons
            value={themeMode}
            onValueChange={(val) => setThemeMode(val as any)}
            buttons={[
              { value: 'light', label: '☀️ Light', style: { backgroundColor: themeMode === 'light' ? theme.colors.primary.main : theme.colors.background.tertiary } },
              { value: 'dark', label: '🌙 Dark', style: { backgroundColor: themeMode === 'dark' ? theme.colors.primary.main : theme.colors.background.tertiary } },
              { value: 'auto', label: '📱 Auto', style: { backgroundColor: themeMode === 'auto' ? theme.colors.primary.main : theme.colors.background.tertiary } },
            ]}
            style={styles.themeButtons}
          />
        </Card.Content>
      </Card>

      {/* Notifications */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <List.Item
            title="Notifications"
            description="Push notifications for updates"
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="bell" color={theme.colors.primary.main} />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color={theme.colors.primary.main}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Account
          </Text>
          <List.Item
            title="Change Password"
            titleStyle={{ color: theme.colors.text.primary }}
            left={(props) => <List.Icon {...props} icon="lock-reset" color={theme.colors.primary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.text.disabled} />}
            onPress={() => {}}
          />
          <List.Item
            title="Update Phone Number"
            titleStyle={{ color: theme.colors.text.primary }}
            left={(props) => <List.Icon {...props} icon="phone-settings" color={theme.colors.primary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.text.disabled} />}
            onPress={() => {}}
          />
          <List.Item
            title="About & Help"
            titleStyle={{ color: theme.colors.text.primary }}
            left={(props) => <List.Icon {...props} icon="information" color={theme.colors.primary.main} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" color={theme.colors.text.disabled} />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && styles.darkCardBorder]}>
        <Card.Content>
          <Button
            mode="outlined"
            icon="logout"
            style={[styles.button, { borderColor: theme.colors.error }]}
            textColor={theme.colors.error}
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: theme.colors.text.disabled }}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 10,
    borderRadius: 12,
  },
  darkCardBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    marginTop: 5,
    borderRadius: 10,
  },
  themeButtons: {
    marginTop: 5,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
});
