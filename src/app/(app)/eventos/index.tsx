import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EncabezadoApp } from '@/components/encabezado-app';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { FiltrosEventos } from '@/features/eventos/components/filtros-eventos';
import { TarjetaEvento } from '@/features/eventos/components/tarjeta-evento';
import { ordenarEventos, type OrdenEventos } from '@/features/eventos/evento-ordenamiento';
import { useCatalogoEventos } from '@/hooks/eventos/use-catalogo-eventos';
import { useTheme } from '@/hooks/use-theme';

export default function CatalogoEventos() {
    const catalogo = useCatalogoEventos();
    const theme = useTheme();
    const [orden, setOrden] = useState<OrdenEventos>('fecha-proxima');
    const eventosOrdenados = ordenarEventos(catalogo.eventos, orden);

    return (
        <ThemedView style={styles.flex}>
            <EncabezadoApp />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.catalogo}>
                <ThemedText type="smallBold" accessibilityRole="header" style={styles.tituloPagina}>
                    Eventos en campus
                </ThemedText>
                {!!catalogo.errorCategorias && (
                    <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                        {catalogo.errorCategorias}
                    </ThemedText>
                )}
                <FiltrosEventos
                    categorias={catalogo.categorias}
                    cantidadEventos={eventosOrdenados.length}
                    filtros={catalogo.filtros}
                    mostrarResumen={!catalogo.cargando && !catalogo.errorEventos && !catalogo.rangoFechasInvalido}
                    onChange={catalogo.setFiltros}
                    orden={orden}
                    onOrdenChange={setOrden}
                />
                {!!catalogo.errorEventos && (
                    <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                        {catalogo.errorEventos}
                    </ThemedText>
                )}
                {catalogo.cargando && (
                    <SkeletonEstado etiqueta="Cargando eventos" style={styles.lista}>
                        {Array.from({ length: 3 }, (_, indice) => (
                            <View
                                key={indice}
                                style={[styles.tarjetaCarga, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Skeleton style={{ height: 16, width: 80 }} />
                                <Skeleton style={{ height: 20, width: '75%' }} />
                                <Skeleton style={{ height: 16, width: '100%' }} />
                            </View>
                        ))}
                    </SkeletonEstado>
                )}
                {!catalogo.cargando &&
                    !catalogo.errorEventos &&
                    !catalogo.rangoFechasInvalido &&
                    catalogo.eventos.length === 0 && (
                        <ThemedText type="small" themeColor="textSecondary">
                            {catalogo.hayFiltrosActivos
                                ? 'No se encontraron eventos con esos filtros.'
                                : 'No hay eventos disponibles por ahora.'}
                        </ThemedText>
                    )}
                {!catalogo.cargando &&
                    !catalogo.errorEventos &&
                    !catalogo.rangoFechasInvalido &&
                    eventosOrdenados.length > 0 && (
                        <View style={styles.lista}>
                            {eventosOrdenados.map((evento) => (
                                <TarjetaEvento key={evento.id} evento={evento}>
                                    <Link href={`/eventos/${evento.id}`} asChild>
                                        <Pressable
                                            accessibilityRole="link"
                                            accessibilityLabel={`Ver detalle de ${evento.titulo}`}
                                            hitSlop={4}
                                            style={StyleSheet.flatten([styles.detalle, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }])}>
                                            <ThemedText type="smallBold">Ver detalle</ThemedText>
                                        </Pressable>
                                    </Link>
                                </TarjetaEvento>
                            ))}
                        </View>
                    )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    catalogo: { padding: Spacing.three, gap: 12 },
    tituloPagina: { fontSize: 22, lineHeight: 30 },
    lista: { gap: 12 },
    tarjetaCarga: { gap: Spacing.two, borderWidth: 1, borderRadius: 8, padding: Spacing.three },
    detalle: {
        minHeight: 36,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
});
