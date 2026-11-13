import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { mensajeDeError } from '@/api/mensajeDeError';
import { EncabezadoApp } from '@/components/encabezado-app';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { obtenerEvento } from '@/features/eventos/services/evento-service';
import { useRegistroAsistencia } from '@/hooks/asistencias/use-registro-asistencia';
import { useTheme } from '@/hooks/use-theme';
import type { Evento } from '@/types/evento';

export default function EscanearEntrada() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const idEvento = Number(id);
    const idValido = Number.isSafeInteger(idEvento) && idEvento > 0;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [error, setError] = useState('');
    const [codigoManual, setCodigoManual] = useState('');
    const [permiso, pedirPermiso] = useCameraPermissions();
    const { procesando, resultado, registrar } = useRegistroAsistencia();

    useEffect(() => {
        if (!idValido) return;
        let vigente = true;
        obtenerEvento(idEvento)
            .then((datos) => {
                if (vigente) setEvento(datos);
            })
            .catch((err: unknown) => {
                console.error('No se pudo cargar el evento a escanear:', err);
                if (vigente) setError(mensajeDeError(err));
            });
        return () => {
            vigente = false;
        };
    }, [idEvento, idValido]);

    const volver = () => (router.canGoBack() ? router.back() : router.replace(`/inscritos/${idEvento}`));

    const validarManual = async () => {
        if (!codigoManual.trim()) return;
        await registrar(codigoManual, true);
        setCodigoManual('');
    };

    // El código puede ser de otro evento del mismo organizador y el backend igual lo registra
    const otroEvento =
        resultado?.tipo === 'exito' && evento && resultado.evento !== evento.titulo ? resultado.evento : null;

    return (
        <ThemedView style={styles.flex}>
            <EncabezadoApp>
                <ThemedText
                    type="smallBold"
                    themeColor="primary"
                    style={[styles.chip, { backgroundColor: theme.softRedBackground }]}>
                    Organizador
                </ThemedText>
            </EncabezadoApp>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.contenido}>
                <Pressable accessibilityRole="link" hitSlop={12} onPress={volver} style={styles.volver}>
                    <SymbolView
                        name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                        size={18}
                        tintColor={theme.primary}
                    />
                    <ThemedText type="smallBold" themeColor="primary" style={styles.textoVolver}>
                        Volver a inscritos
                    </ThemedText>
                </Pressable>

                {!idValido && (
                    <ThemedText type="small" themeColor="textSecondary">
                        No se encontró el evento solicitado.
                    </ThemedText>
                )}

                {!!error && (
                    <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                        {error}
                    </ThemedText>
                )}

                {!!evento && (
                    <ThemedText type="smallBold" themeColor="textSecondary" style={styles.nombreEvento}>
                        {evento.titulo.toUpperCase()}
                    </ThemedText>
                )}

                <View style={styles.camara}>
                    {permiso?.granted ? (
                        <CameraView
                            style={StyleSheet.absoluteFill}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                            onBarcodeScanned={procesando ? undefined : ({ data }) => registrar(data)}
                        />
                    ) : (
                        !!permiso && (
                            <View style={styles.sinPermiso}>
                                <ThemedText type="small" style={styles.textoClaro}>
                                    {permiso.canAskAgain
                                        ? 'Para escanear, EventU necesita usar la cámara.'
                                        : 'El permiso de la cámara está desactivado. Actívalo en los ajustes del celular para escanear.'}
                                </ThemedText>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => (permiso.canAskAgain ? pedirPermiso() : Linking.openSettings())}
                                    style={[styles.botonPermiso, { backgroundColor: theme.primary }]}>
                                    <ThemedText type="smallBold" themeColor="onPrimary">
                                        {permiso.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'}
                                    </ThemedText>
                                </Pressable>
                            </View>
                        )
                    )}

                    {/* Guías de las esquinas */}
                    <View pointerEvents="none" style={styles.guias}>
                        <View style={[styles.esquina, styles.arribaIzquierda]} />
                        <View style={[styles.esquina, styles.arribaDerecha]} />
                        <View style={[styles.esquina, styles.abajoIzquierda]} />
                        <View style={[styles.esquina, styles.abajoDerecha]} />
                    </View>

                    {procesando && (
                        <View style={[styles.validando, { backgroundColor: theme.overlay }]}>
                            <ActivityIndicator color="#ffffff" />
                            <ThemedText type="smallBold" style={styles.textoClaro}>
                                Validando…
                            </ThemedText>
                        </View>
                    )}
                </View>

                <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                    Apunta la cámara al código QR
                </ThemedText>

                <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                    o escribe el código
                </ThemedText>
                <View style={styles.filaManual}>
                    <TextInput
                        accessibilityLabel="Código de la entrada"
                        style={[
                            styles.input,
                            { borderColor: theme.fieldBorder, backgroundColor: theme.surface, color: theme.text },
                        ]}
                        placeholder="EVENTU-QR-..."
                        placeholderTextColor={theme.textSecondary}
                        value={codigoManual}
                        onChangeText={setCodigoManual}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={validarManual}
                    />
                    <Pressable
                        accessibilityRole="button"
                        disabled={procesando || !codigoManual.trim()}
                        onPress={validarManual}
                        style={[
                            styles.botonValidar,
                            { backgroundColor: theme.text },
                            (procesando || !codigoManual.trim()) && styles.deshabilitado,
                        ]}>
                        <ThemedText type="smallBold" style={{ color: theme.background }}>
                            Validar
                        </ThemedText>
                    </Pressable>
                </View>

                {resultado?.tipo === 'exito' && (
                    <View
                        accessibilityRole="alert"
                        style={[styles.resultado, { backgroundColor: theme.successBackground, borderColor: theme.success }]}>
                        <SymbolView
                            name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                            size={28}
                            tintColor={theme.success}
                        />
                        <View style={styles.flex}>
                            <ThemedText type="smallBold" themeColor="success">
                                Asistencia registrada
                            </ThemedText>
                            <ThemedText type="smallBold">{resultado.usuario}</ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                Evento: {resultado.evento}
                                {resultado.hora ? ` · ${resultado.hora}` : ''}
                            </ThemedText>
                        </View>
                    </View>
                )}

                {!!otroEvento && (
                    <ThemedText
                        type="small"
                        style={[styles.aviso, { backgroundColor: theme.agotadoBackground, color: theme.agotado }]}>
                        Este código corresponde a otro de tus eventos: {otroEvento}.
                    </ThemedText>
                )}

                {resultado?.tipo === 'error' && (
                    <View
                        accessibilityRole="alert"
                        style={[styles.resultado, { backgroundColor: theme.errorBackground, borderColor: theme.error }]}>
                        <SymbolView
                            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                            size={28}
                            tintColor={theme.error}
                        />
                        <View style={styles.flex}>
                            <ThemedText type="smallBold" themeColor="error">
                                {resultado.titulo}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                {resultado.mensaje}
                            </ThemedText>
                        </View>
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const GROSOR = 4;
const LARGO = 28;

const styles = StyleSheet.create({
    flex: { flex: 1 },
    contenido: { padding: Spacing.three, gap: Spacing.three },
    chip: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 18,
        overflow: 'hidden',
    },
    volver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, alignSelf: 'flex-start' },
    textoVolver: { fontSize: 16, lineHeight: 24 },
    nombreEvento: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
    camara: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#111111',
    },
    sinPermiso: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.three,
        padding: Spacing.four,
    },
    textoClaro: { color: '#ffffff', textAlign: 'center' },
    botonPermiso: { borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: 10 },
    guias: { ...StyleSheet.absoluteFill, margin: '15%' },
    esquina: { position: 'absolute', width: LARGO, height: LARGO, borderColor: '#ffffff' },
    arribaIzquierda: { top: 0, left: 0, borderTopWidth: GROSOR, borderLeftWidth: GROSOR, borderTopLeftRadius: 8 },
    arribaDerecha: { top: 0, right: 0, borderTopWidth: GROSOR, borderRightWidth: GROSOR, borderTopRightRadius: 8 },
    abajoIzquierda: {
        bottom: 0,
        left: 0,
        borderBottomWidth: GROSOR,
        borderLeftWidth: GROSOR,
        borderBottomLeftRadius: 8,
    },
    abajoDerecha: {
        bottom: 0,
        right: 0,
        borderBottomWidth: GROSOR,
        borderRightWidth: GROSOR,
        borderBottomRightRadius: 8,
    },
    validando: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.two,
    },
    centrado: { textAlign: 'center' },
    filaManual: { flexDirection: 'row', gap: Spacing.two },
    input: {
        flex: 1,
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontFamily: 'AtkinsonHyperlegible_400Regular',
        fontSize: 14,
    },
    botonValidar: { minHeight: 44, borderRadius: 8, paddingHorizontal: Spacing.three, justifyContent: 'center' },
    deshabilitado: { opacity: 0.5 },
    resultado: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    textoChico: { fontSize: 12, lineHeight: 16 },
    aviso: { borderRadius: 8, padding: 12, overflow: 'hidden' },
});
