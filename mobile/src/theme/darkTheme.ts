/**
 * Dark Theme Configuration
 * Instagram / WhatsApp inspired — warm dark grays, not pure black
 */

import { Theme } from './theme';

export const darkTheme: Theme = {
    colors: {
        primary: {
            light: '#7C8AFF',
            main: '#818CF8',
            dark: '#A5B4FC',
            pastel: '#3B3F7A',
        },

        secondary: {
            light: '#34D399',
            main: '#6EE7B7',
            dark: '#A7F3D0',
            pastel: '#1A3D30',
        },

        accent: {
            pink: '#F9A8D4',
            peach: '#FDBA74',
            lavender: '#C4B5FD',
            mint: '#5EEAD4',
        },

        gradients: {
            primary: ['#2D3162', '#3B3F7A', '#4F46E5'] as readonly [string, string, string],
            secondary: ['#1A3D30', '#1E5040', '#10B981'] as readonly [string, string, string],
            sunset: ['#3D2E2E', '#3B2D4A', '#4F46E5'] as readonly [string, string, string],
            ocean: ['#1A3D38', '#1E4040', '#2D3162'] as readonly [string, string, string],
        },

        glass: {
            light: 'rgba(255, 255, 255, 0.06)',
            medium: 'rgba(255, 255, 255, 0.10)',
            dark: 'rgba(255, 255, 255, 0.04)',
            border: 'rgba(255, 255, 255, 0.12)',
        },

        success: '#34D399',
        error: '#FB7185',
        warning: '#FBBF24',
        info: '#60A5FA',

        // Instagram/WhatsApp style dark — warm dark grays, not pure black
        background: {
            primary: '#121212',     // Main bg (like Instagram dark)
            secondary: '#1E1E1E',   // Slightly elevated (like WhatsApp chat bg)
            tertiary: '#2A2A2A',    // Cards/surfaces
            card: '#1E1E1E',        // Card background
        },

        text: {
            primary: '#F5F5F5',     // Primary text — soft white
            secondary: '#A0A0A0',   // Secondary — muted gray
            disabled: '#666666',    // Disabled
            hint: '#505050',        // Hints
        },

        overlay: 'rgba(0, 0, 0, 0.6)',
        backdrop: 'rgba(0, 0, 0, 0.4)',
    },

    typography: {
        fontFamily: {
            regular: 'System',
            medium: 'System',
            bold: 'System',
        },
        fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
        },
        fontWeight: {
            regular: '400' as const,
            medium: '500' as const,
            semibold: '600' as const,
            bold: '700' as const,
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        round: 999,
    },

    blur: {
        sm: 10,
        md: 20,
        lg: 30,
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 3,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 5,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.6,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};
