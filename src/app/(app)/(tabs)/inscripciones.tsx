import { useRef, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EncabezadoApp } from '@/components/encabezado-app';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { EspacioFinalPestanas, Spacing } from '@/constants/theme';
import { CalendarioInscripciones } from '@/features/inscripciones/components/calendario-inscripciones';
import { ConfirmarCancelacionInscripcion } from '@/features/inscripciones/components/confirmar-cancelacion-inscripcion';
import { useMisInscripciones, type FiltroInscripcion } from '@/hooks/inscripciones/use-mis-inscripciones';
import { useTheme } from '@/hooks/use-theme';

const filtros: { valor: FiltroInscripcion; etiqueta: string }[] = [
    { valor: 'TODAS', etiqueta: 'Todas' },
    { valor: 'ACTIVA', etiqueta: 'Activas' },
    { valor: 'CANCELADA', etiqueta: 'Canceladas' },
];

export default function MisInscripciones() {
    const misInscripciones = useMisInscripciones();
    const theme = useTheme();
    const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

    return (
        <ThemedView style={styles.flex}>
            <EncabezadoApp />
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={[styles.contenido, { paddingBottom: EspacioFinalPestanas }]}>
                <ThemedText type="smallBold" accessibilityRole="header" style={styles.titulo}>
                    Mis inscripciones
                </ThemedText>
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
                {!!misInscripciones.mensajeExito && (
                    <View
                        accessibilityRole="alert"
                        style={[styles.mensaje, { backgroundColor: theme.successBackground, borderColor: theme.success }]}>
                        <IconoAviso tipo="exito" style={styles.iconoMensaje} />
                        <ThemedText type="small" themeColor="success" style={styles.flex}>
                            {misInscripciones.mensajeExito}
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
                                style={[styles.tarjetaCarga, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Skeleton style={{ height: 20, width: '70%' }} />
                                <Skeleton style={{ height: 16, width: '45%' }} />
                            </View>
                        ))}
                    </SkeletonEstado>
                )}

                {!misInscripciones.cargando && !misInscripciones.error && (
                    <CalendarioInscripciones
                        inscripciones={misInscripciones.inscripciones}
                        onCancelar={misInscripciones.solicitarCancelacion}
                        scrollRef={scrollRef}
                    />
                )}
            </ScrollView>
            {misInscripciones.aCancelar && (
                <ConfirmarCancelacionInscripcion
                    inscripcion={misInscripciones.aCancelar}
                    cancelando={misInscripciones.cancelando}
                    error={misInscripciones.errorCancelacion}
                    onCerrar={misInscripciones.cerrarConfirmacion}
                    onConfirmar={misInscripciones.confirmarCancelacion}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    titulo: { fontSize: 22, lineHeight: 30 },
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
    tarjetaCarga: { gap: Spacing.four, borderWidth: 1, borderRadius: 8, padding: 12 },
});
