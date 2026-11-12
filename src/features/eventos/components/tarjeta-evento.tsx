import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Evento } from '@/types/evento';

const formatoFecha = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

interface TarjetaEventoProps {
    evento: Evento;
    // Marca los eventos que organiza quien tiene la sesión
    esPropio?: boolean;
    children?: ReactNode;
}

const porcentajeOcupado = (evento: Evento): number => {
    if (evento.cuposMaximos <= 0) return 0;
    const ocupados = evento.cuposMaximos - evento.cuposDisponibles;
    return Math.max(0, Math.min(100, (ocupados / evento.cuposMaximos) * 100));
};

export function TarjetaEvento({ evento, esPropio = false, children }: TarjetaEventoProps) {
    const theme = useTheme();
    const estaCancelado = evento.estado.toUpperCase() === 'CANCELADO';
    const ocupados =
        evento.cuposMaximos > 0
            ? Math.max(0, Math.min(evento.cuposMaximos, evento.cuposMaximos - evento.cuposDisponibles))
            : 0;
    const estaLleno = evento.cuposMaximos > 0 && evento.cuposDisponibles <= 0;

    return (
        <View style={[styles.tarjeta, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cabecera}>
                {!!evento.categoriaNombre && (
                    <ThemedText
                        type="small"
                        style={[styles.categoria, { backgroundColor: theme.categoryBackground, color: theme.category }]}>
                        {evento.categoriaNombre}
                    </ThemedText>
                )}
                {esPropio && (
                    <ThemedText
                        type="smallBold"
                        style={[styles.categoria, { backgroundColor: theme.softRedBackground, color: theme.primary }]}>
                        Tu evento
                    </ThemedText>
                )}
                <View style={styles.estado}>
                    <View
                        style={[styles.punto, { backgroundColor: estaCancelado ? theme.textSecondary : theme.success }]}
                    />
                    <ThemedText
                        type="smallBold"
                        style={[styles.textoEstado, { color: estaCancelado ? theme.textSecondary : theme.success }]}>
                        {estaCancelado ? 'Cancelado' : 'Publicado'}
                    </ThemedText>
                </View>
            </View>

            <ThemedText type="smallBold" style={styles.titulo}>
                {evento.titulo}
            </ThemedText>

            <View style={styles.datos}>
                <View style={styles.dato}>
                    <SymbolView
                        name={{ ios: 'calendar', android: 'event', web: 'event' }}
                        size={14}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
                        {formatoFecha.format(new Date(evento.fechaInicio))}
                    </ThemedText>
                </View>
                <View style={styles.dato}>
                    <SymbolView
                        name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
                        size={14}
                        tintColor={theme.textSecondary}
                    />
                    <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
                        {evento.ubicacion}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.cupos}>
                <View style={styles.filaCupos}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.textoCupos}>
                        Cupos ocupados
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.textoCupos}>
                        {ocupados} / {evento.cuposMaximos}
                        {estaLleno && ' · Lleno'}
                    </ThemedText>
                </View>
                <View
                    accessibilityRole="progressbar"
                    accessibilityLabel={`Cupos ocupados de ${evento.titulo}`}
                    accessibilityValue={{ min: 0, max: Math.max(1, evento.cuposMaximos), now: ocupados }}
                    style={[styles.barra, { backgroundColor: theme.border }]}>
                    <View
                        style={[styles.barraOcupada, { width: `${porcentajeOcupado(evento)}%`, backgroundColor: theme.primary }]}
                    />
                </View>
            </View>

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    tarjeta: { gap: 12, borderWidth: 1, borderRadius: 8, padding: Spacing.three },
    cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
    categoria: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    estado: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, marginLeft: 'auto' },
    punto: { width: 6, height: 6, borderRadius: 3 },
    textoEstado: { fontSize: 12, lineHeight: 16 },
    titulo: { fontSize: 16, lineHeight: 24 },
    datos: { gap: Spacing.one },
    dato: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    cupos: { gap: 6 },
    filaCupos: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
    textoCupos: { fontSize: 12, lineHeight: 16 },
    barra: { height: 4, borderRadius: 9999, overflow: 'hidden' },
    barraOcupada: { height: '100%' },
});
