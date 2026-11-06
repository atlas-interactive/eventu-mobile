import { SymbolView } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface IconoAvisoProps {
    tipo: 'error' | 'exito';
    style?: StyleProp<ViewStyle>;
}

export function IconoAviso({ tipo, style }: IconoAvisoProps) {
    const theme = useTheme();
    const nombre =
        tipo === 'error'
            ? ({ ios: 'exclamationmark.circle', android: 'error', web: 'error' } as const)
            : ({ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' } as const);

    return (
        <SymbolView
            name={nombre}
            size={16}
            tintColor={tipo === 'error' ? theme.error : theme.success}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={style}
        />
    );
}
