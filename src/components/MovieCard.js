
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Share,
} from 'react-native';

export default function MovieCard({
  title,
  type,
  year,
  genre,
  poster,
  rating,
  compact = false,
}) {
  async function compartilhar() {
    try {
      await Share.share({
        message: `Estou descobrindo "${title}" no ShowMate!\nTipo: ${type}\nAno: ${year}`,
      });
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
    }
  }

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      {poster ? (
        <Image
          source={{ uri: poster }}
          style={[styles.poster, compact && styles.compactPoster]}
        />
      ) : (
        <View style={[styles.noPoster, compact && styles.compactPoster]}>
          <Text style={styles.noPosterText}>
            Sem pôster
          </Text>
        </View>
      )}

      <View style={[styles.content, compact && styles.compactContent]}>
        <Text
          style={[styles.title, compact && styles.compactTitle]}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text style={styles.info} numberOfLines={1}>
          {type} • {year}
        </Text>

        {genre ? (
          <Text
            style={[styles.genre, compact && styles.compactGenre]}
            numberOfLines={1}
          >
            {genre}
          </Text>
        ) : null}

        {rating ? (
          <Text style={styles.rating}>
            ★ {rating}
          </Text>
        ) : null}

        <Pressable
          style={[styles.shareButton, compact && styles.compactShareButton]}
          onPress={compartilhar}
        >
          <Text style={styles.shareText}>
            Compartilhar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
  },

  compactCard: {
    borderRadius: 12,
    marginTop: 0,
  },

  poster: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },

  compactPoster: {
    height: 155,
  },

  noPoster: {
    width: '100%',
    height: 200,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noPosterText: {
    color: '#94A3B8',
    fontSize: 12,
  },

  content: {
    padding: 16,
  },

  compactContent: {
    padding: 9,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  compactTitle: {
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36,
  },

  info: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },

  genre: {
    color: '#38BDF8',
    fontSize: 14,
    marginTop: 8,
  },

  compactGenre: {
    fontSize: 11,
    marginTop: 5,
  },

  rating: {
    color: '#FACC15',
    fontSize: 13,
    marginTop: 6,
    fontWeight: 'bold',
  },

  shareButton: {
    backgroundColor: '#38BDF8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },

  compactShareButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },

  shareText: {
    color: '#101820',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
