import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>

      <Text style={styles.description}>
        Suas estatísticas e atividades aparecerão aqui.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
    paddingTop: 70,
    paddingHorizontal: 24,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },

  description: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 8,
  },
});