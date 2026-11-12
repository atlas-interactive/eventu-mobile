import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/types/categoria';
import type { FiltrosEvento } from '@/types/evento';

interface ResumenEventosProps {
    cantidadEventos: number;
    categorias: Categoria[];
    filtros: FiltrosEvento;
    onChange: (filtros: FiltrosEvento) => void;
    onLimpiar: () => void;
}

interface FiltroActivo {
    id: string;
    etiqueta: string;
    quitar: () => void;
}

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });

const aFechaLocal = (fecha: string): Date => {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
};

const formatoRangoFechas = (desde?: string, hasta?: string): string => {
    if (desde && hasta) {
        const fechaDesde = aFechaLocal(desde);
        const fechaHasta = aFechaLocal(hasta);
        if (
            fechaDesde.getFullYear() === fechaHasta.getFullYear() &&
            fechaDesde.getMonth() === fechaHasta.getMonth()
        ) {
            return `${fechaDesde.getDate()}–${formatoFecha.format(fechaHasta)}`;
        }
        return `${formatoFecha.format(fechaDesde)} – ${formatoFecha.format(fechaHasta)}`;
    }

    if (desde) return `Desde ${formatoFecha.format(aFechaLocal(desde))}`;
    if (hasta) return `Hasta ${formatoFecha.format(aFechaLocal(hasta))}`;
    return '';
};

export function ResumenEventos({ cantidadEventos, categorias, filtros, onChange, onLimpiar }: ResumenEventosProps) {
    const theme = useTheme();
    const categoria = categorias.find(({ id }) => id === filtros.categoriaId);
    const filtrosActivos: FiltroActivo[] = [];

    if (filtros.texto?.trim()) {
        filtrosActivos.push({
            id: 'texto',
            etiqueta: `“${filtros.texto.trim()}”`,
            quitar: () => onChange({ ...filtros, texto: undefined }),
        });
    }
    if (filtros.categoriaId !== undefined) {
        filtrosActivos.push({
            id: 'categoria',
            etiqueta: categoria?.nombre ?? 'Categoría',
            quitar: () => onChange({ ...filtros, categoriaId: undefined }),
        });
    }
    if (filtros.fechaDesde || filtros.fechaHasta) {
        filtrosActivos.push({
            id: 'fecha',
            etiqueta: formatoRangoFechas(filtros.fechaDesde, filtros.fechaHasta),
            quitar: () => onChange({ ...filtros, fechaDesde: undefined, fechaHasta: undefined }),
        });
    }

    return (
        <View style={styles.resumen} accessibilityLabel="Resumen de eventos">
            <View style={styles.cabecera}>
                <ThemedText type="small" accessibilityLiveRegion="polite" style={styles.flex}>
                    <ThemedText type="smallBold">
                        {cantidadEventos} {cantidadEventos === 1 ? 'evento' : 'eventos'}
                    </ThemedText>
                    {filtrosActivos.length > 0 && (
                        <ThemedText type="small" themeColor="textSecondary">
                            {' '}coinciden con
                        </ThemedText>
                    )}
                </ThemedText>
                {filtrosActivos.length > 0 && (
                    <Pressable accessibilityRole="button" hitSlop={8} onPress={onLimpiar} style={styles.limpiar}>
                        <SymbolView
                            name={{ ios: 'arrow.counterclockwise', android: 'restart_alt', web: 'restart_alt' }}
                            size={14}
                            tintColor={theme.primary}
                        />
                        <ThemedText type="smallBold" themeColor="primary">
                            Limpiar filtros
                        </ThemedText>
                    </Pressable>
                )}
            </View>
            {filtrosActivos.length > 0 && (
                <View style={styles.chips}>
                    {filtrosActivos.map(({ id, etiqueta, quitar }) => (
                        <Pressable
                            key={id}
                            accessibilityRole="button"
                            accessibilityLabel={`Quitar filtro: ${etiqueta}`}
                            hitSlop={4}
                            onPress={quitar}
                            style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <ThemedText type="small" style={styles.textoChip}>
                                {etiqueta}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.textoChip}>
                                ×
                            </ThemedText>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    resumen: { gap: Spacing.two },
    cabecera: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    limpiar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        minHeight: 28,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 10,
    },
    textoChip: { fontSize: 12, lineHeight: 16 },
});
