import { isAxiosError } from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mensajeDeError } from '@/api/mensajeDeError';
import { EncabezadoApp } from '@/components/encabezado-app';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { obtenerEvento } from '@/features/eventos/services/evento-service';
import { ConfirmarCancelacionInscripcion } from '@/features/inscripciones/components/confirmar-cancelacion-inscripcion';
import { EntradaQr } from '@/features/inscripciones/components/entrada-qr';
import { useInscripcionEvento } from '@/hooks/eventos/use-inscripcion-evento';
import { useTheme } from '@/hooks/use-theme';
import type { Evento } from '@/types/evento';
import type { Inscripcion } from '@/types/inscripcion';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' });
const formatoDia = new Intl.DateTimeFormat('es-CO', { weekday: 'short' });
const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'short' });

const iniciales = (nombre: string) =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();

export default function DetalleEvento() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const idEvento = Number(id);
    const idValido = Number.isSafeInteger(idEvento) && idEvento > 0;

    const [evento, setEvento] = useState<Evento | null>(null);
    const [cargando, setCargando] = useState(idValido);
    const [error, setError] = useState('');
    const [noEncontrado, setNoEncontrado] = useState(!idValido);
    const [aCancelar, setACancelar] = useState<Inscripcion | null>(null);
    const [entradaAbierta, setEntradaAbierta] = useState(false);
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

    const inscribirse = async () => {
        if (!evento) return;
        const realizada = await inscripcion.inscribir(evento);
        if (realizada) {
            setEvento((actual) =>
                actual ? { ...actual, cuposDisponibles: Math.max(0, actual.cuposDisponibles - 1) } : actual,
            );
        }
    };

    const confirmarCancelacion = async () => {
        const cancelada = await inscripcion.cancelarInscripcionActiva();
        if (cancelada) {
            setACancelar(null);
            setEvento((actual) =>
                actual
                    ? { ...actual, cuposDisponibles: Math.min(actual.cuposMaximos, actual.cuposDisponibles + 1) }
                    : actual,
            );
        }
    };

    const cancelado = evento?.estado.toUpperCase() === 'CANCELADO';
    const agotado = !!evento && evento.cuposDisponibles <= 0;
    const esPropio = evento?.organizadorId === usuario?.usuarioId;
    const fechaInicio = evento ? new Date(evento.fechaInicio) : null;

    let mensajeEstado = '';
    if (cancelado) mensajeEstado = 'Evento cancelado';
    else if (agotado) mensajeEstado = 'Cupos agotados';
    else if (evento && evento.estado.toUpperCase() !== 'PUBLICADO')
        mensajeEstado = 'No se permiten inscripciones en eventos que no estén publicados.';
    else if (esPropio) mensajeEstado = 'No puedes inscribirte en un evento que tú organizas.';

    const botonDeshabilitado = inscripcion.verificando || inscripcion.inscribiendo;
    let textoBoton = 'Inscribirme al evento';
    if (inscripcion.verificando) textoBoton = 'Verificando inscripción…';
    else if (inscripcion.errorVerificacion) textoBoton = 'Reintentar verificación';
    else if (inscripcion.inscribiendo) textoBoton = 'Inscribiendo…';

    const datos = evento && fechaInicio
        ? [
              { icono: { ios: 'calendar', android: 'event', web: 'event' }, etiqueta: 'Fecha', valor: formatoFecha.format(fechaInicio) },
              { icono: { ios: 'clock', android: 'schedule', web: 'schedule' }, etiqueta: 'Hora', valor: formatoHora.format(fechaInicio) },
              { icono: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }, etiqueta: 'Lugar', valor: evento.ubicacion },
              {
                  icono: { ios: 'person.2', android: 'group', web: 'group' },
                  etiqueta: 'Cupos',
                  valor: `${evento.cuposDisponibles} de ${evento.cuposMaximos} disponibles`,
              },
          ] as const
        : [];

    return (
        <ThemedView style={styles.flex}>
            <EncabezadoApp />
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.desplazable}>
                {cargando && (
                    <SkeletonEstado etiqueta="Cargando evento" style={styles.bloques}>
                        <Skeleton style={{ height: 120, width: '100%', borderRadius: 0 }} />
                        <View style={styles.contenido}>
                            <Skeleton style={{ height: 20, width: 90 }} />
                            <Skeleton style={{ height: 28, width: '80%' }} />
                            <Skeleton style={{ height: 56, width: '100%' }} />
                            <Skeleton style={{ height: 56, width: '100%' }} />
                        </View>
                    </SkeletonEstado>
                )}

                {!cargando && (noEncontrado || !!error) && (
                    <View style={styles.vacio}>
                        {noEncontrado ? (
                            <>
                                <ThemedText type="smallBold" style={styles.titulo}>
                                    Evento no encontrado
                                </ThemedText>
                                <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                                    Es posible que el evento ya no exista o que el enlace no sea correcto.
                                </ThemedText>
                            </>
                        ) : (
                            <ThemedText type="small" themeColor="error" accessibilityRole="alert" style={styles.centrado}>
                                {error}
                            </ThemedText>
                        )}
                        <Pressable
                            accessibilityRole="button"
                            onPress={volver}
                            style={[styles.boton, styles.botonVolver, { backgroundColor: theme.primary }]}>
                            <ThemedText type="smallBold" themeColor="onPrimary">
                                Volver a eventos
                            </ThemedText>
                        </Pressable>
                    </View>
                )}

                {!cargando && !!evento && !!fechaInicio && (
                    <>
                        <LinearGradient
                            colors={[theme.bannerInicio, theme.bannerFin]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.banner}>
                            <View
                                accessible
                                accessibilityLabel={formatoFecha.format(fechaInicio)}
                                style={[styles.fechaTarjeta, { backgroundColor: theme.surface }]}>
                                <ThemedText type="smallBold" themeColor="primary" style={styles.fechaDia}>
                                    {formatoDia.format(fechaInicio).replace('.', '').toUpperCase()}
                                </ThemedText>
                                <ThemedText type="smallBold" style={styles.fechaNumero}>
                                    {fechaInicio.getDate()}
                                </ThemedText>
                                <ThemedText type="small" themeColor="textSecondary" style={styles.fechaDia}>
                                    {formatoMes.format(fechaInicio).replace('.', '').toUpperCase()}
                                </ThemedText>
                            </View>
                        </LinearGradient>

                        <View style={styles.contenido}>
                            <Pressable accessibilityRole="link" hitSlop={12} onPress={volver} style={styles.volver}>
                                <SymbolView
                                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                                    size={18}
                                    tintColor={theme.primary}
                                />
                                <ThemedText type="smallBold" themeColor="primary" style={styles.textoVolver}>
                                    Volver a eventos
                                </ThemedText>
                            </Pressable>

                            {inscripcion.inscripcionRealizada && (
                                <View
                                    accessibilityRole="alert"
                                    accessibilityLiveRegion="polite"
                                    style={[styles.aviso, { backgroundColor: theme.successBackground, borderColor: theme.success }]}>
                                    <IconoAviso tipo="exito" style={styles.iconoAviso} />
                                    <ThemedText type="small" themeColor="success" style={styles.flex}>
                                        Inscripción realizada: ya tienes una entrada para {evento.titulo}.
                                    </ThemedText>
                                </View>
                            )}

                            <View style={styles.chips}>
                                <ThemedText
                                    type="small"
                                    style={[styles.chip, { backgroundColor: theme.categoryBackground, color: theme.category }]}>
                                    {evento.categoriaNombre}
                                </ThemedText>
                                {evento.certificable && (
                                    <View style={[styles.chipIcono, { backgroundColor: theme.certificadoBackground }]}>
                                        <SymbolView
                                            name={{ ios: 'rosette', android: 'workspace_premium', web: 'workspace_premium' }}
                                            size={12}
                                            tintColor={theme.certificado}
                                        />
                                        <ThemedText type="small" style={[styles.textoChip, { color: theme.certificado }]}>
                                            Con certificado
                                        </ThemedText>
                                    </View>
                                )}
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

                            <ThemedText type="smallBold" accessibilityRole="header" style={styles.titulo}>
                                {evento.titulo}
                            </ThemedText>

                            <View style={styles.bloques}>
                                {datos.map(({ icono, etiqueta, valor }) => (
                                    <View
                                        key={etiqueta}
                                        style={[styles.dato, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <View style={[styles.iconoDato, { backgroundColor: theme.softRedBackground }]}>
                                            <SymbolView name={icono} size={16} tintColor={theme.primary} />
                                        </View>
                                        <View style={styles.flex}>
                                            <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                                {etiqueta}
                                            </ThemedText>
                                            <ThemedText type="smallBold">{valor}</ThemedText>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.seccion}>
                                <ThemedText type="smallBold" style={styles.subtitulo}>
                                    Sobre el evento
                                </ThemedText>
                                <ThemedText type="small" themeColor="textSecondary">
                                    {evento.descripcion}
                                </ThemedText>
                            </View>

                            <View style={[styles.organizador, { borderTopColor: theme.border }]}>
                                <View style={[styles.avatar, { backgroundColor: theme.softRedBackground }]}>
                                    <ThemedText type="smallBold" themeColor="primary" style={styles.textoChico}>
                                        {iniciales(evento.organizadorNombre)}
                                    </ThemedText>
                                </View>
                                <View>
                                    <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                        Organiza
                                    </ThemedText>
                                    <ThemedText type="smallBold">{evento.organizadorNombre}</ThemedText>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Barra fija con la inscripción, como en el diseño móvil */}
            {!cargando && !!evento && (
                <View
                    style={[
                        styles.barra,
                        { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Spacing.two + insets.bottom },
                    ]}>
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

                    {esPropio ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push(`/inscritos/${evento.id}`)}
                            style={[styles.boton, styles.botonIcono, { backgroundColor: theme.primary }]}>
                            <SymbolView
                                name={{ ios: 'person.2', android: 'group', web: 'group' }}
                                size={18}
                                tintColor={theme.onPrimary}
                            />
                            <ThemedText type="smallBold" themeColor="onPrimary">
                                Inscritos y asistencia
                            </ThemedText>
                        </Pressable>
                    ) : inscripcion.yaInscrito ? (
                        <View style={styles.filaBarra}>
                            <View style={styles.inscrito}>
                                <SymbolView
                                    name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
                                    size={18}
                                    tintColor={theme.success}
                                />
                                <ThemedText type="smallBold" themeColor="success">
                                    Estás inscrito
                                </ThemedText>
                            </View>
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setEntradaAbierta(true)}
                                style={[styles.verEntrada, { backgroundColor: theme.text }]}>
                                <SymbolView
                                    name={{ ios: 'qrcode', android: 'qr_code_2', web: 'qr_code_2' }}
                                    size={16}
                                    tintColor={theme.surface}
                                />
                                <ThemedText type="smallBold" style={{ color: theme.surface }}>
                                    Ver mi entrada
                                </ThemedText>
                            </Pressable>
                        </View>
                    ) : mensajeEstado ? (
                        <View style={[styles.boton, { backgroundColor: theme.disabledButton }]}>
                            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.centrado}>
                                {mensajeEstado}
                            </ThemedText>
                        </View>
                    ) : (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ disabled: botonDeshabilitado, busy: inscripcion.inscribiendo }}
                            disabled={botonDeshabilitado}
                            onPress={inscripcion.errorVerificacion ? inscripcion.reintentarVerificacion : inscribirse}
                            style={[
                                styles.boton,
                                { backgroundColor: botonDeshabilitado ? theme.disabledButton : theme.primary },
                            ]}>
                            <ThemedText type="smallBold" themeColor={botonDeshabilitado ? 'textSecondary' : 'onPrimary'}>
                                {textoBoton}
                            </ThemedText>
                        </Pressable>
                    )}
                </View>
            )}

            {entradaAbierta && inscripcion.inscripcionActiva && (
                <EntradaQr
                    inscripcion={inscripcion.inscripcionActiva}
                    onCerrar={() => setEntradaAbierta(false)}
                    onCancelar={() => {
                        setEntradaAbierta(false);
                        setACancelar(inscripcion.inscripcionActiva);
                    }}
                />
            )}

            {aCancelar && (
                <ConfirmarCancelacionInscripcion
                    inscripcion={aCancelar}
                    cancelando={inscripcion.cancelando}
                    error={inscripcion.errorCancelacion}
                    onCerrar={() => {
                        if (!inscripcion.cancelando) setACancelar(null);
                    }}
                    onConfirmar={confirmarCancelacion}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    desplazable: { paddingBottom: Spacing.four },
    contenido: { padding: Spacing.three, gap: Spacing.three },
    bloques: { gap: Spacing.two },
    vacio: { alignItems: 'center', gap: 12, padding: Spacing.three, paddingVertical: Spacing.five },
    centrado: { textAlign: 'center' },
    banner: { height: 120, justifyContent: 'flex-end', padding: Spacing.three },
    fechaTarjeta: {
        width: 52,
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 6,
    },
    fechaDia: { fontSize: 10, lineHeight: 12 },
    fechaNumero: { fontSize: 22, lineHeight: 26 },
    volver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, alignSelf: 'flex-start' },
    textoVolver: { fontSize: 16, lineHeight: 24 },
    aviso: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.two,
        borderWidth: 1,
        borderRadius: 6,
        padding: Spacing.two,
    },
    iconoAviso: { marginTop: 2 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    chip: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    chipIcono: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    textoChip: { fontSize: 12, lineHeight: 16 },
    titulo: { fontSize: 22, lineHeight: 28 },
    dato: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    iconoDato: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    textoChico: { fontSize: 12, lineHeight: 16 },
    seccion: { gap: Spacing.one },
    subtitulo: { fontSize: 16, lineHeight: 24 },
    organizador: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, paddingTop: Spacing.three },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    barra: { gap: Spacing.two, borderTopWidth: 1, paddingHorizontal: Spacing.three, paddingTop: 12 },
    filaBarra: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
    inscrito: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    verEntrada: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 8,
        paddingHorizontal: Spacing.three,
    },
    boton: {
        minHeight: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.three,
    },
    botonVolver: { alignSelf: 'center' },
    botonIcono: { flexDirection: 'row', gap: Spacing.two },
});
