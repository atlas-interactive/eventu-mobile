/**
* Learn more about light and dark modes:
* https://docs.expo.dev/guides/color-schemes/
*/

import { AltoContraste, Colors, Daltonismo } from '@/constants/theme';
import { useAccesibilidad } from '@/context/accesibilidad-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
    const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
    const { altoContraste, daltonismo } = useAccesibilidad();

    // Los ajustes de accesibilidad se aplican encima de la paleta del modo claro u oscuro
    return {
        ...Colors[scheme],
        ...(altoContraste ? AltoContraste[scheme] : {}),
        ...(daltonismo ? Daltonismo[scheme] : {}),
    };
}
