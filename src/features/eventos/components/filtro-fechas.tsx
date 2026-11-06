import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface FiltroFechasProps {
    fechaDesde?: string;
    fechaHasta?: string;
    onCerrar: () => void;
    onAplicar: (fechaDesde?: string, fechaHasta?: string) => void;
}

type CampoFecha = 'desde' | 'hasta';

// El backend recibe las fechas como aaaa-mm-dd
const aTexto = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

const aFecha = (texto: string) => {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
};

const mostrarFecha = (texto: string) => texto.split('-').reverse().join('/');

// Las fechas elegidas solo se aplican al tocar "Aplicar filtro"
export function FiltroFechas({ fechaDesde, fechaHasta, onCerrar, onAplicar }: FiltroFechasProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [desde, setDesde] = useState(fechaDesde);
    const [hasta, setHasta] = useState(fechaHasta);
    const [calendarioAbierto, setCalendarioAbierto] = useState<CampoFecha | null>(null);
    const fechasInvalidas = Boolean(desde && hasta && desde > hasta);
    const minimoHasta = desde ? aFecha(desde) : undefined;
    const maximoDesde = hasta ? aFecha(hasta) : undefined;

    const elegirFecha = (campo: CampoFecha, fecha: Date) => {
        setCalendarioAbierto(null);
        if (campo === 'desde') setDesde(aTexto(fecha));
        else setHasta(aTexto(fecha));
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

    const campoFecha = (campo: CampoFecha, etiqueta: string) => {
        const valor = campo === 'desde' ? desde : hasta;
        return (
            <View style={styles.campo}>
                <ThemedText type="small" themeColor="textSecondary">
                    {etiqueta}
                </ThemedText>
                <View
                    style={[
                        styles.input,
                        { borderColor: fechasInvalidas ? theme.error : theme.border, backgroundColor: theme.surface },
                    ]}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={etiqueta}
                        hitSlop={6}
                        onPress={() => abrirCalendario(campo)}
                        style={styles.flex}>
                        <ThemedText style={{ color: valor ? theme.text : theme.textSecondary }}>
                            {valor ? mostrarFecha(valor) : 'dd/mm/aaaa'}
                        </ThemedText>
                    </Pressable>
                    {!!valor && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Quitar fecha ${etiqueta.toLowerCase()}`}
                            hitSlop={10}
                            onPress={() => (campo === 'desde' ? setDesde(undefined) : setHasta(undefined))}>
                            <ThemedText themeColor="textSecondary">×</ThemedText>
                        </Pressable>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Modal transparent animationType="slide" onRequestClose={onCerrar}>
            <View style={[styles.flex, { backgroundColor: theme.overlay }]}>
                <Pressable style={styles.flex} accessibilityLabel="Cerrar filtro de fechas" onPress={onCerrar} />
                <View
                    style={[
                        styles.panel,
                        { backgroundColor: theme.surface, paddingBottom: Spacing.four + insets.bottom },
                    ]}>
                    <ThemedText type="smallBold" style={styles.titulo}>
                        Filtrar por fechas
                    </ThemedText>
                    {campoFecha('desde', 'Desde')}
                    {campoFecha('hasta', 'Hasta')}
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
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: fechasInvalidas }}
                        disabled={fechasInvalidas}
                        onPress={() => onAplicar(desde, hasta)}
                        style={[
                            styles.boton,
                            { backgroundColor: fechasInvalidas ? theme.disabledButton : theme.primary },
                        ]}>
                        <ThemedText
                            type="smallBold"
                            style={[styles.textoBoton, { color: fechasInvalidas ? theme.textSecondary : theme.onPrimary }]}>
                            Aplicar filtro
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    panel: {
        gap: Spacing.three,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: Spacing.four,
    },
    titulo: { fontSize: 16, lineHeight: 24 },
    campo: { gap: Spacing.two },
    input: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    boton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
    textoBoton: { fontSize: 16, lineHeight: 24 },
});
