/**
 * Black & Gold — Dark Theme
 * Premium dark mode with warm gold accents
 * Deep blacks with gold highlights for a luxury jewellery feel
 */

import { Theme } from './theme';

export const darkTheme: Theme = {
    colors: {
        // Gold accents on dark
        primary: {
            light: '#E8C872', // Light gold
            main: '#D4A843', // Rich gold — main CTA
            dark: '#F0D078', // Bright gold — headers on dark
            pastel: '#3D2E14', // Dark gold-brown tint
        },

        secondary: {
            light: '#34D399',
            main: '#6EE7B7',
            dark: '#A7F3D0',
            pastel: '#1A3D2A',
        },

        accent: {
            pink: '#F9A8D4',
            peach: '#FDBA74',
            lavender: '#C4B5FD',
            mint: '#5EEAD4',
        },

        // Dark gold gradients
        gradients: {
            primary: ['#1A1508', '#2D2210', '#3D2E14'] as readonly [string, string, string],
            secondary: ['#0F1F17', '#1A3D2A', '#10B981'] as readonly [string, string, string],
            sunset: ['#2D1A1A', '#3D2E14', '#D4A843'] as readonly [string, string, string],
            ocean: ['#0F1F1C', '#1A3D2A', '#2D2210'] as readonly [string, string, string],
        },

        glass: {
            light: 'rgba(212, 168, 67, 0.06)',
            medium: 'rgba(212, 168, 67, 0.10)',
            dark: 'rgba(212, 168, 67, 0.04)',
            border: 'rgba(212, 168, 67, 0.15)',
        },

        success: '#34D399',
        error: '#FB7185',
        warning: '#FBBF24',
        info: '#60A5FA',

        // Deep blacks with warm undertone
        background: {
            primary: '#0C0A08', // Near-black with warm brown undertone
            secondary: '#161310', // Slightly warm elevated
            tertiary: '#211D18', // Card surfaces — warm charcoal
            card: '#161310',
        },

        // Warm-tinted text
        text: {
            primary: '#F5F0E8', // Warm white
            secondary: '#A89A88', // Warm muted
            disabled: '#6B5F52', // Warm disabled
            hint: '#4A4036', // Warm hints
        },

        overlay: 'rgba(0, 0, 0, 0.65)',
        backdrop: 'rgba(0, 0, 0, 0.45)',
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
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 3,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 5,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.7,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};
