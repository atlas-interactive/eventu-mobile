import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';

export function BotonCerrarSesion() {
    const { cerrarSesion } = useAuth();

    return (
        <Pressable
            onPress={cerrarSesion}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            style={styles.boton}>
            <ThemedText type="linkPrimary">Cerrar sesión</ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    boton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
});
