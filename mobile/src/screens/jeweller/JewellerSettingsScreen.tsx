import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, List } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function JewellerSettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();

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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Business Profile
          </Text>
          <List.Item
            title="Email"
            description={user?.email || 'Not available'}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Role"
            description="Jeweller Admin"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Gold Price Management
          </Text>
          <Button
            mode="contained"
            icon="cash-plus"
            style={styles.button}
            onPress={() => navigation.navigate('GoldPrice')}
          >
            Update Gold Price
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Account
          </Text>
          <Button
            mode="outlined"
            icon="logout"
            style={styles.button}
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    color: '#666',
  },
});
