import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useMisInscripciones, type FiltroInscripcion } from '@/hooks/inscripciones/use-mis-inscripciones';
import { useTheme } from '@/hooks/use-theme';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});
const formatoHora = new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
});

const filtros: { valor: FiltroInscripcion; etiqueta: string }[] = [
    { valor: 'TODAS', etiqueta: 'Todas' },
    { valor: 'ACTIVA', etiqueta: 'Activas' },
    { valor: 'CANCELADA', etiqueta: 'Canceladas' },
];

export default function MisInscripciones() {
    const misInscripciones = useMisInscripciones();
    const theme = useTheme();

    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
                <View style={[styles.encabezado, { borderBottomColor: theme.border }]}>
                    <ThemedText type="smallBold" style={styles.titulo}>
                        Mis inscripciones
                    </ThemedText>
                </View>
            </SafeAreaView>
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.contenido}>
                {!!misInscripciones.error && (
                    <View
                        accessibilityRole="alert"
                        style={[
                            styles.mensaje,
                            { backgroundColor: theme.errorBackground, borderColor: theme.softRedBackground },
                        ]}>
                        <IconoAviso tipo="error" style={styles.iconoMensaje} />
                        <ThemedText type="small" themeColor="error" style={styles.flex}>
                            {misInscripciones.error}
                        </ThemedText>
                    </View>
                )}

                <View style={styles.filtros} accessibilityLabel="Filtrar inscripciones">
                    {filtros.map(({ valor, etiqueta }) => (
                        <Pressable
                            key={valor}
                            accessibilityRole="button"
                            accessibilityState={{ selected: misInscripciones.filtro === valor }}
                            hitSlop={6}
                            onPress={() => misInscripciones.setFiltro(valor)}
                            style={[
                                styles.filtro,
                                misInscripciones.filtro === valor
                                    ? { backgroundColor: theme.text, borderColor: theme.text }
                                    : { backgroundColor: theme.surface, borderColor: theme.border },
                            ]}>
                            <ThemedText
                                type="small"
                                style={[
                                    styles.textoFiltro,
                                    { color: misInscripciones.filtro === valor ? theme.surface : theme.textSecondary },
                                ]}>
                                {etiqueta} ({misInscripciones.conteos[valor]})
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>

                {misInscripciones.cargando && (
                    <SkeletonEstado etiqueta="Cargando tus inscripciones" style={styles.lista}>
                        {Array.from({ length: 3 }, (_, indice) => (
                            <View
                                key={indice}
                                style={[styles.tarjeta, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Skeleton style={{ height: 20, width: '70%' }} />
                                <Skeleton style={{ height: 16, width: '45%' }} />
                            </View>
                        ))}
                    </SkeletonEstado>
                )}

                {!misInscripciones.cargando &&
                    !misInscripciones.error &&
                    misInscripciones.inscripciones.length === 0 && (
                        <ThemedText type="small" themeColor="textSecondary">
                            {misInscripciones.filtro === 'TODAS'
                                ? 'Aún no tienes inscripciones a eventos.'
                                : `No tienes inscripciones ${misInscripciones.filtro === 'ACTIVA' ? 'activas' : 'canceladas'}.`}
                        </ThemedText>
                    )}

                {!misInscripciones.cargando &&
                    !misInscripciones.error &&
                    misInscripciones.inscripciones.length > 0 && (
                        <View style={styles.lista}>
                            {misInscripciones.inscripciones.map((inscripcion) => {
                                const fecha = new Date(inscripcion.eventoFechaInicio);
                                const activa = inscripcion.estado === 'ACTIVA';

                                return (
                                    <View
                                        key={inscripcion.id}
                                        style={[
                                            styles.tarjeta,
                                            { backgroundColor: theme.surface, borderColor: theme.border },
                                        ]}>
                                        <View style={styles.filaTitulo}>
                                            <ThemedText type="smallBold" style={styles.evento}>
                                                {inscripcion.eventoTitulo}
                                            </ThemedText>
                                            <ThemedText
                                                type="small"
                                                style={[
                                                    styles.estado,
                                                    activa
                                                        ? { backgroundColor: theme.successBackground, color: theme.success }
                                                        : {
                                                              backgroundColor: theme.disabledButton,
                                                              color: theme.textSecondary,
                                                          },
                                                ]}>
                                                {activa ? 'Inscripción activa' : 'Cancelada'}
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="small" themeColor="textSecondary" style={styles.fecha}>
                                            {formatoFecha.format(fecha)}, {formatoHora.format(fecha)}
                                        </ThemedText>
                                    </View>
                                );
                            })}
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
    titulo: { fontSize: 18, lineHeight: 26 },
    contenido: { padding: Spacing.three, gap: 12 },
    mensaje: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.two,
        borderWidth: 1,
        borderRadius: 4,
        padding: Spacing.two,
    },
    iconoMensaje: { marginTop: 2 },
    filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    filtro: {
        minHeight: 32,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 12,
    },
    textoFiltro: { fontSize: 12, lineHeight: 16 },
    lista: { gap: 12 },
    tarjeta: { gap: Spacing.four, borderWidth: 1, borderRadius: 8, padding: 12 },
    filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
    evento: { flex: 1, fontSize: 15, lineHeight: 22 },
    estado: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    fecha: { fontSize: 12, lineHeight: 16 },
});
