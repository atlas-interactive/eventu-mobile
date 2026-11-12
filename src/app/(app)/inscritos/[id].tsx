import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { mensajeDeError } from '@/api/mensajeDeError';
import { EncabezadoApp } from '@/components/encabezado-app';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { listarInscritosEvento, obtenerEvento } from '@/features/eventos/services/evento-service';
import { useTheme } from '@/hooks/use-theme';
import type { Evento, InscritoEvento } from '@/types/evento';

const formatoDia = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
const formatoHora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' });

const iniciales = (nombre: string) =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0])
        .join('')
        .toUpperCase();

export default function InscritosEvento() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const idEvento = Number(id);
    const idValido = Number.isSafeInteger(idEvento) && idEvento > 0;

    const [datos, setDatos] = useState<{ evento: Evento; inscritos: InscritoEvento[] } | null>(null);
    const [recarga, setRecarga] = useState(0);
    const [error, setError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const primeraVez = useRef(true);
    const cargando = idValido && !datos && !error;

    // Al volver del escáner se piden otra vez para ver las nuevas asistencias
    useFocusEffect(
        useCallback(() => {
            if (primeraVez.current) {
                primeraVez.current = false;
                return;
            }
            setRecarga((n) => n + 1);
        }, []),
    );

    useEffect(() => {
        if (!idValido) return;
        let vigente = true;
        Promise.all([obtenerEvento(idEvento), listarInscritosEvento(idEvento)])
            .then(([evento, inscritos]) => {
                if (!vigente) return;
                setDatos({ evento, inscritos });
                setError('');
            })
            .catch((err: unknown) => {
                console.error('No se pudieron cargar los inscritos del evento:', err);
                if (vigente) setError(mensajeDeError(err));
            });
        return () => {
            vigente = false;
        };
    }, [idEvento, idValido, recarga]);

    const volver = () => (router.canGoBack() ? router.back() : router.replace('/eventos'));

    const criterio = busqueda.trim().toLocaleLowerCase('es-CO');
    const inscritos = datos?.inscritos ?? [];
    const visibles = criterio
        ? inscritos.filter(
              ({ nombre, correo }) =>
                  nombre.toLocaleLowerCase('es-CO').includes(criterio) ||
                  correo.toLocaleLowerCase('es-CO').includes(criterio),
          )
        : inscritos;
    const asistieron = inscritos.filter(({ asistio }) => asistio).length;
    const fechaInicio = datos ? new Date(datos.evento.fechaInicio) : null;
    const dia = fechaInicio ? formatoDia.format(fechaInicio).replace(/\./g, '') : '';

    return (
        <ThemedView style={styles.flex}>
            <EncabezadoApp />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.contenido}>
                <Pressable accessibilityRole="link" hitSlop={12} onPress={volver} style={styles.volver}>
                    <SymbolView
                        name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                        size={18}
                        tintColor={theme.primary}
                    />
                    <ThemedText type="smallBold" themeColor="primary" style={styles.textoVolver}>
                        Volver al evento
                    </ThemedText>
                </Pressable>

                {!idValido && (
                    <ThemedText type="small" themeColor="textSecondary">
                        No se encontró el evento solicitado.
                    </ThemedText>
                )}

                {!!error && (
                    <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                        {error}
                    </ThemedText>
                )}

                {cargando && (
                    <SkeletonEstado etiqueta="Cargando inscritos" style={styles.bloques}>
                        <Skeleton style={{ height: 28, width: '80%' }} />
                        <Skeleton style={{ height: 16, width: '60%' }} />
                        <Skeleton style={{ height: 72, width: '100%' }} />
                        <Skeleton style={{ height: 56, width: '100%' }} />
                        <Skeleton style={{ height: 56, width: '100%' }} />
                    </SkeletonEstado>
                )}

                {!!datos && !!fechaInicio && (
                    <>
                        <View style={styles.bloques}>
                            <ThemedText type="smallBold" accessibilityRole="header" style={styles.titulo}>
                                {datos.evento.titulo}
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary">
                                {dia.charAt(0).toUpperCase() + dia.slice(1)} · {formatoHora.format(fechaInicio)} ·{' '}
                                {datos.evento.ubicacion}
                            </ThemedText>
                        </View>

                        <View style={styles.resumen}>
                            <View style={[styles.dato, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                    Inscritos
                                </ThemedText>
                                <ThemedText type="smallBold" style={styles.numero}>
                                    {inscritos.length}
                                    <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                        {' '}/ {datos.evento.cuposMaximos}
                                    </ThemedText>
                                </ThemedText>
                            </View>
                            <View style={[styles.dato, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                    Asistieron
                                </ThemedText>
                                <ThemedText type="smallBold" themeColor="success" style={styles.numero}>
                                    {asistieron}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={[styles.buscador, { borderColor: theme.fieldBorder, backgroundColor: theme.surface }]}>
                            <SymbolView
                                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                                size={16}
                                tintColor={theme.textSecondary}
                            />
                            <TextInput
                                accessibilityLabel="Buscar participante"
                                style={[styles.inputBusqueda, { color: theme.text }]}
                                placeholder="Buscar participante"
                                placeholderTextColor={theme.textSecondary}
                                value={busqueda}
                                onChangeText={setBusqueda}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {inscritos.length === 0 ? (
                            <ThemedText type="small" themeColor="textSecondary">
                                Aún no hay inscritos en este evento.
                            </ThemedText>
                        ) : visibles.length === 0 ? (
                            <ThemedText type="small" themeColor="textSecondary">
                                No hay participantes que coincidan con la búsqueda.
                            </ThemedText>
                        ) : (
                            <View style={[styles.lista, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                {visibles.map((inscrito, indice) => (
                                    <View
                                        key={inscrito.inscripcionId}
                                        style={[
                                            styles.fila,
                                            indice > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                                        ]}>
                                        <View style={[styles.avatar, { backgroundColor: theme.softRedBackground }]}>
                                            <ThemedText type="smallBold" themeColor="primary" style={styles.textoChico}>
                                                {iniciales(inscrito.nombre)}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.flex}>
                                            <ThemedText type="smallBold">{inscrito.nombre}</ThemedText>
                                            <ThemedText type="small" themeColor="textSecondary" style={styles.textoChico}>
                                                {inscrito.correo}
                                            </ThemedText>
                                        </View>
                                        <ThemedText
                                            type="smallBold"
                                            style={[
                                                styles.estado,
                                                inscrito.asistio
                                                    ? { backgroundColor: theme.successBackground, color: theme.success }
                                                    : { backgroundColor: theme.disabledButton, color: theme.textSecondary },
                                            ]}>
                                            {inscrito.asistio ? 'Asistió' : 'Pendiente'}
                                        </ThemedText>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    contenido: { padding: Spacing.three, gap: Spacing.three },
    volver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, alignSelf: 'flex-start' },
    textoVolver: { fontSize: 16, lineHeight: 24 },
    bloques: { gap: Spacing.one },
    titulo: { fontSize: 22, lineHeight: 28 },
    resumen: { flexDirection: 'row', gap: Spacing.two },
    dato: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, gap: Spacing.one },
    numero: { fontSize: 20, lineHeight: 28 },
    textoChico: { fontSize: 12, lineHeight: 16 },
    buscador: {
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
    lista: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
    fila: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    estado: {
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
});
