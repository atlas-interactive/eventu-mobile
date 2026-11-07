import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { FiltrosEventos } from '@/features/eventos/components/filtros-eventos';
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
    const [buscando, setBuscando] = useState(false);

    // Al cerrar el buscador también se borra lo que se había escrito
    const alternarBusqueda = () => {
        if (buscando && catalogo.filtros.texto) catalogo.setFiltros({ ...catalogo.filtros, texto: undefined });
        setBuscando(!buscando);
    };

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
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
                <View style={[styles.encabezado, { borderBottomColor: theme.border }]}>
                    <ThemedText type="smallBold" style={styles.marca}>
                        EventU
                    </ThemedText>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={buscando ? 'Cerrar búsqueda' : 'Buscar eventos'}
                        hitSlop={12}
                        onPress={alternarBusqueda}>
                        <SymbolView
                            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                            size={20}
                            tintColor={theme.text}
                        />
                    </Pressable>
                </View>
                {buscando && (
                    <View style={[styles.buscador, { borderBottomColor: theme.border }]}>
                        <TextInput
                            autoFocus
                            accessibilityLabel="Buscar eventos"
                            style={[
                                styles.inputBusqueda,
                                { borderColor: theme.fieldBorder, backgroundColor: theme.surface, color: theme.text },
                            ]}
                            maxLength={100}
                            placeholder="Buscar eventos..."
                            placeholderTextColor={theme.textSecondary}
                            value={catalogo.filtros.texto ?? ''}
                            onChangeText={(texto) => catalogo.setFiltros({ ...catalogo.filtros, texto })}
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                    </View>
                )}
            </SafeAreaView>
            <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.catalogo}>
                {!!catalogo.errorCategorias && (
                    <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                        {catalogo.errorCategorias}
                    </ThemedText>
                )}
                <FiltrosEventos
                    categorias={catalogo.categorias}
                    filtros={catalogo.filtros}
                    onChange={catalogo.setFiltros}
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
                                    <View style={styles.pieTarjeta}>
                                        <ThemedText type="small" themeColor="textSecondary" style={styles.textoCupos}>
                                            {evento.cuposDisponibles} cupos disponibles de {evento.cuposMaximos}
                                        </ThemedText>
                                        <Link href={`/eventos/${evento.id}`} asChild>
                                            <Pressable
                                                accessibilityRole="link"
                                                accessibilityLabel={`Ver detalle de ${evento.titulo}`}
                                                hitSlop={4}
                                                style={StyleSheet.flatten([styles.detalle, { backgroundColor: theme.surface, borderColor: theme.fieldBorder }])}>
                                                <ThemedText type="smallBold">Ver detalle</ThemedText>
                                            </Pressable>
                                        </Link>
                                    </View>
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
    encabezado: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        paddingHorizontal: Spacing.three,
    },
    marca: { fontSize: 20, lineHeight: 28 },
    buscador: { borderBottomWidth: 1, padding: Spacing.three },
    inputBusqueda: {
        minHeight: 40,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        fontFamily: 'AtkinsonHyperlegible_400Regular',
        fontSize: 14,
    },
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
    pieTarjeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
    textoCupos: { flexShrink: 1 },
    detalle: {
        minHeight: 36,
        borderWidth: 1,
        borderRadius: 6,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
});
