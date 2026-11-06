import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FiltroFechas } from '@/features/eventos/components/filtro-fechas';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/types/categoria';
import type { FiltrosEvento } from '@/types/evento';

interface FiltrosEventosProps {
    categorias: Categoria[];
    filtros: FiltrosEvento;
    onChange: (filtros: FiltrosEvento) => void;
}

export function FiltrosEventos({ categorias, filtros, onChange }: FiltrosEventosProps) {
    const theme = useTheme();
    const [fechasAbiertas, setFechasAbiertas] = useState(false);
    const cambiarCategoria = (categoriaId?: number) => onChange({ ...filtros, categoriaId });
    const hayFechas = Boolean(filtros.fechaDesde || filtros.fechaHasta);

    return (
        <>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categorias}
                accessibilityLabel="Filtrar por categoría">
                <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: filtros.categoriaId === undefined }}
                    hitSlop={6}
                    onPress={() => cambiarCategoria()}
                    style={[
                        styles.categoria,
                        filtros.categoriaId === undefined
                            ? { backgroundColor: theme.text, borderColor: theme.text }
                            : { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}>
                    <ThemedText
                        type="small"
                        style={[
                            styles.textoCategoria,
                            { color: filtros.categoriaId === undefined ? theme.surface : theme.textSecondary },
                        ]}>
                        Todos
                    </ThemedText>
                </Pressable>
                {categorias.map((categoria) => (
                    <Pressable
                        key={categoria.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: filtros.categoriaId === categoria.id }}
                        hitSlop={6}
                        onPress={() => cambiarCategoria(categoria.id)}
                        style={[
                            styles.categoria,
                            filtros.categoriaId === categoria.id
                                ? { backgroundColor: theme.text, borderColor: theme.text }
                                : { backgroundColor: theme.surface, borderColor: theme.border },
                        ]}>
                        <ThemedText
                            type="small"
                            style={[
                                styles.textoCategoria,
                                { color: filtros.categoriaId === categoria.id ? theme.surface : theme.textSecondary },
                            ]}>
                            {categoria.nombre}
                        </ThemedText>
                    </Pressable>
                ))}
            </ScrollView>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filtrar por fechas"
                accessibilityState={{ selected: hayFechas }}
                hitSlop={6}
                onPress={() => setFechasAbiertas(true)}
                style={[
                    styles.categoria,
                    styles.fechas,
                    hayFechas
                        ? { backgroundColor: theme.text, borderColor: theme.text }
                        : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}>
                <ThemedText
                    type="small"
                    style={[styles.textoCategoria, { color: hayFechas ? theme.surface : theme.textSecondary }]}>
                    Fechas ▾
                </ThemedText>
            </Pressable>
            {fechasAbiertas && (
                <FiltroFechas
                    fechaDesde={filtros.fechaDesde}
                    fechaHasta={filtros.fechaHasta}
                    onCerrar={() => setFechasAbiertas(false)}
                    onAplicar={(fechaDesde, fechaHasta) => {
                        setFechasAbiertas(false);
                        onChange({ ...filtros, fechaDesde, fechaHasta });
                    }}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    categorias: { gap: 6, paddingVertical: 6 },
    categoria: {
        minHeight: 32,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 12,
    },
    textoCategoria: { fontSize: 12, lineHeight: 16 },
    fechas: { alignSelf: 'flex-start' },
});
