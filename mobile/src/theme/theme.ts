/**
 * Royal Gold — Light Theme
 * Premium jewellery-inspired warm gold & ivory palette
 * Inspired by Gullak / Tanishq / luxury gold-savings apps
 */

export const theme = {
    colors: {
        // Gold Primary Colors
        primary: {
            light: '#FFF3D6', // Light gold wash
            main: '#B8860B', // Rich dark goldenrod — main CTA
            dark: '#8B6914', // Deep gold — headers
            pastel: '#FCEBC8', // Pastel gold
        },

        secondary: {
            light: '#F0FDF4', // Soft mint
            main: '#34D399', // Emerald green — success accent
            dark: '#059669', // Deep emerald
            pastel: '#D1FAE5', // Pastel green
        },

        accent: {
            pink: '#FDE2E2', // Soft rose
            peach: '#FDE8D0', // Warm peach
            lavender: '#EDE9FE', // Soft lavender
            mint: '#D5F5F0', // Soft mint
        },

        // Warm Gold Gradients
        gradients: {
            primary: ['#FFF8E7', '#FCEBC8', '#F5D791'] as readonly [string, string, string],
            secondary: ['#F0FDF4', '#D1FAE5', '#6EE7B7'] as readonly [string, string, string],
            sunset: ['#FDE8D0', '#FDE2E2', '#EDE9FE'] as readonly [string, string, string],
            ocean: ['#D5F5F0', '#D1FAE5', '#FCEBC8'] as readonly [string, string, string],
        },

        // Glassmorphism
        glass: {
            light: 'rgba(255, 255, 255, 0.75)',
            medium: 'rgba(255, 255, 255, 0.55)',
            dark: 'rgba(255, 255, 255, 0.35)',
            border: 'rgba(218, 165, 32, 0.2)',
        },

        // Semantic Colors
        success: '#059669',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',

        // Warm Ivory Backgrounds
        background: {
            primary: '#FFFDF7', // Warm ivory
            secondary: '#FFFFFF', // White
            tertiary: '#FFF9F0', // Cream
            card: '#FFFFFF',
        },

        // Warm Text Colors
        text: {
            primary: '#2C1810', // Deep warm brown
            secondary: '#6B5744', // Medium brown
            disabled: '#A89585', // Warm gray
            hint: '#D1C4B5', // Light warm gray
        },

        // Overlays
        overlay: 'rgba(44, 24, 16, 0.08)',
        backdrop: 'rgba(44, 24, 16, 0.04)',
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
            shadowColor: '#8B6914',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#8B6914',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#8B6914',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.10,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};

export type Theme = typeof theme;
