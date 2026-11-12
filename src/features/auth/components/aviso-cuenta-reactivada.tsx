import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconoAviso } from '@/components/ui/icono-aviso';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AvisoCuentaReactivadaProps {
    onContinuar: () => void;
}

// Al cerrarlo también se continúa a la app, igual que en el web
export function AvisoCuentaReactivada({ onContinuar }: AvisoCuentaReactivadaProps) {
    const theme = useTheme();

    return (
        <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onContinuar}>
            <View style={[styles.contenedor, { backgroundColor: theme.overlay }]}>
                <View accessibilityViewIsModal style={[styles.tarjeta, { backgroundColor: theme.surface }]}>
                    <View style={[styles.icono, { backgroundColor: theme.successBackground }]}>
                        <IconoAviso tipo="exito" />
                    </View>
                    <ThemedText type="smallBold" accessibilityRole="header" style={styles.titulo}>
                        Cuenta reactivada
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.centrado}>
                        Tu cuenta ha sido reactivada correctamente. Puedes continuar a EventU.
                    </ThemedText>
                    <Pressable
                        accessibilityRole="button"
                        onPress={onContinuar}
                        style={[styles.boton, { backgroundColor: theme.primary }]}>
                        <ThemedText type="smallBold" themeColor="onPrimary">
                            Continuar
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, justifyContent: 'center', padding: Spacing.four },
    tarjeta: { borderRadius: 16, padding: Spacing.four, gap: Spacing.two, alignItems: 'center' },
    icono: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    titulo: { fontSize: 18, lineHeight: 26, marginTop: Spacing.one },
    centrado: { textAlign: 'center' },
    boton: {
        minHeight: 44,
        alignSelf: 'stretch',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.two,
    },
});
