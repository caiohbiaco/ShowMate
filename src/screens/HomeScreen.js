import { FlatList, StyleSheet, Text, View } from 'react-native';
import MovieCard from '../components/MovieCard';
import { featuredItems } from '../data/mockData';

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.logo}>ShowMate</Text>

      <Text style={styles.subtitle}>
        YOUR ENTERTAINMENT COMPANION
      </Text>

      <View style={styles.welcome}>
        <Text style={styles.title}>
          Olá, cinéfilo!
        </Text>

        <Text style={styles.description}>
          O que vamos assistir hoje?
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Em destaque
        </Text>

        <FlatList
          data={featuredItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MovieCard
              title={item.title}
              type={item.type}
              year={item.year}
              genre={item.genre}
            />
          )}
        />
      </View>

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

  logo: {
    color: '#38BDF8',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#94A3B8',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 5,
  },

  welcome: {
    marginTop: 55,
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

  section: {
    flex: 1,
    marginTop: 45,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
});