import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotonCerrarSesion } from '@/components/boton-cerrar-sesion';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function Perfil() {
    return (
        <ThemedView style={styles.flex}>
            <SafeAreaView style={styles.contenido}>
                <BotonCerrarSesion />
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    contenido: { flex: 1, padding: Spacing.four },
});
