import { StyleSheet, Text, View } from 'react-native';

export default function MovieCard({ title, type, year, genre }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.info}>
        {type} • {year}
      </Text>

      <Text style={styles.genre}>{genre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  info: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },

  genre: {
    color: '#38BDF8',
    fontSize: 14,
    marginTop: 8,
  },
});