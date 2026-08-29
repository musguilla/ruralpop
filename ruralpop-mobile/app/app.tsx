import { Redirect } from 'expo-router';

export default function AppRoute() {
    // Si el usuario escanea el QR de "Descargar App" pero YA tiene la app instalada en Android,
    // el sistema (App Links) intercepta la URL https://ruralpop.com/app y abre la app en esta ruta.
    // Como ya la tiene instalada, simplemente lo redirigimos a la pantalla principal.
    return <Redirect href="/(tabs)" />;
}
