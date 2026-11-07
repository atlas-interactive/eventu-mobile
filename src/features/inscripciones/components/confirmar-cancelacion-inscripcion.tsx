import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Inscripcion } from '@/types/inscripcion';

interface ConfirmarCancelacionInscripcionProps {
    inscripcion: Inscripcion;
    cancelando: boolean;
    error: string;
    onCerrar: () => void;
    onConfirmar: () => void;
}

export function ConfirmarCancelacionInscripcion({
    inscripcion,
    cancelando,
    error,
    onCerrar,
    onConfirmar,
}: ConfirmarCancelacionInscripcionProps) {
    const theme = useTheme();

    return (
        <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onCerrar}>
            <View style={styles.contenedor}>
                {/* Tocar fuera de la tarjeta también la cierra */}
                <Pressable
                    accessibilityLabel="Cerrar"
                    onPress={onCerrar}
                    style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]}
                />
                <View
                    accessibilityViewIsModal
                    style={[styles.tarjeta, { backgroundColor: theme.surface }]}>
                    <View style={[styles.icono, { backgroundColor: theme.softRedBackground }]}>
                        <ThemedText type="smallBold" themeColor="primary" style={styles.textoIcono}>
                            !
                        </ThemedText>
                    </View>
                    <ThemedText type="smallBold" accessibilityRole="header" style={styles.titulo}>
                        ¿Cancelar inscripción?
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.centrado}>
                        {inscripcion.eventoTitulo}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                        Se cancelará tu inscripción y el cupo quedará disponible para otra persona.
                    </ThemedText>
                    {!!error && (
                        <View accessibilityRole="alert" style={styles.error}>
                            <IconoAviso tipo="error" style={styles.iconoError} />
                            <ThemedText type="small" themeColor="error" style={styles.flex}>
                                {error}
                            </ThemedText>
                        </View>
                    )}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: cancelando, busy: cancelando }}
                        disabled={cancelando}
                        onPress={onConfirmar}
                        style={[styles.boton, { backgroundColor: theme.primary }, cancelando && styles.deshabilitado]}>
                        <ThemedText type="smallBold" themeColor="onPrimary">
                            {cancelando ? 'Cancelando…' : 'Confirmar cancelación'}
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: cancelando }}
                        disabled={cancelando}
                        onPress={onCerrar}
                        style={styles.boton}>
                        <ThemedText type="small">Volver</ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    contenedor: { flex: 1, justifyContent: 'center', padding: Spacing.four },
    tarjeta: { borderRadius: 16, padding: Spacing.four, gap: Spacing.two, alignItems: 'center' },
    icono: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    textoIcono: { fontSize: 18, lineHeight: 24 },
    titulo: { fontSize: 18, lineHeight: 26, marginTop: Spacing.one },
    centrado: { textAlign: 'center' },
    error: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, alignSelf: 'stretch' },
    iconoError: { marginTop: 2 },
    boton: {
        minHeight: 44,
        alignSelf: 'stretch',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deshabilitado: { opacity: 0.6 },
});
