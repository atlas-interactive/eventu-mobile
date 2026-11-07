import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Evento } from '@/types/evento';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });

interface ConfirmacionInscripcionProps {
    evento: Evento;
}

export function ConfirmacionInscripcion({ evento }: ConfirmacionInscripcionProps) {
    const theme = useTheme();
    const fechaInicio = new Date(evento.fechaInicio);
    const fecha = formatoFecha.format(fechaInicio);

    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView edges={['top']} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.contenido}>
                    <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.encabezado}>
                        <View style={[styles.icono, { backgroundColor: theme.success }]}>
                            <SymbolView
                                name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                                size={28}
                                tintColor={theme.onPrimary}
                            />
                        </View>
                        <ThemedText type="smallBold" style={styles.titulo}>
                            Inscripción realizada
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            Te has inscrito correctamente al evento.
                        </ThemedText>
                    </View>

                    <View style={[styles.tarjeta, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <ThemedText type="smallBold" style={styles.evento}>
                            {evento.titulo}
                        </ThemedText>
                        {/* el formato devuelve el día en minúscula */}
                        <ThemedText type="small" themeColor="textSecondary">
                            {fecha.charAt(0).toUpperCase() + fecha.slice(1)}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {formatoHora.format(fechaInicio)}, {evento.ubicacion}
                        </ThemedText>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.dismissTo('/eventos')}
                        style={[styles.boton, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }]}>
                        <ThemedText type="smallBold">Explorar más eventos</ThemedText>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    contenido: { flexGrow: 1, justifyContent: 'center', padding: Spacing.three, gap: Spacing.four },
    encabezado: { alignItems: 'center', gap: Spacing.two },
    icono: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    titulo: { fontSize: 20, lineHeight: 28, marginTop: Spacing.two },
    tarjeta: { borderWidth: 1, borderRadius: 8, padding: Spacing.three, gap: Spacing.one },
    evento: { fontSize: 16, lineHeight: 24 },
    boton: {
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
