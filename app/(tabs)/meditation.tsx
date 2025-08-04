import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";

export default function MeditationScreen() {
  const router = useRouter();

  const handleOpenPlayer = (title: string) => {
    router.push({ pathname: "../meditation-player", params: { title } });
  };

  return (
    <LinearGradient
      colors={["#b3c6f7", "#e0c3fc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="spa" size={38} color="#6C63FF" />
          </View>
          <Text style={styles.title}>Meditation</Text>
          <Text style={styles.subtitle}>Find your calm. Choose a session to begin your journey.</Text>
        </View>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <View style={styles.recommendedRow}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleOpenPlayer("Evening Meditation")}> 
            <Card style={styles.largeCard}>
              <Card.Cover
                source={{ uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" }}
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay} />
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Evening Meditation</Text>
                <Text style={styles.cardSubtitle}>Relax and unwind as the sun sets.</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleOpenPlayer("Midnight Meditation")}> 
            <Card style={styles.largeCard}>
              <Card.Cover
                source={{ uri: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80" }}
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay} />
              <Card.Content style={styles.cardContent}>
                <Text style={styles.cardTitle}>Midnight Meditation</Text>
                <Text style={styles.cardSubtitle}>Find peace before sleep.</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>
        <Text style={styles.quote}>
          "Peace comes from within. Take a moment for yourself."
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    backgroundColor: '#e3fcec',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6C63FF',
    marginBottom: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    color: '#2d3748',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 2,
  },
  largeCard: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
    marginLeft: 0,
    marginBottom: 0,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    minWidth: 170,
    maxWidth: 220,
  },
  recommendedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 18,
  },
  cardImage: {
    height: 120,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  cardContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  cardTitle: {
    color: '#2d3748',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#6C63FF',
    fontSize: 13,
    marginTop: 2,
  },
  quote: {
    marginTop: 32,
    color: '#7e57c2',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.85,
  },
}); 