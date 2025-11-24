export const themePresets = {
    light: {
        name: 'Frappe Flat',
        description: 'Clean, professional ERPNext-inspired theme',
        colors: {
            // Core Backgrounds
            background: '#F4F5F7',        // Light Gray (Desk Background)
            backgroundOffset: '#FFFFFF',  // White (Card Background)
            cardBackground: '#FFFFFF',    // White

            // Text Colors
            textMain: '#1F272E',          // Dark Slate (Primary Text)
            textMuted: '#6C7680',         // Muted Gray (Secondary Text)
            textLight: '#8D99A6',         // Light Gray (Disabled/Placeholder)
            textInverted: '#FFFFFF',      // White text on dark backgrounds

            // Brand Colors
            primary: '#2490EF',           // ERPNext Blue
            primaryHover: '#1C7CD6',
            secondary: '#718096',         // Slate Gray
            accent: '#2490EF',            // Same as primary for consistency

            // Borders & Separators
            border: '#E2E6EA',            // Very Light Gray
            borderHover: '#D1D5DB',

            // Status Colors (Standardized)
            success: '#28A745',
            warning: '#FFC107',
            danger: '#DC3545',
            info: '#17A2B8',

            // UI Elements
            inputBackground: '#F4F5F7',   // Light Gray Input
            inputBorder: '#DFE2E5',

            // Sidebar
            sidebarBackground: '#FFFFFF', // White Sidebar
            sidebarBorder: '#E2E6EA',
            sidebarText: '#1F272E',
            sidebarActiveBg: '#F0F4F8',   // Very Light Blue
            sidebarActiveText: '#2490EF'
        }
    },
    dark: {
        name: 'Frappe Dark',
        description: 'Professional dark mode for ERPNext',
        colors: {
            // Core Backgrounds
            background: '#1A202C',        // Dark Gray (Desk Background)
            backgroundOffset: '#2D3748',  // Gray-800 (Card Background)
            cardBackground: '#2D3748',    // Gray-800

            // Text Colors
            textMain: '#F9FAFB',          // Near White
            textMuted: '#A0AEC0',         // Gray-400
            textLight: '#718096',         // Gray-500
            textInverted: '#111827',      // Dark text on light backgrounds

            // Brand Colors
            primary: '#3B82F6',           // Bright Blue
            primaryHover: '#60A5FA',
            secondary: '#A0AEC0',         // Gray-400
            accent: '#3B82F6',

            // Borders & Separators
            border: '#4A5568',            // Gray-700
            borderHover: '#718096',

            // Status Colors
            success: '#48BB78',
            warning: '#ECC94B',
            danger: '#F56565',
            info: '#4299E1',

            // UI Elements
            inputBackground: '#1A202C',
            inputBorder: '#4A5568',

            // Sidebar
            sidebarBackground: '#2D3748',
            sidebarBorder: '#4A5568',
            sidebarText: '#E2E8F0',
            sidebarActiveBg: '#4A5568',
            sidebarActiveText: '#63B3ED'
        }
    }
};

export const defaultTheme = 'light';

export const applyThemeColors = (colors) => {
    const root = document.documentElement;

    // Helper to set CSS variable
    const set = (name, value) => root.style.setProperty(`--${name}`, value);

    // Apply all colors as CSS variables
    Object.entries(colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        // e.g. cardBackground -> --card-background
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        set(cssVarName, value);
    });

    // Map legacy/specific variables if needed for backward compatibility
    if (colors.background) set('bg-color', colors.background);
    if (colors.cardBackground) set('card-bg-color', colors.cardBackground);
    if (colors.textMain) set('text-color', colors.textMain);
    if (colors.textMuted) set('text-color-muted', colors.textMuted);
    if (colors.primary) set('primary-color', colors.primary);
    if (colors.border) set('border-color', colors.border);

    // Set specific derived variables
    set('radius-base', '6px');      // Standard ERPNext radius
    set('radius-sm', '4px');
    set('radius-lg', '8px');
    set('font-family', "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");
};

export function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}
