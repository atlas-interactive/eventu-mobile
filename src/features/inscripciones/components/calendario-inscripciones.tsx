import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState, type RefObject } from 'react';
import { Pressable, StyleSheet, View, type ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Inscripcion } from '@/types/inscripcion';

interface CalendarioInscripcionesProps {
    inscripciones: Inscripcion[];
    onCancelar: (inscripcion: Inscripcion) => void;
    // ScrollView de la pantalla, para bajar hasta el día que se toque
    scrollRef: RefObject<ScrollView | null>;
}

const formatoMes = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const formatoDiaAgenda = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });
const formatoMesCorto = new Intl.DateTimeFormat('es-CO', { month: 'short' });

const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const claveFecha = (fecha: Date) =>
    `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

const fechaDeInscripcion = (inscripcion: Inscripcion) => new Date(inscripcion.eventoFechaInicio);

const mayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

const mesCorto = (fecha: Date) => formatoMesCorto.format(fecha).replace('.', '').toUpperCase();

// Lunes de la semana de la fecha
const inicioSemana = (fecha: Date) => {
    const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
    return lunes;
};

export function CalendarioInscripciones({ inscripciones, onCancelar, scrollRef }: CalendarioInscripcionesProps) {
    const theme = useTheme();
    const [referencia, setReferencia] = useState(() => new Date());
    const [vistaMes, setVistaMes] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
    // Posiciones para bajar hasta los eventos de un día
    const posicionCalendario = useRef(0);
    const posicionAgenda = useRef(0);
    const posicionesDia = useRef(new Map<string, number>());

    const claveHoy = claveFecha(new Date());

    const eventosPorDia = new Map<string, Inscripcion[]>();
    for (const inscripcion of inscripciones) {
        const fecha = fechaDeInscripcion(inscripcion);
        if (Number.isNaN(fecha.getTime())) continue;
        const clave = claveFecha(fecha);
        eventosPorDia.set(clave, [...(eventosPorDia.get(clave) ?? []), inscripcion]);
    }
    for (const eventos of eventosPorDia.values()) {
        eventos.sort((a, b) => fechaDeInscripcion(a).getTime() - fechaDeInscripcion(b).getTime());
    }
    const agendaCompleta = Array.from(eventosPorDia.entries()).sort(([a], [b]) => a.localeCompare(b));

    // Días que se dibujan: la semana de la referencia o el mes completo
    let dias: (Date | null)[] = [];
    let mesTitulo = referencia;
    if (vistaMes) {
        const inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
        const cantidadDias = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0).getDate();
        dias = Array.from({ length: (inicio.getDay() + 6) % 7 }, () => null);
        for (let dia = 1; dia <= cantidadDias; dia += 1) {
            dias.push(new Date(referencia.getFullYear(), referencia.getMonth(), dia));
        }
        while (dias.length % 7 !== 0) dias.push(null);
    } else {
        const lunes = inicioSemana(referencia);
        dias = Array.from({ length: 7 }, (_, indice) => new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + indice));
        // el jueves decide a qué mes pertenece la semana
        mesTitulo = dias[3] ?? referencia;
    }

    const claveMes = `${mesTitulo.getFullYear()}-${String(mesTitulo.getMonth() + 1).padStart(2, '0')}`;
    const eventosDelMes = agendaCompleta.filter(([clave]) => clave.startsWith(`${claveMes}-`));
    const totalActivasDelMes = eventosDelMes.reduce(
        (total, [, eventos]) => total + eventos.filter(({ estado }) => estado === 'ACTIVA').length,
        0,
    );
    const diaConMasEventos = eventosDelMes.reduce<[string, Inscripcion[]] | null>(
        (mayor, actual) => (!mayor || actual[1].length > mayor[1].length ? actual : mayor),
        null,
    );
    const eventosDiaSeleccionado = fechaSeleccionada ? (eventosPorDia.get(fechaSeleccionada) ?? []) : [];

    const navegar = (cantidad: number) => {
        setReferencia((actual) =>
            vistaMes
                ? new Date(actual.getFullYear(), actual.getMonth() + cantidad, 1)
                : new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + cantidad * 7),
        );
        setFechaSeleccionada(null);
    };

    const seleccionarFecha = (clave: string) => {
        if (fechaSeleccionada === clave) {
            setFechaSeleccionada(null);
            return;
        }
        setFechaSeleccionada(clave);
        const posicionDia = posicionesDia.current.get(clave);
        if (posicionDia !== undefined) {
            scrollRef.current?.scrollTo({
                y: posicionCalendario.current + posicionAgenda.current + posicionDia - Spacing.two,
                animated: true,
            });
        }
    };

    return (
        <View style={styles.contenedor} onLayout={(evento) => (posicionCalendario.current = evento.nativeEvent.layout.y)}>
            <View style={[styles.calendario, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.cabecera}>
                    <ThemedText type="smallBold" style={styles.mes}>
                        {mayuscula(formatoMes.format(mesTitulo))}
                    </ThemedText>
                    <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setVistaMes(!vistaMes)}>
                        <ThemedText type="smallBold" themeColor="primary" style={styles.verMes}>
                            {vistaMes ? 'Ver semana' : 'Ver mes'}
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={vistaMes ? 'Mes anterior' : 'Semana anterior'}
                        hitSlop={6}
                        onPress={() => navegar(-1)}
                        style={[styles.flecha, { borderColor: theme.border }]}>
                        <SymbolView
                            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                            size={14}
                            tintColor={theme.text}
                        />
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={vistaMes ? 'Mes siguiente' : 'Semana siguiente'}
                        hitSlop={6}
                        onPress={() => navegar(1)}
                        style={[styles.flecha, { borderColor: theme.border }]}>
                        <SymbolView
                            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                            size={14}
                            tintColor={theme.text}
                        />
                    </Pressable>
                </View>

                <View style={styles.cuadricula}>
                    {diasSemana.map((dia, indice) => (
                        <ThemedText
                            key={`${dia}-${indice}`}
                            type="small"
                            themeColor="textSecondary"
                            style={[styles.celda, styles.nombreDia]}>
                            {dia}
                        </ThemedText>
                    ))}
                    {dias.map((fecha, indice) => {
                        if (!fecha) return <View key={`vacio-${indice}`} style={styles.celda} />;
                        const clave = claveFecha(fecha);
                        const eventos = eventosPorDia.get(clave) ?? [];
                        const seleccionado = clave === fechaSeleccionada;
                        const esHoy = clave === claveHoy;
                        return (
                            <Pressable
                                key={clave}
                                accessibilityRole="button"
                                accessibilityLabel={`${formatoDiaAgenda.format(fecha)}${eventos.length ? `, ${eventos.length} eventos` : ''}`}
                                accessibilityState={{ selected: seleccionado }}
                                onPress={() => seleccionarFecha(clave)}
                                style={styles.celda}>
                                <View
                                    style={[
                                        styles.dia,
                                        seleccionado && { backgroundColor: theme.text },
                                        !seleccionado && esHoy && { borderWidth: 1.5, borderColor: theme.text },
                                    ]}>
                                    <ThemedText
                                        type={eventos.length ? 'smallBold' : 'small'}
                                        style={{ color: seleccionado ? theme.surface : theme.text }}>
                                        {fecha.getDate()}
                                    </ThemedText>
                                </View>
                                <View style={styles.puntos}>
                                    {eventos.slice(0, 3).map((evento) => (
                                        <View
                                            key={evento.id}
                                            style={[
                                                styles.punto,
                                                evento.estado === 'ACTIVA'
                                                    ? { backgroundColor: theme.primary }
                                                    : { borderWidth: 1, borderColor: theme.textSecondary },
                                            ]}
                                        />
                                    ))}
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={styles.leyenda}>
                    <View style={styles.itemLeyenda}>
                        <View style={[styles.punto, { backgroundColor: theme.primary }]} />
                        <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                            Inscripción activa
                        </ThemedText>
                    </View>
                    <View style={styles.itemLeyenda}>
                        <View style={[styles.punto, { borderWidth: 1, borderColor: theme.textSecondary }]} />
                        <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                            Inscripción o evento cancelado
                        </ThemedText>
                    </View>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                        Toca un día para ir a sus eventos.
                    </ThemedText>
                </View>

                <View style={styles.resumen}>
                    <View style={[styles.dato, { backgroundColor: theme.background }]}>
                        <ThemedText type="smallBold" style={styles.numero}>
                            {totalActivasDelMes}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                            Activas este mes
                        </ThemedText>
                    </View>
                    <View style={[styles.dato, { backgroundColor: theme.background }]}>
                        <ThemedText type="smallBold" style={styles.numero}>
                            {fechaSeleccionada
                                ? eventosDiaSeleccionado.length
                                : diaConMasEventos
                                  ? `${Number(diaConMasEventos[0].slice(8))} ${mesCorto(new Date(`${diaConMasEventos[0]}T12:00:00`)).toLowerCase()}`
                                  : '—'}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                            {fechaSeleccionada ? 'Eventos en el día seleccionado' : 'Día con más eventos'}
                        </ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.agenda} onLayout={(evento) => (posicionAgenda.current = evento.nativeEvent.layout.y)}>
                {agendaCompleta.length === 0 ? (
                    <ThemedText type="small" themeColor="textSecondary">
                        No tienes eventos publicados para mostrar
                    </ThemedText>
                ) : (
                    agendaCompleta.map(([clave, eventos]) => {
                        const fecha = fechaDeInscripcion(eventos[0]);
                        return (
                            <View
                                key={clave}
                                style={styles.grupo}
                                onLayout={(evento) => posicionesDia.current.set(clave, evento.nativeEvent.layout.y)}>
                                <View style={styles.tituloGrupo}>
                                    <ThemedText type="smallBold">{mayuscula(formatoDiaAgenda.format(fecha))}</ThemedText>
                                    {clave === claveHoy && (
                                        <ThemedText
                                            type="smallBold"
                                            style={[styles.hoy, { backgroundColor: theme.primary, color: theme.onPrimary }]}>
                                            Hoy
                                        </ThemedText>
                                    )}
                                    {eventos.length > 1 && (
                                        <ThemedText type="small" themeColor="textSecondary">
                                            · {eventos.length} eventos
                                        </ThemedText>
                                    )}
                                </View>

                                {eventos.map((inscripcion) => {
                                    const fechaEvento = fechaDeInscripcion(inscripcion);
                                    const activa = inscripcion.estado === 'ACTIVA';
                                    return (
                                        <View
                                            key={inscripcion.id}
                                            style={[
                                                styles.tarjeta,
                                                { backgroundColor: theme.surface, borderColor: theme.border },
                                            ]}>
                                            <View
                                                style={[
                                                    styles.fechaTarjeta,
                                                    { backgroundColor: activa ? theme.softRedBackground : theme.disabledButton },
                                                ]}>
                                                <ThemedText
                                                    type="smallBold"
                                                    style={[styles.fechaNumero, { color: activa ? theme.primary : theme.textSecondary }]}>
                                                    {fechaEvento.getDate()}
                                                </ThemedText>
                                                <ThemedText
                                                    type="small"
                                                    style={[styles.textoChico, { color: activa ? theme.primary : theme.textSecondary }]}>
                                                    {mesCorto(fechaEvento)}
                                                </ThemedText>
                                            </View>
                                            <View style={styles.cuerpo}>
                                                <Pressable
                                                    accessibilityRole="link"
                                                    onPress={() => router.push(`/evento/${inscripcion.eventoId}`)}>
                                                    <ThemedText
                                                        type="smallBold"
                                                        style={[
                                                            styles.tituloEvento,
                                                            !activa && { textDecorationLine: 'line-through', color: theme.textSecondary },
                                                        ]}>
                                                        {inscripcion.eventoTitulo}
                                                    </ThemedText>
                                                </Pressable>
                                                <View style={styles.datoEvento}>
                                                    <SymbolView
                                                        name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                                                        size={12}
                                                        tintColor={theme.textSecondary}
                                                    />
                                                    <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                                        {formatoHora.format(fechaEvento)}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.datoEvento}>
                                                    <SymbolView
                                                        name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
                                                        size={12}
                                                        tintColor={theme.textSecondary}
                                                    />
                                                    <ThemedText
                                                        type="small"
                                                        themeColor="textSecondary"
                                                        style={[styles.textoChico, styles.flex]}>
                                                        {inscripcion.eventoUbicacion}
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.acciones}>
                                                    <ThemedText
                                                        type="smallBold"
                                                        style={[
                                                            styles.estado,
                                                            activa
                                                                ? { backgroundColor: theme.successBackground, color: theme.success }
                                                                : { backgroundColor: theme.disabledButton, color: theme.textSecondary },
                                                        ]}>
                                                        {activa ? 'Inscripción activa' : 'Inscripción cancelada'}
                                                    </ThemedText>
                                                    {activa && (
                                                        <Pressable
                                                            accessibilityRole="button"
                                                            accessibilityLabel={`Cancelar inscripción a ${inscripcion.eventoTitulo}`}
                                                            hitSlop={4}
                                                            onPress={() => onCancelar(inscripcion)}
                                                            style={[styles.cancelar, { borderColor: theme.primary }]}>
                                                            <SymbolView
                                                                name={{ ios: 'xmark.circle', android: 'cancel', web: 'cancel' }}
                                                                size={14}
                                                                tintColor={theme.primary}
                                                            />
                                                            <ThemedText type="smallBold" themeColor="primary" style={styles.textoChico}>
                                                                Cancelar
                                                            </ThemedText>
                                                        </Pressable>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    contenedor: { gap: Spacing.three },
    calendario: { gap: 12, borderWidth: 1, borderRadius: 8, padding: 12 },
    cabecera: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    mes: { flex: 1, fontSize: 16, lineHeight: 24 },
    verMes: { textDecorationLine: 'underline', fontSize: 13 },
    flecha: { width: 32, height: 32, borderWidth: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    cuadricula: { flexDirection: 'row', flexWrap: 'wrap' },
    celda: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 },
    nombreDia: { textAlign: 'center', fontSize: 11, lineHeight: 16 },
    dia: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    puntos: { height: 6, flexDirection: 'row', gap: 2, marginTop: 2 },
    punto: { width: 5, height: 5, borderRadius: 3 },
    leyenda: { gap: Spacing.one },
    itemLeyenda: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    textoChico: { fontSize: 12, lineHeight: 16 },
    resumen: { flexDirection: 'row', gap: Spacing.two },
    dato: { flex: 1, borderRadius: 6, padding: 10, gap: 2 },
    numero: { fontSize: 18, lineHeight: 24 },
    agenda: { gap: Spacing.three },
    grupo: { gap: Spacing.two },
    tituloGrupo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
    hoy: {
        borderRadius: 9999,
        paddingHorizontal: 8,
        paddingVertical: 1,
        fontSize: 11,
        lineHeight: 16,
        overflow: 'hidden',
    },
    tarjeta: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: 8, padding: 12 },
    fechaTarjeta: { width: 48, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    fechaNumero: { fontSize: 18, lineHeight: 22 },
    cuerpo: { flex: 1, gap: Spacing.one },
    tituloEvento: { fontSize: 15, lineHeight: 22 },
    datoEvento: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    acciones: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
    estado: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    cancelar: {
        minHeight: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 8,
    },
});
