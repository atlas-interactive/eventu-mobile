import { Redirect } from 'expo-router';

//La ruta inicial abre el catálogo de eventos
export default function Inicio() {
    return <Redirect href="/eventos" />;
}
