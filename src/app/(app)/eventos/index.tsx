import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useCatalogoEventos } from '@/hooks/eventos/use-catalogo-eventos';
import { useTheme } from '@/hooks/use-theme';
import type { Evento } from '@/types/evento';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const cuposOcupadosPorcentaje = (evento: Evento): number => {
    if (evento.cuposMaximos <= 0) return 0;
    return Math.max(
        0,
        Math.min(100, ((evento.cuposMaximos - evento.cuposDisponibles) / evento.cuposMaximos) * 100),
    );
};

export default function CatalogoEventos() {
    const catalogo = useCatalogoEventos();
    const theme = useTheme();

    const categoriaEstilo = (nombre: string) => {
        const normalizado = nombre.toLocaleLowerCase('es-CO');
        if (normalizado.includes('cultur')) {
            return { backgroundColor: theme.culturalPurpleBackground, color: theme.culturalPurple };
        }
        if (normalizado.includes('deport')) {
            return { backgroundColor: theme.deportiveOrangeBackground, color: theme.deportiveOrange };
        }
        return { backgroundColor: theme.softRedBackground, color: theme.primary };
    };

    return (
        <ThemedView style={styles.flex}>
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.catalogo}>
                {!!catalogo.errorCategorias && (
                    <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                        {catalogo.errorCategorias}
                    </ThemedText>
                )}
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
                                style={[styles.tarjeta, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
                    catalogo.eventos.length > 0 && (
                        <View style={styles.lista}>
                            {catalogo.eventos.map((evento) => (
                                <View
                                    key={evento.id}
                                    style={[styles.tarjeta, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <ThemedText
                                        type="small"
                                        style={[styles.categoria, categoriaEstilo(evento.categoriaNombre)]}>
                                        {evento.categoriaNombre}
                                    </ThemedText>
                                    <ThemedText type="smallBold" style={styles.titulo}>
                                        {evento.titulo}
                                    </ThemedText>
                                    <View>
                                        <ThemedText type="small" themeColor="textSecondary">
                                            {formatoFecha.format(new Date(evento.fechaInicio))}
                                        </ThemedText>
                                        <ThemedText type="small" themeColor="textSecondary">
                                            {evento.ubicacion}
                                        </ThemedText>
                                    </View>
                                    <View
                                        accessibilityRole="progressbar"
                                        accessibilityLabel="Cupos ocupados"
                                        accessibilityValue={{
                                            min: 0,
                                            max: evento.cuposMaximos,
                                            now: evento.cuposMaximos - evento.cuposDisponibles,
                                        }}
                                        style={[styles.cupos, { backgroundColor: theme.border }]}>
                                        <View
                                            style={[
                                                styles.cuposOcupados,
                                                {
                                                    width: `${cuposOcupadosPorcentaje(evento)}%`,
                                                    backgroundColor: theme.primary,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <ThemedText type="small" themeColor="textSecondary">
                                        {evento.cuposDisponibles} cupos disponibles de {evento.cuposMaximos}
                                    </ThemedText>
                                </View>
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
    lista: { gap: 12 },
    tarjeta: { gap: Spacing.two, borderWidth: 1, borderRadius: 8, padding: 12 },
    categoria: {
        alignSelf: 'flex-start',
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    titulo: { fontSize: 16, lineHeight: 24 },
    cupos: { height: 4, borderRadius: 9999, overflow: 'hidden' },
    cuposOcupados: { height: '100%' },
});
