import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

interface SkeletonProps {
    style?: StyleProp<ViewStyle>;
}

// La opacidad baja a la mitad y vuelve cada 2 segundos
export function Skeleton({ style }: SkeletonProps) {
    const theme = useTheme();
    const opacidad = useSharedValue(1);

    useEffect(() => {
        const curva = Easing.bezier(0.4, 0, 0.6, 1);
        opacidad.set(
            withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1000, easing: curva }),
                    withTiming(1, { duration: 1000, easing: curva }),
                ),
                -1,
            ),
        );
    }, [opacidad]);

    const estiloAnimado = useAnimatedStyle(() => ({ opacity: opacidad.get() }));

    return (
        <Animated.View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.bloque, { backgroundColor: `${theme.border}B3` }, estiloAnimado, style]}
        />
    );
}

interface SkeletonEstadoProps {
    children: ReactNode;
    etiqueta: string;
    style?: StyleProp<ViewStyle>;
}

export function SkeletonEstado({ children, etiqueta, style }: SkeletonEstadoProps) {
    return (
        <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={etiqueta}
            accessibilityState={{ busy: true }}
            style={style}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    bloque: { borderRadius: 4 },
});
