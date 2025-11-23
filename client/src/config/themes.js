// ERPNext-inspired professional theme system
// Based on ERPNext v14+ "Timeless Day" and "Timeless Night" themes
export const themePresets = {
    light: {
        name: 'Light',
        description: 'Clean professional light theme (ERPNext Timeless Day)',
        colors: {
            // Backgrounds
            primary: '#2490EF',        // ERPNext blue
            secondary: '#6C757D',      // Gray
            accent: '#17A2B8',         // Teal
            background: '#F7F7F7',     // Light gray background
            backgroundOffset: '#FFFFFF',
            cardBackground: '#FFFFFF', // Solid white cards

            // Text - High contrast
            textMain: '#171717',       // Near black
            textMuted: '#6C757D',      // Gray
            textInverted: '#FFFFFF',

            // UI Elements
            borderColor: '#DDE2E5',
            navBg: '#FFFFFF',
            navText: '#171717',

            // Status colors
            success: '#28A745',
            danger: '#DC3545',
            warning: '#FFC107',
            info: '#2490EF'
        }
    },

    dark: {
        name: 'Dark',
        description: 'Professional dark theme (ERPNext Timeless Night)',
        colors: {
            // Backgrounds
            primary: '#3A8EF6',        // Lighter blue for dark bg
            secondary: '#A8A8A8',      // Light gray
            accent: '#4DD4E8',         // Bright teal
            background: '#171717',     // Near black
            backgroundOffset: '#1F1F1F',
            cardBackground: '#25272E', // Dark gray cards

            // Text - High contrast
            textMain: '#F7F7F7',       // Off white
            textMuted: '#A8A8A8',      // Light gray
            textInverted: '#171717',

            // UI Elements
            borderColor: '#3A3A3A',
            navBg: '#171717',
            navText: '#F7F7F7',

            // Status colors
            success: '#48BB78',
            danger: '#F56565',
            warning: '#ECC94B',
            info: '#3A8EF6'
        }
    },

    purple: {
        name: 'Purple',
        description: 'Purple theme with gold accents (Custom)',
        colors: {
            // Backgrounds
            primary: '#BA54F5',        // Purple
            secondary: '#D4AF37',      // Gold accent
            accent: '#00E5C3',         // Cyan
            background: '#1E1E2F',
            backgroundOffset: '#27293D',
            cardBackground: '#27293D', // Solid

            // Text - High contrast
            textMain: '#FFFFFF',
            textMuted: '#9A9A9A',
            textInverted: '#1E1E2F',

            // UI Elements
            borderColor: 'rgba(186, 84, 245, 0.3)',
            navBg: '#1E1E2F',
            navText: '#FFFFFF',

            // Status colors
            success: '#00E5C3',
            danger: '#FF5C93',
            warning: '#D4AF37',
            info: '#BA54F5'
        }
    }
};

export const defaultTheme = 'light';

// Color keys that can be customized
export const customizableColors = [
    { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
    { key: 'secondary', label: 'Secondary Color', description: 'Secondary accent color' },
    { key: 'accent', label: 'Accent Color', description: 'Highlight color' },
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'cardBackground', label: 'Card Background', description: 'Card and panel background' },
    { key: 'textMain', label: 'Text Color', description: 'Primary text color' },
    { key: 'textMuted', label: 'Muted Text', description: 'Secondary text color' }
];

// Helper function to get theme colors
export function getThemeColors(themeName) {
    return themePresets[themeName]?.colors || themePresets[defaultTheme].colors;
}

// Helper function to apply theme colors to CSS variables
export function applyThemeColors(colors) {
    const root = document.documentElement;

    // Map theme color keys to actual CSS variable names used by the app
    const cssVarMapping = {
        primary: '--primary-color',
        secondary: '--secondary-color',
        accent: '--accent-color',
        background: '--bg-color',
        backgroundOffset: '--bg-color-offset',
        cardBackground: '--card-bg-color',
        textMain: '--text-color',
        textMuted: '--text-color-muted',
        textInverted: '--text-color-inverted',
        borderColor: '--border-color',
        navBg: '--nav-bg-color',
        navText: '--nav-text-color',
        success: '--success-color',
        danger: '--danger-color',
        warning: '--warning-color',
        info: '--info-color'
    };

    // Apply each color to its corresponding CSS variable
    Object.entries(colors).forEach(([key, value]) => {
        const cssVarName = cssVarMapping[key];
        if (cssVarName) {
            root.style.setProperty(cssVarName, value);
        }
    });
}

// Helper function to validate hex color
export function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}
