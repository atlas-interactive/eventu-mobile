import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { mensajeDeError } from '@/api/mensajeDeError';
import { ThemedText } from '@/components/themed-text';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { desactivarCuenta } from '@/features/perfil/services/perfil-service';
import { useTheme } from '@/hooks/use-theme';

const restricciones = [
    'Si eres el único administrador activo, no podrás desactivar tu cuenta.',
    'Si eres organizador, primero debes cancelar o esperar a que finalicen tus eventos publicados.',
    'Tus inscripciones activas a eventos que aún no inician se cancelarán y sus cupos se liberarán. Las asistencias ya registradas se conservarán.',
];

export function DesactivarCuenta() {
    const theme = useTheme();
    const { cerrarSesion, mostrarAvisoLogin } = useAuth();
    const [modalDesactivacionAbierto, setModalDesactivacionAbierto] = useState(false);
    const [passwordDesactivacion, setPasswordDesactivacion] = useState('');
    const [desactivandoCuenta, setDesactivandoCuenta] = useState(false);
    const [errorDesactivacion, setErrorDesactivacion] = useState('');

    const abrirModalDesactivacion = () => {
        setPasswordDesactivacion('');
        setErrorDesactivacion('');
        setModalDesactivacionAbierto(true);
    };

    const cerrarModalDesactivacion = () => {
        if (desactivandoCuenta) return;
        setModalDesactivacionAbierto(false);
        setPasswordDesactivacion('');
        setErrorDesactivacion('');
    };

    const confirmarDesactivacion = async () => {
        if (desactivandoCuenta || !passwordDesactivacion.trim()) {
            setErrorDesactivacion('Ingresa tu contraseña para confirmar la desactivación.');
            return;
        }

        setDesactivandoCuenta(true);
        setErrorDesactivacion('');
        try {
            const respuesta = await desactivarCuenta(passwordDesactivacion);
            // Al cerrar la sesión la app vuelve sola al login, donde se muestra el mensaje
            mostrarAvisoLogin(respuesta.mensaje);
            await cerrarSesion();
        } catch (error: unknown) {
            console.error('No se pudo desactivar la cuenta:', error);
            setPasswordDesactivacion('');
            setErrorDesactivacion(mensajeDeError(error));
        } finally {
            setDesactivandoCuenta(false);
        }
    };

    const sinPassword = !passwordDesactivacion.trim();

    return (
        <View
            style={[
                styles.tarjeta,
                { backgroundColor: theme.surface, borderColor: theme.border, borderTopColor: theme.primary },
            ]}>
            <View style={styles.titulo}>
                <SymbolView
                    name={{ ios: 'exclamationmark.shield', android: 'gpp_maybe', web: 'gpp_maybe' }}
                    size={18}
                    tintColor={theme.primary}
                />
                <ThemedText type="smallBold" accessibilityRole="header" style={styles.textoTitulo}>
                    Desactivar cuenta
                </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary">
                Tu cuenta se conservará y podrás reactivarla iniciando sesión de nuevo. Antes de continuar, ten en
                cuenta estas restricciones:
            </ThemedText>
            <View style={styles.lista}>
                {restricciones.map((restriccion) => (
                    <View key={restriccion} style={styles.itemLista}>
                        <ThemedText type="small" themeColor="textSecondary">
                            •
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
                            {restriccion}
                        </ThemedText>
                    </View>
                ))}
            </View>
            <Pressable
                accessibilityRole="button"
                onPress={abrirModalDesactivacion}
                style={[styles.botonBorde, { borderColor: theme.primary }]}>
                <ThemedText type="small" themeColor="primary">
                    Desactivar mi cuenta
                </ThemedText>
            </Pressable>

            {modalDesactivacionAbierto && (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={cerrarModalDesactivacion}>
                    <View style={styles.contenedor}>
                        <Pressable
                            accessibilityLabel="Cerrar"
                            onPress={cerrarModalDesactivacion}
                            style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay }]}
                        />
                        <View accessibilityViewIsModal style={[styles.modal, { backgroundColor: theme.surface }]}>
                            <View style={[styles.icono, { backgroundColor: theme.softRedBackground }]}>
                                <SymbolView
                                    name={{ ios: 'exclamationmark.shield', android: 'gpp_maybe', web: 'gpp_maybe' }}
                                    size={20}
                                    tintColor={theme.primary}
                                />
                            </View>
                            <ThemedText type="smallBold" accessibilityRole="header" style={styles.tituloModal}>
                                Confirmar desactivación de cuenta
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                                Ingresa tu contraseña para confirmar. Se cerrará tu sesión y podrás reactivar tu cuenta al
                                iniciar sesión de nuevo.
                            </ThemedText>
                            <View style={styles.campo}>
                                <ThemedText type="small">Contraseña actual</ThemedText>
                                <TextInput
                                    accessibilityLabel="Contraseña actual"
                                    value={passwordDesactivacion}
                                    onChangeText={setPasswordDesactivacion}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    textContentType="password"
                                    autoFocus
                                    editable={!desactivandoCuenta}
                                    style={[
                                        styles.input,
                                        { borderColor: theme.fieldBorder, backgroundColor: theme.surface, color: theme.text },
                                    ]}
                                />
                            </View>
                            {!!errorDesactivacion && (
                                <View accessibilityRole="alert" style={styles.error}>
                                    <IconoAviso tipo="error" style={styles.iconoError} />
                                    <ThemedText type="small" themeColor="error" style={styles.flex}>
                                        {errorDesactivacion}
                                    </ThemedText>
                                </View>
                            )}
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ disabled: desactivandoCuenta || sinPassword, busy: desactivandoCuenta }}
                                disabled={desactivandoCuenta || sinPassword}
                                onPress={confirmarDesactivacion}
                                style={[
                                    styles.boton,
                                    { backgroundColor: theme.primary },
                                    (desactivandoCuenta || sinPassword) && styles.deshabilitado,
                                ]}>
                                <ThemedText type="smallBold" themeColor="onPrimary">
                                    {desactivandoCuenta ? 'Desactivando…' : 'Confirmar desactivación'}
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityState={{ disabled: desactivandoCuenta }}
                                disabled={desactivandoCuenta}
                                onPress={cerrarModalDesactivacion}
                                style={styles.boton}>
                                <ThemedText type="small">Volver</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    tarjeta: { gap: 12, borderWidth: 1, borderTopWidth: 6, borderRadius: 8, padding: Spacing.three },
    titulo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    textoTitulo: { fontSize: 16, lineHeight: 24 },
    lista: { gap: Spacing.two },
    itemLista: { flexDirection: 'row', gap: Spacing.two },
    botonBorde: {
        minHeight: 44,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.three,
    },
    contenedor: { flex: 1, justifyContent: 'center', padding: Spacing.four },
    modal: { borderRadius: 16, padding: Spacing.four, gap: Spacing.two, alignItems: 'center' },
    icono: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    tituloModal: { fontSize: 18, lineHeight: 26, marginTop: Spacing.one, textAlign: 'center' },
    centrado: { textAlign: 'center' },
    campo: { gap: Spacing.one, alignSelf: 'stretch' },
    input: {
        minHeight: 44,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        fontFamily: 'AtkinsonHyperlegible_400Regular',
        fontSize: 14,
    },
    error: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, alignSelf: 'stretch' },
    iconoError: { marginTop: 2 },
    boton: {
        minHeight: 44,
        alignSelf: 'stretch',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deshabilitado: { opacity: 0.6 },
});
