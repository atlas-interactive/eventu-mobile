import { NativeTabs } from 'expo-router/native-tabs';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

// En iOS el espacio de la barra se deja a mano, el automático falla justo después del login
const insetsManuales = Platform.OS === 'ios';

export default function AppTabs() {
    const colors = useTheme();

    return (
        <NativeTabs
            backgroundColor={colors.background}
            indicatorColor={colors.backgroundElement}
            labelStyle={{ selected: { color: colors.text } }}>
            <NativeTabs.Trigger name="eventos" disableAutomaticContentInsets={insetsManuales}>
                <NativeTabs.Trigger.Label>Eventos</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="calendar" md="event" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="inscripciones" disableAutomaticContentInsets={insetsManuales}>
                <NativeTabs.Trigger.Label>Inscripciones</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="ticket" md="confirmation_number" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="perfil" disableAutomaticContentInsets={insetsManuales}>
                <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="person.crop.circle" md="person" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="index" hidden />
        </NativeTabs>
    );
}
