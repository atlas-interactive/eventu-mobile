import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { OrdenEventos } from '@/features/eventos/evento-ordenamiento';
import { useTheme } from '@/hooks/use-theme';
import type { FiltrosEvento } from '@/types/evento';

interface PanelFiltrosProps {
    filtros: FiltrosEvento;
    orden: OrdenEventos;
    onChange: (filtros: FiltrosEvento) => void;
    onOrdenChange: (orden: OrdenEventos) => void;
    onLimpiar: () => void;
    onCerrar: () => void;
}

type CampoFecha = 'desde' | 'hasta';

const periodos = [
    { valor: 'hoy', etiqueta: 'Hoy' },
    { valor: 'semana', etiqueta: 'Esta semana' },
    { valor: 'mes', etiqueta: 'Este mes' },
    { valor: 'proximo-mes', etiqueta: 'Próximo mes' },
] as const;

const ordenes: { valor: OrdenEventos; etiqueta: string }[] = [
    { valor: 'fecha-proxima', etiqueta: 'Fecha más próxima' },
    { valor: 'fecha-lejana', etiqueta: 'Fecha más lejana' },
    { valor: 'titulo', etiqueta: 'Título A–Z' },
];

// El backend recibe las fechas como aaaa-mm-dd
const aTexto = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

const aFecha = (texto: string) => {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
};

const mostrarFecha = (texto: string) => texto.split('-').reverse().join('/');

const obtenerRangoPeriodo = (periodo: (typeof periodos)[number]['valor'], ahora = new Date()) => {
    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    if (periodo === 'hoy') return { fechaDesde: aTexto(inicio), fechaHasta: aTexto(inicio) };
    if (periodo === 'semana') {
        const diasDesdeLunes = (inicio.getDay() + 6) % 7;
        const lunes = new Date(inicio);
        lunes.setDate(inicio.getDate() - diasDesdeLunes);
        const domingo = new Date(lunes);
        domingo.setDate(lunes.getDate() + 6);
        return { fechaDesde: aTexto(lunes), fechaHasta: aTexto(domingo) };
    }
    const mesObjetivo = periodo === 'mes' ? inicio.getMonth() : inicio.getMonth() + 1;
    const fechaDesde = new Date(inicio.getFullYear(), mesObjetivo, 1);
    const fechaHasta = new Date(inicio.getFullYear(), mesObjetivo + 1, 0);
    return { fechaDesde: aTexto(fechaDesde), fechaHasta: aTexto(fechaHasta) };
};

// Los filtros se aplican al tocarlos; "Listo" solo cierra el panel
export function PanelFiltros({ filtros, orden, onChange, onOrdenChange, onLimpiar, onCerrar }: PanelFiltrosProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [calendarioAbierto, setCalendarioAbierto] = useState<CampoFecha | null>(null);
    const desde = filtros.fechaDesde;
    const hasta = filtros.fechaHasta;
    const fechasInvalidas = Boolean(desde && hasta && desde > hasta);
    const minimoHasta = desde ? aFecha(desde) : undefined;
    const maximoDesde = hasta ? aFecha(hasta) : undefined;

    const cambiarFecha = (campo: CampoFecha, valor?: string) => {
        if (campo === 'desde') onChange({ ...filtros, fechaDesde: valor });
        else onChange({ ...filtros, fechaHasta: valor });
    };

    const elegirFecha = (campo: CampoFecha, fecha: Date) => {
        setCalendarioAbierto(null);
        cambiarFecha(campo, aTexto(fecha));
    };

    //En Android el calendario es una ventana del sistema; en iPhone se muestra debajo de los campos
    const abrirCalendario = (campo: CampoFecha) => {
        const actual = campo === 'desde' ? desde : hasta;
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: actual ? aFecha(actual) : new Date(),
                mode: 'date',
                minimumDate: campo === 'hasta' ? minimoHasta : undefined,
                maximumDate: campo === 'desde' ? maximoDesde : undefined,
                onValueChange: (_, fecha) => elegirFecha(campo, fecha),
            });
            return;
        }
        setCalendarioAbierto(calendarioAbierto === campo ? null : campo);
    };

    const chip = (activo: boolean, etiqueta: string, onPress: () => void) => (
        <Pressable
            key={etiqueta}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            hitSlop={4}
            onPress={onPress}
            style={[
                styles.chip,
                activo
                    ? { backgroundColor: theme.softRedBackground, borderColor: theme.softRedBackground }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <ThemedText type="small" style={[styles.textoChip, { color: activo ? theme.primary : theme.text }]}>
                {etiqueta}
            </ThemedText>
        </Pressable>
    );

    const campoFecha = (campo: CampoFecha, etiqueta: string) => {
        const valor = campo === 'desde' ? desde : hasta;
        return (
            <View style={[styles.campo, styles.flex]}>
                <ThemedText type="small" themeColor="textSecondary">
                    {etiqueta}
                </ThemedText>
                <View
                    style={[
                        styles.input,
                        { borderColor: fechasInvalidas ? theme.error : theme.fieldBorder, backgroundColor: theme.surface },
                    ]}>
                    <SymbolView
                        name={{ ios: 'calendar', android: 'event', web: 'event' }}
                        size={16}
                        tintColor={theme.textSecondary}
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={etiqueta}
                        hitSlop={6}
                        onPress={() => abrirCalendario(campo)}
                        style={styles.flex}>
                        <ThemedText type="small" style={{ color: valor ? theme.text : theme.textSecondary }}>
                            {valor ? mostrarFecha(valor) : 'dd/mm/aaaa'}
                        </ThemedText>
                    </Pressable>
                    {!!valor && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Quitar fecha ${etiqueta.toLowerCase()}`}
                            hitSlop={10}
                            onPress={() => cambiarFecha(campo, undefined)}>
                            <ThemedText themeColor="textSecondary">×</ThemedText>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Modal transparent animationType="fade" onRequestClose={onCerrar}>
            <View style={[styles.flex, { backgroundColor: theme.overlay }]}>
                <Pressable style={styles.flex} accessibilityLabel="Cerrar filtros" onPress={onCerrar} />
                {/* El fondo aparece en su sitio y solo el panel sube desde abajo */}
                <Animated.View
                    entering={SlideInDown.duration(250)}
                    style={[
                        styles.panel,
                        { backgroundColor: theme.surface, paddingBottom: Spacing.three + insets.bottom },
                    ]}>
                    <View style={[styles.agarre, { backgroundColor: theme.border }]} />
                    <ThemedText type="smallBold" accessibilityRole="header" style={styles.titulo}>
                        Filtros
                    </ThemedText>
                    <ScrollView contentContainerStyle={styles.secciones}>
                        <View style={styles.seccion}>
                            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.etiqueta}>
                                FECHA
                            </ThemedText>
                            <View style={styles.chips}>
                                {periodos.map(({ valor, etiqueta }) => {
                                    const rango = obtenerRangoPeriodo(valor);
                                    const activo = desde === rango.fechaDesde && hasta === rango.fechaHasta;
                                    return chip(activo, etiqueta, () => onChange({ ...filtros, ...rango }));
                                })}
                            </View>
                            <View style={styles.fechas}>
                                {campoFecha('desde', 'Desde')}
                                {campoFecha('hasta', 'Hasta')}
                            </View>
                            {Platform.OS === 'ios' && calendarioAbierto && (
                                <DateTimePicker
                                    value={
                                        calendarioAbierto === 'desde'
                                            ? desde ? aFecha(desde) : new Date()
                                            : hasta ? aFecha(hasta) : new Date()
                                    }
                                    mode="date"
                                    display="inline"
                                    locale="es-CO"
                                    accentColor={theme.primary}
                                    minimumDate={calendarioAbierto === 'hasta' ? minimoHasta : undefined}
                                    maximumDate={calendarioAbierto === 'desde' ? maximoDesde : undefined}
                                    onValueChange={(_, fecha) => elegirFecha(calendarioAbierto, fecha)}
                                />
                            )}
                            {fechasInvalidas && (
                                <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                                    La fecha inicial no puede ser posterior a la fecha final.
                                </ThemedText>
                            )}
                        </View>

                        <View style={styles.seccion}>
                            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.etiqueta}>
                                ORDENAR
                            </ThemedText>
                            <View style={styles.chips}>
                                {ordenes.map(({ valor, etiqueta }) =>
                                    chip(orden === valor, etiqueta, () => onOrdenChange(valor)),
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.acciones}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onLimpiar}
                            style={[styles.boton, styles.flex, { borderColor: theme.fieldBorder, borderWidth: 1 }]}>
                            <SymbolView
                                name={{ ios: 'arrow.counterclockwise', android: 'restart_alt', web: 'restart_alt' }}
                                size={16}
                                tintColor={theme.text}
                            />
                            <ThemedText type="smallBold">Limpiar filtros</ThemedText>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={onCerrar}
                            style={[styles.boton, styles.flex, { backgroundColor: theme.primary }]}>
                            <ThemedText type="smallBold" themeColor="onPrimary">
                                Listo
                            </ThemedText>
                        </Pressable>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    panel: {
        maxHeight: '85%',
        gap: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: Spacing.three,
        paddingTop: Spacing.two,
    },
    agarre: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' },
    titulo: { fontSize: 18, lineHeight: 26 },
    secciones: { gap: Spacing.four, paddingBottom: Spacing.two },
    seccion: { gap: Spacing.two },
    etiqueta: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    chip: {
        minHeight: 36,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 9999,
        paddingHorizontal: 14,
    },
    textoChip: { fontSize: 13, lineHeight: 18 },
    fechas: { flexDirection: 'row', gap: Spacing.two },
    campo: { gap: Spacing.one },
    input: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    acciones: { flexDirection: 'row', gap: Spacing.two },
    boton: {
        minHeight: 48,
        flexDirection: 'row',
        gap: Spacing.two,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
});
