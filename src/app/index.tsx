import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { login } from '@/services/authService';

export default function HomeScreen() {
  const [resultado, setResultado] = useState('Iniciando sesión...');

  useEffect(() => {
    login({
      correo: 'pruebaM@unillanos.edu.co',
      password: 'pruebaM123',
    })
      .then((r) => setResultado('LOGIN OK\n' + JSON.stringify(r, null, 2)))
      .catch((e) => setResultado('LOGIN ERROR\n' + e.message));
  }, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <ThemedText>{resultado}</ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}