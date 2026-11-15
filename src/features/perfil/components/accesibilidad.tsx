import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAccesibilidad, type TamanoLetra } from '@/context/accesibilidad-context';
import { useTheme } from '@/hooks/use-theme';

const TAMANOS: { valor: TamanoLetra; etiqueta: string }[] = [
    { valor: 'pequena', etiqueta: 'Pequeña' },
    { valor: 'normal', etiqueta: 'Normal' },
    { valor: 'grande', etiqueta: 'Grande' },
];

export function Accesibilidad() {
    const theme = useTheme();
    const { altoContraste, daltonismo, tamanoLetra, cambiarPreferencias } = useAccesibilidad();

    const opciones = [
        {
            titulo: 'Alto contraste',
            descripcion: 'Aumenta el contraste de textos y bordes.',
            activo: altoContraste,
            cambiar: (valor: boolean) => cambiarPreferencias({ altoContraste: valor }),
        },
        {
            titulo: 'Modo daltonismo',
            descripcion: 'Usa azul y naranja en lugar de verde y rojo.',
            activo: daltonismo,
            cambiar: (valor: boolean) => cambiarPreferencias({ daltonismo: valor }),
        },
    ];

    return (
        <View
            style={[
                styles.tarjeta,
                { backgroundColor: theme.surface, borderColor: theme.border, borderTopColor: theme.primary },
            ]}>
            <View style={styles.titulo}>
                <SymbolView
                    name={{ ios: 'accessibility', android: 'accessibility_new', web: 'accessibility_new' }}
                    size={18}
                    tintColor={theme.text}
                />
                <ThemedText type="smallBold" accessibilityRole="header" style={styles.textoTitulo}>
                    Accesibilidad
                </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
                Ajusta la app para leerla mejor. Se guarda en este celular.
            </ThemedText>

            {opciones.map(({ titulo, descripcion, activo, cambiar }) => (
                <View key={titulo} style={[styles.opcion, { borderTopColor: theme.border }]}>
                    <View style={styles.flex}>
                        <ThemedText type="smallBold">{titulo}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {descripcion}
                        </ThemedText>
                    </View>
                    <Switch
                        accessibilityLabel={titulo}
                        value={activo}
                        onValueChange={cambiar}
                        trackColor={{ true: theme.primary, false: theme.border }}
                    />
                </View>
            ))}

            <View style={[styles.letra, { borderTopColor: theme.border }]}>
                <ThemedText type="smallBold">Tamaño de letra</ThemedText>
                <View style={styles.tamanos} accessibilityLabel="Tamaño de letra">
                    {TAMANOS.map(({ valor, etiqueta }) => {
                        const elegido = tamanoLetra === valor;
                        return (
                            <Pressable
                                key={valor}
                                accessibilityRole="button"
                                accessibilityState={{ selected: elegido }}
                                hitSlop={6}
                                onPress={() => cambiarPreferencias({ tamanoLetra: valor })}
                                style={[
                                    styles.tamano,
                                    elegido
                                        ? { backgroundColor: theme.text, borderColor: theme.text }
                                        : { backgroundColor: theme.surface, borderColor: theme.border },
                                ]}>
                                <ThemedText
                                    type="small"
                                    style={[styles.textoTamano, { color: elegido ? theme.surface : theme.textSecondary }]}>
                                    {etiqueta}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    tarjeta: { gap: 12, borderWidth: 1, borderTopWidth: 6, borderRadius: 8, padding: Spacing.three },
    titulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    textoTitulo: { fontSize: 16, lineHeight: 24 },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderTopWidth: 1,
        paddingTop: 12,
    },
    letra: { gap: Spacing.two, borderTopWidth: 1, paddingTop: 12 },
    tamanos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    tamano: {
        minHeight: 32,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 12,
    },
    textoTamano: { fontSize: 12, lineHeight: 16 },
});
