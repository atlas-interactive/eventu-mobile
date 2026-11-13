import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 2000;

// Animación de entrada muestra el logo sobre el fondo y lo desvanece al abrir la app
export function AnimatedSplashOverlay() {
    const [animate, setAnimate] = useState(false);
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const splashKeyframe = new Keyframe({
        0: {
            transform: [{ scale: 1 }],
            opacity: 1,
        },
        40: {
            opacity: 1,
        },
        80: {
            opacity: 0,
            easing: Easing.elastic(0.7),
        },
        100: {
            opacity: 0,
            transform: [{ scale: 1 }],
            easing: Easing.elastic(0.7),
        },
    });

    const image = <Image style={styles.image} source={require('@/assets/images/logo-unillanos.png')} />;

    return animate ? (
        <Animated.View
            entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
                'worklet';
                if (finished) {
                    scheduleOnRN(setVisible, false);
                }
            })}
            style={styles.splashOverlay}>
            {image}
        </Animated.View>
    ) : (
        <View
            onLayout={() => {
                SplashScreen.hideAsync().finally(() => {
                    setAnimate(true);
                });
            }}
            style={styles.splashOverlay}>
            {image}
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 110,
        height: 108,
    },
    splashOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
});
