import '@/global.css';

import { Platform } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

export const Colors = {
    light: {
        text: '#1a1a18',
        background: '#f8f7f4',
        surface: '#ffffff',
        backgroundElement: '#F0F0F3',
        backgroundSelected: '#E0E1E6',
        textSecondary: '#6b6b68',
        primary: '#b3141f',
        onPrimary: '#ffffff',
        link: '#b3141f',
        error: '#b91c1c',
        errorBackground: '#fef2f2',
        success: '#15803d',
        successBackground: '#f0fdf4',
        border: '#e4e3de',
        fieldBorder: '#878782',
        disabledButton: '#EDEDEA',
        softRedBackground: '#fbeaea',
        deportiveOrange: '#92400e',
        deportiveOrangeBackground: '#fff3e0',
        culturalPurple: '#5b21b6',
        culturalPurpleBackground: '#f5f3ff',
        category: '#334155',
        categoryBackground: '#e8edf2',
        certificado: '#92400e',
        certificadoBackground: '#fef3c7',
        bannerInicio: '#1d4ed8',
        bannerFin: '#60a5fa',
        agotado: '#8a4b08',
        agotadoBackground: '#fff4e5',
        overlay: 'rgba(0, 0, 0, 0.4)',
    },
    dark: {
        text: '#f5f5f3',
        background: '#121211',
        surface: '#1c1c1a',
        backgroundElement: '#212225',
        backgroundSelected: '#2E3135',
        textSecondary: '#a3a39f',
        primary: '#b3141f',
        onPrimary: '#ffffff',
        link: '#FF6B6B',
        error: '#f87171',
        errorBackground: '#3b0d0d',
        success: '#4ade80',
        successBackground: '#052e16',
        border: '#2E3135',
        fieldBorder: '#6b6b68',
        disabledButton: '#2a2a28',
        softRedBackground: '#3a1114',
        deportiveOrange: '#fdba74',
        deportiveOrangeBackground: '#3b1d06',
        culturalPurple: '#c4b5fd',
        culturalPurpleBackground: '#2e1065',
        category: '#cbd5e1',
        categoryBackground: '#1e293b',
        certificado: '#fcd34d',
        certificadoBackground: '#3b2a06',
        bannerInicio: '#1e3a8a',
        bannerFin: '#2563eb',
        agotado: '#fdba74',
        agotadoBackground: '#3b1d06',
        overlay: 'rgba(0, 0, 0, 0.6)',
    },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

type AjustePaleta = Record<'light' | 'dark', Partial<Record<ThemeColor, string>>>;

// Textos y bordes más marcados para el modo de alto contraste
export const AltoContraste: AjustePaleta = {
    light: {
        text: '#000000',
        background: '#ffffff',
        textSecondary: '#2b2b29',
        primary: '#8c0f18',
        link: '#8c0f18',
        error: '#8a1010',
        success: '#0b5a26',
        border: '#5c5c58',
        fieldBorder: '#000000',
        category: '#0f172a',
        certificado: '#6b2e05',
        agotado: '#6b3604',
    },
    dark: {
        text: '#ffffff',
        background: '#000000',
        surface: '#0d0d0c',
        textSecondary: '#e4e4e0',
        primary: '#e5484d',
        link: '#ff8a8a',
        error: '#ff9b9b',
        success: '#7ef0a6',
        border: '#a3a39f',
        fieldBorder: '#ffffff',
        category: '#f1f5f9',
        certificado: '#fde68a',
        agotado: '#fed7aa',
    },
};

// Azul y naranja en lugar de verde y rojo para los estados, que se distinguen con daltonismo
export const Daltonismo: AjustePaleta = {
    light: {
        success: '#0057b8',
        successBackground: '#e8f1fb',
        error: '#a35200',
        errorBackground: '#fff4e6',
    },
    dark: {
        success: '#6cb4ff',
        successBackground: '#0b2545',
        error: '#ffb066',
        errorBackground: '#3b2106',
    },
};

export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif', 
        rounded: 'ui-rounded',
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: 'var(--font-display)',
        serif: 'var(--font-serif)',
        rounded: 'var(--font-rounded)',
        mono: 'var(--font-mono)',
    },
});

export const Spacing = {
    half: 2,
    one: 4,
    two: 8,
    three: 16,
    four: 24,
    five: 32,
    six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

// Espacio al final de las listas de las pestañas para que la barra flotante no tape el contenido
export const EspacioFinalPestanas =
    Platform.OS === 'ios'
        ? (initialWindowMetrics?.insets.bottom ?? 0) + BottomTabInset + Spacing.three
        : Spacing.three;
export const MaxContentWidth = 800;
