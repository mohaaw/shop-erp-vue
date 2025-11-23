// Premium themes with high readability
export const themePresets = {
    dark: {
        name: 'Dark',
        description: 'Premium dark theme with gold accents',
        colors: {
            // Backgrounds - SOLID for readability
            primary: '#D4AF37',        // Signature Gold
            secondary: '#5B9FED',      // Blue accent
            accent: '#4ECDC4',         // Teal
            background: '#1E1E2F',     // Deep dark
            backgroundOffset: '#27293D',
            cardBackground: '#27293D', // SOLID, not transparent

            // Text - HIGH CONTRAST
            textMain: '#FFFFFF',
            textMuted: '#9A9A9A',
            textInverted: '#1E1E2F',

            // UI Elements
            borderColor: 'rgba(212, 175, 55, 0.3)',
            navBg: '#1E1E2F',
            navText: '#FFFFFF',

            // Status colors
            success: '#4ECDC4',
            danger: '#FF5C93',
            warning: '#FF9F43',
            info: '#5B9FED'
        }
    },

    light: {
        name: 'Light',
        description: 'Clean light theme with gold accents',
        colors: {
            // Backgrounds - SOLID
            primary: '#D4AF37',        // Signature Gold
            secondary: '#5E72E4',      // Blue
            accent: '#FF6B2C',         // Orange
            background: '#F4F5F7',
            backgroundOffset: '#FFFFFF',
            cardBackground: '#FFFFFF', // SOLID white cards

            // Text - HIGH CONTRAST
            textMain: '#2D3748',
            textMuted: '#718096',
            textInverted: '#FFFFFF',

            // UI Elements
            borderColor: 'rgba(0, 0, 0, 0.1)',
            navBg: '#FFFFFF',
            navText: '#2D3748',

            // Status colors
            success: '#2DCE89',
            danger: '#F5365C',
            warning: '#FB6340',
            info: '#5E72E4'
        }
    },

    purple: {
        name: 'Purple',
        description: 'Purple theme with gold accents',
        colors: {
            // Backgrounds - SOLID
            primary: '#BA54F5',        // Purple
            secondary: '#D4AF37',      // Gold accent
            accent: '#00E5C3',         // Cyan
            background: '#1E1E2F',
            backgroundOffset: '#27293D',
            cardBackground: '#27293D', // SOLID

            // Text - HIGH CONTRAST
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

export const defaultTheme = 'dark';

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
