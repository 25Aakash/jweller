import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const STORED_CREDENTIALS_KEY = 'stored_credentials';

export const checkBiometricSupport = async (): Promise<{
    available: boolean;
    type: string;
}> => {
    try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
            return { available: false, type: 'none' };
        }

        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) {
            return { available: false, type: 'not_enrolled' };
        }

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const type = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
            ? 'face'
            : types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
                ? 'fingerprint'
                : 'biometric';

        return { available: true, type };
    } catch (error) {
        console.error('Biometric check error:', error);
        return { available: false, type: 'error' };
    }
};

export const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to login',
            fallbackLabel: 'Use password',
            disableDeviceFallback: false,
        });

        return result.success;
    } catch (error) {
        console.error('Biometric auth error:', error);
        return false;
    }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
    try {
        const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        return enabled === 'true';
    } catch (error) {
        return false;
    }
};

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
    } catch (error) {
        console.error('Error setting biometric preference:', error);
    }
};

export const storeCredentials = async (
    phoneNumber: string,
    password: string
): Promise<void> => {
    try {
        const credentials = JSON.stringify({ phoneNumber, password });
        await AsyncStorage.setItem(STORED_CREDENTIALS_KEY, credentials);
    } catch (error) {
        console.error('Error storing credentials:', error);
    }
};

export const getStoredCredentials = async (): Promise<{
    phoneNumber: string;
    password: string;
} | null> => {
    try {
        const credentials = await AsyncStorage.getItem(STORED_CREDENTIALS_KEY);
        return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
        console.error('Error getting credentials:', error);
        return null;
    }
};

export const clearStoredCredentials = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORED_CREDENTIALS_KEY);
        await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    } catch (error) {
        console.error('Error clearing credentials:', error);
    }
};
