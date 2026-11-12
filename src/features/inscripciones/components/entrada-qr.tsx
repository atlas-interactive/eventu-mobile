import { Modal, Pressable, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Inscripcion } from '@/types/inscripcion';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

interface EntradaQrProps {
    inscripcion: Inscripcion;
    onCerrar: () => void;
    // Solo el detalle del evento permite cancelar desde aquí
    onCancelar?: () => void;
}

export function EntradaQr({ inscripcion, onCerrar, onCancelar }: EntradaQrProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={onCerrar}>
            <View style={[styles.flex, { backgroundColor: theme.overlay }]}>
                <Pressable style={styles.flex} accessibilityLabel="Cerrar tu entrada" onPress={onCerrar} />
                <Animated.View
                    entering={SlideInDown.duration(250)}
                    accessibilityViewIsModal
                    style={[styles.panel, { backgroundColor: theme.background, paddingBottom: Spacing.three + insets.bottom }]}>
                    <View style={[styles.agarre, { backgroundColor: theme.border }]} />
                    <ThemedText type="smallBold" themeColor="textSecondary" accessibilityRole="header" style={styles.etiqueta}>
                        TU ENTRADA
                    </ThemedText>
                    <View style={styles.encabezado}>
                        <ThemedText type="smallBold" style={styles.titulo}>
                            {inscripcion.eventoTitulo}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {formatoFecha.format(new Date(inscripcion.eventoFechaInicio))}
                        </ThemedText>
                    </View>

                    <View style={[styles.tarjeta, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        {inscripcion.codigoQr ? (
                            <>
                                {/* El QR va siempre sobre blanco para que la cámara lo lea bien */}
                                <View style={styles.marcoQr} accessible accessibilityLabel="Código QR de tu entrada">
                                    <QRCode value={inscripcion.codigoQr} size={200} ecl="M" backgroundColor="#ffffff" color="#000000" />
                                </View>
                                <ThemedText type="small" themeColor="textSecondary" selectable style={styles.codigo}>
                                    {inscripcion.codigoQr}
                                </ThemedText>
                                <View style={[styles.estado, { backgroundColor: theme.successBackground }]}>
                                    <View style={[styles.punto, { backgroundColor: theme.success }]} />
                                    <ThemedText type="small" themeColor="success">
                                        Inscripción activa
                                    </ThemedText>
                                </View>
                            </>
                        ) : (
                            <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                                No hay un código QR disponible para esta inscripción.
                            </ThemedText>
                        )}
                    </View>

                    <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                        Presenta este código al organizador al ingresar al evento. El organizador lo escaneará para
                        registrar tu asistencia.
                    </ThemedText>

                    <Pressable
                        accessibilityRole="button"
                        onPress={onCerrar}
                        style={[styles.boton, { backgroundColor: theme.text }]}>
                        <ThemedText type="smallBold" style={{ color: theme.surface }}>
                            Listo
                        </ThemedText>
                    </Pressable>
                    {onCancelar && (
                        <Pressable accessibilityRole="button" hitSlop={8} onPress={onCancelar} style={styles.cancelar}>
                            <ThemedText type="smallBold" themeColor="primary">
                                Cancelar mi inscripción
                            </ThemedText>
                        </Pressable>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    panel: {
        gap: Spacing.three,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: Spacing.three,
        paddingTop: Spacing.two,
    },
    agarre: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
    etiqueta: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5, textAlign: 'center' },
    encabezado: { gap: 2 },
    titulo: { fontSize: 18, lineHeight: 26 },
    tarjeta: { alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: Spacing.four },
    marcoQr: { backgroundColor: '#ffffff', padding: 8, borderRadius: 8 },
    codigo: { fontSize: 13, lineHeight: 18, letterSpacing: 0.5, textAlign: 'center' },
    estado: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    punto: { width: 8, height: 8, borderRadius: 4 },
    centrado: { textAlign: 'center' },
    boton: { minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cancelar: { alignSelf: 'center', paddingVertical: Spacing.one },
});
