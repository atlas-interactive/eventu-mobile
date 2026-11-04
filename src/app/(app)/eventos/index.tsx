import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';


export default function CatalogoEventos() {
    return (
        <ThemedView style={styles.contenedor}>
            <ThemedText themeColor="textSecondary">catalogo de eventos zzz.</ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
});
