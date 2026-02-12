import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function JewellerSettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme, isDark, themeMode, setThemeMode } = useTheme();

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
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background.primary }]} contentContainerStyle={{ paddingBottom: 20 }}>
      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Business Profile
          </Text>
          <List.Item
            title="Email"
            description={user?.email || 'Not available'}
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="email" color={theme.colors.primary.main} />}
          />
          <List.Item
            title="Role"
            description="Jeweller Admin"
            titleStyle={{ color: theme.colors.text.primary }}
            descriptionStyle={{ color: theme.colors.text.secondary }}
            left={(props) => <List.Icon {...props} icon="shield-account" color={theme.colors.primary.main} />}
          />
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
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

      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Gold Price Management
          </Text>
          <Button
            mode="contained"
            icon="cash-plus"
            style={styles.button}
            buttonColor={theme.colors.primary.main}
            textColor="#fff"
            onPress={() => navigation.navigate('GoldPrice')}
          >
            Update Gold Price
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.background.card }, isDark && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }]}>
        <Card.Content>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.text.primary }]}>
            Account
          </Text>
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
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
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
