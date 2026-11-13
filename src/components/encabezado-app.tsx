import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EncabezadoAppProps {
    // Lo que va a la derecha de la barra en cada pantalla
    children?: ReactNode;
}

export function EncabezadoApp({ children }: EncabezadoAppProps) {
    const theme = useTheme();
    // El alto de la barra de estado se toma del celular, no de la posición de la pantalla
    const insets = useSafeAreaInsets();
    // Dentro de las pestañas el borde puede llegar en 0 justo después del login
    const altoBarra = Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0);

    return (
        <View style={{ backgroundColor: theme.surface, paddingTop: altoBarra }}>
            <View style={[styles.barra, { borderBottomColor: theme.border }]}>
                <View style={styles.marca}>
                    <Image
                        source={require('@/assets/images/iconoEventU.png')}
                        style={styles.logo}
                        contentFit="contain"
                        accessible={false}
                    />
                    <ThemedText type="smallBold" accessibilityLabel="EventU" style={styles.textoMarca}>
                        Event<Text style={{ color: theme.primary }}>U</Text>
                    </ThemedText>
                </View>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    barra: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        paddingLeft: Spacing.three,
        paddingRight: Spacing.two,
    },
    marca: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    logo: { width: 28, height: 28 },
    textoMarca: { fontSize: 20, lineHeight: 28 },
});
