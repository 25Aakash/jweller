/**
 * Dark Theme Configuration
 * For dark mode support
 */

import { Theme } from './theme';

export const darkTheme: Theme = {
    colors: {
        // Soft Pastel Primary Colors (adjusted for dark)
        primary: {
            light: '#A5B4FC', // Lighter indigo for dark bg
            main: '#818CF8', // Soft indigo
            dark: '#6366F1', // Medium indigo
            pastel: '#C7D2FE', // Pastel indigo
        },

        secondary: {
            light: '#6EE7B7', // Lighter emerald
            main: '#34D399', // Soft emerald
            dark: '#10B981', // Medium emerald
            pastel: '#A7F3D0', // Pastel emerald
        },

        accent: {
            pink: '#FBCFE8', // Soft pink
            peach: '#FED7AA', // Soft peach
            lavender: '#DDD6FE', // Soft lavender
            mint: '#CCFBF1', // Soft mint
        },

        // Soft Gradients (darker versions for dark mode)
        gradients: {
            primary: ['#A5B4FC', '#818CF8', '#6366F1'] as readonly [string, string, string],
            secondary: ['#6EE7B7', '#34D399', '#10B981'] as readonly [string, string, string],
            sunset: ['#FED7AA', '#FBCFE8', '#DDD6FE'] as readonly [string, string, string],
            ocean: ['#CCFBF1', '#A7F3D0', '#C7D2FE'] as readonly [string, string, string],
        },

        // Glassmorphism (darker)
        glass: {
            light: 'rgba(255, 255, 255, 0.05)',
            medium: 'rgba(255, 255, 255, 0.08)',
            dark: 'rgba(255, 255, 255, 0.03)',
            border: 'rgba(255, 255, 255, 0.1)',
        },

        // Semantic Colors
        success: '#34D399',
        error: '#F87171',
        warning: '#FBBF24',
        info: '#60A5FA',

        // Dark Backgrounds
        background: {
            primary: '#0F172A', // Dark slate
            secondary: '#1E293B', // Lighter slate
            tertiary: '#334155', // Medium slate
            card: '#1E293B',
        },

        // Text Colors (light for dark bg)
        text: {
            primary: '#F8FAFC', // Very light
            secondary: '#CBD5E1', // Light gray
            disabled: '#64748B', // Medium gray
            hint: '#475569', // Darker gray
        },

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.7)',
        backdrop: 'rgba(0, 0, 0, 0.5)',
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
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};
