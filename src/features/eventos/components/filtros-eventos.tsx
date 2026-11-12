import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { PanelFiltros } from '@/features/eventos/components/panel-filtros';
import { ResumenEventos } from '@/features/eventos/components/resumen-eventos';
import type { OrdenEventos } from '@/features/eventos/evento-ordenamiento';
import { useTheme } from '@/hooks/use-theme';
import type { Categoria } from '@/types/categoria';
import type { FiltrosEvento } from '@/types/evento';

interface FiltrosEventosProps {
    categorias: Categoria[];
    cantidadEventos: number;
    filtros: FiltrosEvento;
    mostrarResumen: boolean;
    onChange: (filtros: FiltrosEvento) => void;
    orden: OrdenEventos;
    onOrdenChange: (orden: OrdenEventos) => void;
}

export function FiltrosEventos({
    categorias,
    cantidadEventos,
    filtros,
    mostrarResumen,
    onChange,
    orden,
    onOrdenChange,
}: FiltrosEventosProps) {
    const theme = useTheme();
    const [panelAbierto, setPanelAbierto] = useState(false);
    const fechasInvalidas = Boolean(
        filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta,
    );
    const filtrosActivos =
        Number(filtros.categoriaId !== undefined) + Number(Boolean(filtros.fechaDesde || filtros.fechaHasta));
    const hayFiltrosAplicados = Boolean(
        filtros.texto?.trim() || filtros.categoriaId !== undefined || filtros.fechaDesde || filtros.fechaHasta,
    );
    const cambiarCategoria = (categoriaId?: number) => onChange({ ...filtros, categoriaId });
    const limpiarFiltros = () =>
        onChange({ texto: undefined, categoriaId: undefined, fechaDesde: undefined, fechaHasta: undefined });

    const chipCategoria = (activa: boolean, nombre: string, onPress: () => void, cantidad?: number) => (
        <Pressable
            key={nombre}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            hitSlop={6}
            onPress={onPress}
            style={[
                styles.categoria,
                activa
                    ? { backgroundColor: theme.text, borderColor: theme.text }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <ThemedText type="small" style={[styles.textoCategoria, { color: activa ? theme.surface : theme.text }]}>
                {nombre}
            </ThemedText>
            {cantidad !== undefined && (
                <ThemedText
                    type="small"
                    style={[styles.textoCategoria, { color: activa ? theme.surface : theme.textSecondary }]}>
                    {cantidad}
                </ThemedText>
            )}
        </Pressable>
    );

    return (
        <View style={styles.filtros}>
            <View style={styles.fila}>
                <View
                    style={[
                        styles.buscador,
                        { borderColor: theme.fieldBorder, backgroundColor: theme.surface },
                    ]}>
                    <SymbolView
                        name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                        size={16}
                        tintColor={theme.textSecondary}
                    />
                    <TextInput
                        accessibilityLabel="Buscar eventos"
                        style={[styles.inputBusqueda, { color: theme.text }]}
                        maxLength={100}
                        placeholder="Buscar eventos..."
                        placeholderTextColor={theme.textSecondary}
                        value={filtros.texto ?? ''}
                        onChangeText={(texto) => onChange({ ...filtros, texto })}
                        autoCorrect={false}
                        returnKeyType="search"
                    />
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={filtrosActivos > 0 ? `Filtros, ${filtrosActivos} activos` : 'Filtros'}
                    onPress={() => setPanelAbierto(true)}
                    style={[styles.botonFiltros, { borderColor: theme.fieldBorder, backgroundColor: theme.surface }]}>
                    <SymbolView
                        name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }}
                        size={16}
                        tintColor={theme.text}
                    />
                    <ThemedText type="smallBold">Filtros</ThemedText>
                    {filtrosActivos > 0 && (
                        <View style={[styles.contador, { backgroundColor: theme.primary }]}>
                            <ThemedText type="smallBold" themeColor="onPrimary" style={styles.textoContador}>
                                {filtrosActivos}
                            </ThemedText>
                        </View>
                    )}
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categorias}
                accessibilityLabel="Filtrar por categoría">
                {chipCategoria(filtros.categoriaId === undefined, 'Todas', () => cambiarCategoria())}
                {categorias.map((categoria) =>
                    chipCategoria(
                        filtros.categoriaId === categoria.id,
                        categoria.nombre,
                        () => cambiarCategoria(categoria.id),
                        categoria.eventosActivos,
                    ),
                )}
            </ScrollView>

            {mostrarResumen && hayFiltrosAplicados && (
                <ResumenEventos
                    cantidadEventos={cantidadEventos}
                    categorias={categorias}
                    filtros={filtros}
                    onChange={onChange}
                    onLimpiar={limpiarFiltros}
                />
            )}
            {fechasInvalidas && (
                <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                    La fecha inicial no puede ser posterior a la fecha final.
                </ThemedText>
            )}

            {panelAbierto && (
                <PanelFiltros
                    filtros={filtros}
                    orden={orden}
                    onChange={onChange}
                    onOrdenChange={onOrdenChange}
                    onLimpiar={limpiarFiltros}
                    onCerrar={() => setPanelAbierto(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    filtros: { gap: 12 },
    fila: { flexDirection: 'row', gap: Spacing.two },
    buscador: {
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    inputBusqueda: {
        flex: 1,
        minHeight: 42,
        fontFamily: 'AtkinsonHyperlegible_400Regular',
        fontSize: 14,
    },
    botonFiltros: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    contador: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    textoContador: { fontSize: 12, lineHeight: 16 },
    categorias: { gap: 6 },
    categoria: {
        minHeight: 32,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 12,
    },
    textoCategoria: { fontSize: 12, lineHeight: 16 },
});
