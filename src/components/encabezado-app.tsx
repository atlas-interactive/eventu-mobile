import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EncabezadoAppProps {
    // Lo que va a la derecha de la barra en cada pantalla
    children?: ReactNode;
}

export function EncabezadoApp({ children }: EncabezadoAppProps) {
    const theme = useTheme();

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
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
        </SafeAreaView>
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
