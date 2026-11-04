import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
    const colors = useTheme();

    return (
        <NativeTabs
            backgroundColor={colors.background}
            indicatorColor={colors.backgroundElement}
            labelStyle={{ selected: { color: colors.text } }}>
            <NativeTabs.Trigger name="eventos">
                <NativeTabs.Trigger.Label>Eventos</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon sf="calendar" md="event" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="index" hidden />
        </NativeTabs>
    );
}
