import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mensajeDeError } from '@/api/mensajeDeError';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { ConfirmacionInscripcion } from '@/features/eventos/components/confirmacion-inscripcion';
import { obtenerEvento } from '@/features/eventos/services/evento-service';
import { useInscripcionEvento } from '@/hooks/eventos/use-inscripcion-evento';
import { useTheme } from '@/hooks/use-theme';
import type { Evento } from '@/types/evento';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const formatoHora = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
});

export default function DetalleEvento() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const idEvento = Number(id);
    const idValido = Number.isSafeInteger(idEvento) && idEvento > 0;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [cargando, setCargando] = useState(idValido);
    const [error, setError] = useState('');
    const [noEncontrado, setNoEncontrado] = useState(!idValido);
    const { usuario } = useAuth();
    const inscripcion = useInscripcionEvento(idEvento, idValido);

    useEffect(() => {
        if (!idValido) return;
        obtenerEvento(idEvento)
            .then((datos) => setEvento(datos))
            .catch((err) => {
                // si el backend responde 404 se muestra la pantalla de no encontrado
                if (isAxiosError(err) && err.response?.status === 404) {
                    setNoEncontrado(true);
                } else {
                    setError(mensajeDeError(err));
                }
            })
            .finally(() => setCargando(false));
    }, [idEvento, idValido]);

    const volver = () => (router.canGoBack() ? router.back() : router.replace('/eventos'));

    const cancelado = evento?.estado === 'CANCELADO';
    const agotado = !!evento && evento.cuposDisponibles <= 0;
    const esPropio = evento?.organizadorId === usuario?.usuarioId;
    const inscritos = evento
        ? Math.min(evento.cuposMaximos, Math.max(0, evento.cuposMaximos - evento.cuposDisponibles))
        : 0;
    const porcentajeOcupado = evento && evento.cuposMaximos > 0 ? (inscritos / evento.cuposMaximos) * 100 : 0;

    let mensajeEstado = '';
    if (cancelado) mensajeEstado = 'Evento cancelado';
    else if (agotado) mensajeEstado = 'Cupos agotados';
    else if (evento && evento.estado !== 'PUBLICADO')
        mensajeEstado = 'No se permiten inscripciones en eventos que no estén publicados.';
    else if (esPropio) mensajeEstado = 'No puedes inscribirte en un evento que tú organizas.';

    const botonDeshabilitado = inscripcion.verificando || inscripcion.yaInscrito || inscripcion.inscribiendo;
    let textoBoton = 'Inscribirme al evento';
    if (inscripcion.verificando) textoBoton = 'Verificando inscripción…';
    else if (inscripcion.errorVerificacion) textoBoton = 'Reintentar verificación';
    else if (inscripcion.yaInscrito) textoBoton = 'Ya estás inscrito';
    else if (inscripcion.inscribiendo) textoBoton = 'Inscribiendo…';

    if (inscripcion.inscripcionRealizada && evento) return <ConfirmacionInscripcion evento={evento} />;

    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
                <View style={[styles.encabezado, { borderBottomColor: theme.border }]}>
                    <Pressable accessibilityRole="link" hitSlop={12} onPress={volver}>
                        <ThemedText type="smallBold" themeColor="primary">
                            ← Volver a eventos
                        </ThemedText>
                    </Pressable>
                </View>
            </SafeAreaView>
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.contenido}>
                {cargando && (
                    <SkeletonEstado etiqueta="Cargando evento" style={styles.bloques}>
                        <Skeleton style={{ height: 20, width: 90 }} />
                        <Skeleton style={{ height: 28, width: '80%' }} />
                        <Skeleton style={{ height: 60, width: '100%' }} />
                        <Skeleton style={{ height: 20, width: '60%' }} />
                        <Skeleton style={{ height: 20, width: '50%' }} />
                        <Skeleton style={{ height: 20, width: '70%' }} />
                    </SkeletonEstado>
                )}

                {!cargando && noEncontrado && (
                    <View style={styles.vacio}>
                        <ThemedText type="smallBold" style={styles.titulo}>
                            Evento no encontrado
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                            Es posible que el evento ya no exista o que el enlace no sea correcto.
                        </ThemedText>
                        <Pressable
                            accessibilityRole="button"
                            onPress={volver}
                            style={[styles.boton, { backgroundColor: theme.primary }]}>
                            <ThemedText type="smallBold" themeColor="onPrimary">
                                Volver a eventos
                            </ThemedText>
                        </Pressable>
                    </View>
                )}

                {!cargando && !noEncontrado && !!error && (
                    <View style={styles.vacio}>
                        <ThemedText type="small" themeColor="error" accessibilityRole="alert" style={styles.centrado}>
                            {error}
                        </ThemedText>
                        <Pressable
                            accessibilityRole="button"
                            onPress={volver}
                            style={[styles.boton, { backgroundColor: theme.primary }]}>
                            <ThemedText type="smallBold" themeColor="onPrimary">
                                Volver a eventos
                            </ThemedText>
                        </Pressable>
                    </View>
                )}

                {!cargando && !!evento && (
                    <View style={styles.bloques}>
                        <View style={styles.chips}>
                            <ThemedText
                                type="small"
                                style={[styles.chip, { backgroundColor: theme.softRedBackground, color: theme.primary }]}>
                                {evento.categoriaNombre}
                            </ThemedText>
                            {cancelado && (
                                <ThemedText
                                    type="small"
                                    style={[styles.chip, { backgroundColor: theme.disabledButton, color: theme.text }]}>
                                    Evento cancelado
                                </ThemedText>
                            )}
                            {!cancelado && agotado && (
                                <ThemedText
                                    type="small"
                                    style={[styles.chip, { backgroundColor: theme.agotadoBackground, color: theme.agotado }]}>
                                    Cupos agotados
                                </ThemedText>
                            )}
                        </View>

                        <ThemedText type="smallBold" style={styles.titulo}>
                            {evento.titulo}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                            {evento.descripcion}
                        </ThemedText>

                        <View style={[styles.separador, { backgroundColor: theme.border }]} />

                        <View style={styles.fila}>
                            <SymbolView
                                name={{ ios: 'calendar', android: 'event', web: 'event' }}
                                size={16}
                                tintColor={theme.textSecondary}
                            />
                            <ThemedText type="small">{formatoFecha.format(new Date(evento.fechaInicio))}</ThemedText>
                        </View>
                        <View style={styles.fila}>
                            <SymbolView
                                name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                                size={16}
                                tintColor={theme.textSecondary}
                            />
                            <ThemedText type="small">{formatoHora.format(new Date(evento.fechaInicio))}</ThemedText>
                        </View>
                        <View style={styles.fila}>
                            <SymbolView
                                name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
                                size={16}
                                tintColor={theme.textSecondary}
                            />
                            <ThemedText type="small">{evento.ubicacion}</ThemedText>
                        </View>
                        <View style={styles.fila}>
                            <SymbolView
                                name={{ ios: 'person.2', android: 'group', web: 'group' }}
                                size={16}
                                tintColor={theme.textSecondary}
                            />
                            <ThemedText type="small">
                                {inscritos} inscritos de {evento.cuposMaximos} cupos
                            </ThemedText>
                        </View>

                        <View
                            accessibilityRole="progressbar"
                            accessibilityLabel="Cupos ocupados"
                            accessibilityValue={{ min: 0, max: evento.cuposMaximos, now: inscritos }}
                            style={[styles.cupos, { backgroundColor: theme.border }]}>
                            <View
                                style={[
                                    styles.cuposOcupados,
                                    { width: `${porcentajeOcupado}%`, backgroundColor: theme.primary },
                                ]}
                            />
                        </View>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                            {evento.cuposDisponibles} cupos disponibles
                        </ThemedText>

                        <View style={[styles.organizador, { borderTopColor: theme.border }]}>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                Organiza
                            </ThemedText>
                            <ThemedText type="smallBold">{evento.organizadorNombre}</ThemedText>
                        </View>

                        {/* Estado del evento cuando no se puede inscribir */}
                        {!!mensajeEstado && (
                            <View style={[styles.estado, { backgroundColor: theme.disabledButton }]}>
                                <ThemedText type="smallBold" themeColor="textSecondary" style={styles.centrado}>
                                    {mensajeEstado}
                                </ThemedText>
                            </View>
                        )}
                        {!mensajeEstado && (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ disabled: botonDeshabilitado, busy: inscripcion.inscribiendo }}
                                disabled={botonDeshabilitado}
                                onPress={
                                    inscripcion.errorVerificacion ? inscripcion.reintentarVerificacion : inscripcion.inscribir
                                }
                                style={[
                                    styles.estado,
                                    { backgroundColor: botonDeshabilitado ? theme.disabledButton : theme.primary },
                                ]}>
                                <ThemedText
                                    type="smallBold"
                                    themeColor={botonDeshabilitado ? 'textSecondary' : 'onPrimary'}
                                    style={styles.centrado}>
                                    {textoBoton}
                                </ThemedText>
                            </Pressable>
                        )}
                        {!!inscripcion.errorVerificacion && (
                            <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                                No se pudo verificar si ya estás inscrito: {inscripcion.errorVerificacion}
                            </ThemedText>
                        )}
                        {!!inscripcion.error && (
                            <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                                {inscripcion.error}
                            </ThemedText>
                        )}
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    encabezado: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingHorizontal: Spacing.three,
    },
    contenido: { padding: Spacing.three },
    bloques: { gap: 12 },
    vacio: { alignItems: 'center', gap: 12, paddingVertical: Spacing.five },
    centrado: { textAlign: 'center' },
    boton: {
        minHeight: 44,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.four,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    chip: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    titulo: { fontSize: 22, lineHeight: 28 },
    separador: { height: 1 },
    fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    cupos: { height: 4, borderRadius: 9999, overflow: 'hidden' },
    cuposOcupados: { height: '100%' },
    textoChico: { fontSize: 12, lineHeight: 16 },
    organizador: { borderTopWidth: 1, paddingTop: 12, gap: Spacing.half },
    estado: {
        minHeight: 44,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.two,
        marginTop: Spacing.two,
    },
});
