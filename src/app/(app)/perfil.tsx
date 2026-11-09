import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { mensajeDeError } from '@/api/mensajeDeError';
import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Skeleton, SkeletonEstado } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { CambiarContrasena } from '@/features/perfil/components/cambiar-contrasena';
import { DesactivarCuenta } from '@/features/perfil/components/desactivar-cuenta';
import { actualizarPerfil, obtenerPerfil } from '@/features/perfil/services/perfil-service';
import { useTheme } from '@/hooks/use-theme';
import type { PerfilUsuario } from '@/types/perfil';

const ETIQUETA_ROL: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZADOR: 'Organizador',
    USUARIO: 'Usuario',
};

const inicialesNombre = (nombre: string): string =>
    nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toLocaleUpperCase('es-CO'))
        .join('');

const fechaRegistro = (fecha: string | null): string => {
    if (!fecha) return 'No disponible';
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return 'No disponible';
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(valor);
};

export default function Perfil() {
    const theme = useTheme();
    const { actualizarNombre } = useAuth();
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
    const [recarga, setRecarga] = useState(0);
    const [resultadoCarga, setResultadoCarga] = useState<{ recarga: number; error: string } | null>(null);
    const cargando = resultadoCarga?.recarga !== recarga;
    const errorCarga = resultadoCarga?.recarga === recarga ? resultadoCarga.error : '';
    const [editando, setEditando] = useState(false);
    const [nombreEditado, setNombreEditado] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [errorGuardado, setErrorGuardado] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');

    useEffect(() => {
        let vigente = true;
        obtenerPerfil()
            .then((datos) => {
                if (!vigente) return;
                setPerfil(datos);
                setResultadoCarga({ recarga, error: '' });
            })
            .catch((error: unknown) => {
                console.error('No se pudo cargar el perfil:', error);
                if (vigente) {
                    setResultadoCarga({ recarga, error: mensajeDeError(error) });
                }
            });
        return () => {
            vigente = false;
        };
    }, [recarga]);

    const iniciarEdicion = () => {
        if (!perfil) return;
        setNombreEditado(perfil.nombre);
        setErrorGuardado('');
        setMensajeExito('');
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setNombreEditado(perfil?.nombre ?? '');
        setErrorGuardado('');
        setEditando(false);
    };

    const guardarCambios = async () => {
        if (!perfil) return;

        const nombre = nombreEditado.trim();
        if (!nombre) {
            setErrorGuardado('El nombre es obligatorio.');
            return;
        }
        if (nombre.length > 100) {
            setErrorGuardado('El nombre no puede superar los 100 caracteres.');
            return;
        }

        setGuardando(true);
        setErrorGuardado('');
        setMensajeExito('');
        try {
            const actualizado = await actualizarPerfil({
                nombre,
                codigoInstitucional: perfil.codigoInstitucional,
            });
            setPerfil(actualizado);
            setNombreEditado(actualizado.nombre);
            await actualizarNombre(actualizado.nombre);
            setEditando(false);
            setMensajeExito('Tu información se actualizó correctamente.');
        } catch (error: unknown) {
            console.error('No se pudo actualizar el perfil:', error);
            setErrorGuardado(mensajeDeError(error));
        } finally {
            setGuardando(false);
        }
    };

    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView edges={['top']} style={{ backgroundColor: theme.surface }}>
                <View style={[styles.encabezado, { borderBottomColor: theme.border }]}>
                    <ThemedText type="smallBold" style={styles.tituloPagina}>
                        Mi perfil
                    </ThemedText>
                    <BotonCerrarSesion />
                </View>
            </SafeAreaView>
            <KeyboardAvoidingView style={styles.flex} behavior="padding">
                <ScrollView
                    contentInsetAdjustmentBehavior="automatic"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.contenido}>
                    {!!mensajeExito && (
                        <View
                            accessibilityRole="alert"
                            style={[
                                styles.mensaje,
                                { backgroundColor: theme.successBackground, borderColor: theme.success },
                            ]}>
                            <IconoAviso tipo="exito" style={styles.iconoMensaje} />
                            <ThemedText type="small" themeColor="success" style={styles.flex}>
                                {mensajeExito}
                            </ThemedText>
                        </View>
                    )}

                    {cargando && (
                        <SkeletonEstado etiqueta="Cargando perfil" style={styles.tarjeta}>
                            <View style={styles.cabecera}>
                                <Skeleton style={{ width: 64, height: 64, borderRadius: 32 }} />
                                <Skeleton style={{ height: 20, width: '50%' }} />
                            </View>
                            <Skeleton style={{ height: 56, width: '100%' }} />
                        </SkeletonEstado>
                    )}

                    {!!errorCarga && !cargando && (
                        <View accessibilityRole="alert" style={styles.errorCarga}>
                            <ThemedText type="small" themeColor="error">
                                {errorCarga}
                            </ThemedText>
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setRecarga((valor) => valor + 1)}
                                style={[styles.botonBorde, { borderColor: theme.primary }]}>
                                <ThemedText type="smallBold" themeColor="primary">
                                    Reintentar
                                </ThemedText>
                            </Pressable>
                        </View>
                    )}

                    {perfil && !cargando && (
                        <View
                            style={[
                                styles.tarjeta,
                                styles.franja,
                                { backgroundColor: theme.surface, borderColor: theme.border, borderTopColor: theme.primary },
                            ]}>
                            <View style={styles.cabecera}>
                                <View
                                    accessible
                                    accessibilityRole="image"
                                    accessibilityLabel={`Avatar de ${perfil.nombre}`}
                                    style={[styles.avatar, { backgroundColor: theme.softRedBackground }]}>
                                    <ThemedText type="smallBold" themeColor="primary" style={styles.iniciales}>
                                        {inicialesNombre(perfil.nombre)}
                                    </ThemedText>
                                </View>
                                <View style={styles.identidad}>
                                    {!editando && (
                                        <ThemedText type="smallBold" style={styles.nombre}>
                                            {perfil.nombre}
                                        </ThemedText>
                                    )}
                                    <ThemedText
                                        type="small"
                                        style={[styles.rol, { backgroundColor: theme.softRedBackground, color: theme.primary }]}>
                                        {ETIQUETA_ROL[perfil.rol.toUpperCase()] ?? perfil.rol}
                                    </ThemedText>
                                </View>
                            </View>

                            {editando ? (
                                <View style={styles.formulario}>
                                    <ThemedText type="small">Nombre completo</ThemedText>
                                    <TextInput
                                        accessibilityLabel="Nombre completo"
                                        value={nombreEditado}
                                        onChangeText={setNombreEditado}
                                        maxLength={100}
                                        autoFocus
                                        editable={!guardando}
                                        style={[
                                            styles.input,
                                            { borderColor: theme.fieldBorder, backgroundColor: theme.surface, color: theme.text },
                                        ]}
                                    />
                                    {!!errorGuardado && (
                                        <ThemedText type="small" themeColor="error" accessibilityRole="alert">
                                            {errorGuardado}
                                        </ThemedText>
                                    )}
                                    <View style={styles.acciones}>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityState={{ disabled: guardando, busy: guardando }}
                                            disabled={guardando}
                                            onPress={guardarCambios}
                                            style={[styles.botonLleno, { backgroundColor: theme.primary }, guardando && styles.deshabilitado]}>
                                            <ThemedText type="smallBold" themeColor="onPrimary">
                                                {guardando ? 'Guardando…' : 'Guardar cambios'}
                                            </ThemedText>
                                        </Pressable>
                                        <Pressable
                                            accessibilityRole="button"
                                            disabled={guardando}
                                            onPress={cancelarEdicion}
                                            style={[styles.botonBorde, { borderColor: theme.fieldBorder }]}>
                                            <ThemedText type="small">Cancelar</ThemedText>
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <View style={[styles.dato, { backgroundColor: theme.background }]}>
                                        <View style={styles.etiquetaDato}>
                                            <SymbolView
                                                name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                                                size={16}
                                                tintColor={theme.primary}
                                            />
                                            <ThemedText type="small" themeColor="textSecondary">
                                                Correo institucional
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="small">{perfil.correo}</ThemedText>
                                    </View>
                                    <View style={[styles.dato, { backgroundColor: theme.background }]}>
                                        <View style={styles.etiquetaDato}>
                                            <SymbolView
                                                name={{ ios: 'calendar', android: 'event', web: 'event' }}
                                                size={16}
                                                tintColor={theme.primary}
                                            />
                                            <ThemedText type="small" themeColor="textSecondary">
                                                Miembro desde
                                            </ThemedText>
                                        </View>
                                        <ThemedText type="small">{fechaRegistro(perfil.creadoEn)}</ThemedText>
                                    </View>
                                    <Pressable
                                        accessibilityRole="button"
                                        onPress={iniciarEdicion}
                                        style={[styles.botonBorde, styles.editar, { borderColor: theme.primary }]}>
                                        <SymbolView
                                            name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                                            size={16}
                                            tintColor={theme.primary}
                                        />
                                        <ThemedText type="small" themeColor="primary">
                                            Editar información
                                        </ThemedText>
                                    </Pressable>
                                </>
                            )}
                        </View>
                    )}

                    {perfil && !cargando && <CambiarContrasena onMensajeExito={setMensajeExito} />}
                    {perfil && !cargando && <DesactivarCuenta />}
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingLeft: Spacing.three,
        paddingRight: Spacing.two,
    },
    tituloPagina: { fontSize: 18, lineHeight: 26 },
    contenido: { padding: Spacing.three, gap: Spacing.three },
    mensaje: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.two,
        borderWidth: 1,
        borderRadius: 4,
        padding: Spacing.two,
    },
    iconoMensaje: { marginTop: 2 },
    errorCarga: { gap: Spacing.two, alignItems: 'flex-start' },
    tarjeta: { gap: Spacing.three, borderWidth: 1, borderRadius: 8, padding: Spacing.three },
    franja: { borderTopWidth: 6 },
    cabecera: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
    avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    iniciales: { fontSize: 20, lineHeight: 28 },
    identidad: { flex: 1, alignItems: 'flex-start', gap: Spacing.one },
    nombre: { fontSize: 18, lineHeight: 26 },
    rol: {
        borderRadius: 9999,
        paddingHorizontal: 10,
        paddingVertical: 2,
        fontSize: 12,
        lineHeight: 16,
        overflow: 'hidden',
    },
    dato: { borderRadius: 6, padding: 12, gap: Spacing.one },
    etiquetaDato: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    formulario: { gap: Spacing.two },
    input: {
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        fontFamily: 'AtkinsonHyperlegible_400Regular',
        fontSize: 14,
    },
    acciones: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
    botonLleno: {
        minHeight: 44,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.three,
    },
    botonBorde: {
        minHeight: 44,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.two,
        paddingHorizontal: Spacing.three,
    },
    editar: { alignSelf: 'flex-start' },
    deshabilitado: { opacity: 0.6 },
});
