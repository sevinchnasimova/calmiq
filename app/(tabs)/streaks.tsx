import { COMPLETIONS_COLLECTION_ID, databases, HABITS_COLLECTION_ID, MOOD_COLLECTION_ID, SLEEP_COLLECTION_ID } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Query } from 'appwrite';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card, useTheme } from 'react-native-paper';

interface Habit {
  $id: string;
  name: string;
  frequency: string;
  userId: string;
}

interface Completion {
  $id: string;
  habitId: string;
  date: string;
  userId: string;
}

interface SleepLog {
  $id: string;
  hours: number;
  quality: string;
  date: string;
  userId: string;
}

interface MoodLog {
  $id: string;
  mood: number;
  date: string;
  userId: string;
}

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [habitsData, completionsData, sleepData, moodData] = await Promise.all([
        databases.listDocuments(HABITS_COLLECTION_ID, [Query.equal('userId', user!.$id)]),
        databases.listDocuments(COMPLETIONS_COLLECTION_ID, [Query.equal('userId', user!.$id)]),
        databases.listDocuments(SLEEP_COLLECTION_ID, [Query.equal('userId', user!.$id)]),
        databases.listDocuments(MOOD_COLLECTION_ID, [Query.equal('userId', user!.$id)])
      ]);

      setHabits(habitsData.documents as Habit[]);
      setCompletions(completionsData.documents as Completion[]);
      setSleepLogs(sleepData.documents as SleepLog[]);
      setMoodLogs(moodData.documents as MoodLog[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (habitId: string) => {
    const habitCompletions = completions.filter(c => c.habitId === habitId);
    if (habitCompletions.length === 0) return 0;

    const sortedCompletions = habitCompletions
      .map(c => new Date(c.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = sortedCompletions[i];
      completionDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (completionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getHabitStats = () => {
    const habitStats = habits.map(habit => ({
      ...habit,
      currentStreak: calculateStreak(habit.$id),
      totalCompletions: completions.filter(c => c.habitId === habit.$id).length,
      bestStreak: Math.max(calculateStreak(habit.$id), 0) // Simplified for now
    }));

    return habitStats.sort((a, b) => b.currentStreak - a.currentStreak);
  };

  const getSleepStats = () => {
    if (sleepLogs.length === 0) return null;

    const last7Days = sleepLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    const avgHours = last7Days.reduce((sum, log) => sum + log.hours, 0) / last7Days.length;
    const avgQuality = last7Days.reduce((sum, log) => sum + parseInt(log.quality), 0) / last7Days.length;

    return {
      avgHours: avgHours.toFixed(1),
      avgQuality: avgQuality.toFixed(1),
      totalLogs: sleepLogs.length
    };
  };

  const getMoodChartData = () => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const weeklyMoodLogs = last7.map(date => {
      const log = moodLogs.find(m => m.date === date);
      return log ? log.mood : 0;
    });

    return {
      labels: last7.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        data: weeklyMoodLogs,
        color: (opacity = 1) => `rgba(75, 41, 150, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const moodIcons = [
    { icon: 'emoticon-cry-outline', color: '#ff6b6b', value: 1, label: 'Very Bad' },
    { icon: 'emoticon-sad-outline', color: '#ffa726', value: 2, label: 'Bad' },
    { icon: 'emoticon-neutral-outline', color: '#ffd54f', value: 3, label: 'Okay' },
    { icon: 'emoticon-happy-outline', color: '#81c784', value: 4, label: 'Good' },
    { icon: 'emoticon-excited-outline', color: '#4caf50', value: 5, label: 'Great' }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const habitStats = getHabitStats();
  const sleepStats = getSleepStats();
  const moodChartData = getMoodChartData();

  return (
    <LinearGradient colors={["#b3c6f7", "#e0c3fc"]} style={styles.bg}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="star" size={24} color="#4B2996" />
          </View>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your wellness journey</Text>
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>This Week</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Text style={styles.statLabel}>Habits</Text>
                <Text style={styles.statValue}>{habits.length}</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statLabel}>Completions</Text>
                <Text style={styles.statValue}>{completions.length}</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statLabel}>Sleep Logs</Text>
                <Text style={styles.statValue}>{sleepLogs.length}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Habit Rankings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Habit Streaks</Text>
            <Text style={styles.cardDescription}>Your current progress</Text>
            {habitStats.length > 0 ? (
              habitStats.map((habit, index) => (
                <View key={habit.$id} style={styles.rankingRow}>
                  <View style={styles.rankingBadge}>
                    <Text style={styles.rankingBadgeText}>{index + 1}</Text>
                  </View>
                  <View style={styles.rankingHabit}>
                    <Text style={styles.rankingHabitName}>{habit.name}</Text>
                    <Text style={styles.rankingHabitFreq}>{habit.frequency}</Text>
                  </View>
                  <View style={styles.rankingStreak}>
                    <Text style={styles.rankingStreakText}>{habit.currentStreak} days</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No habits yet. Add some to get started!</Text>
            )}
          </Card.Content>
        </Card>

        {/* Sleep Statistics */}
        {sleepStats && (
          <Card style={styles.sleepCard}>
            <Card.Content>
              <Text style={styles.sleepTitle}>Sleep Overview</Text>
              <Text style={styles.sleepText}>Last 7 days average</Text>
              <View style={styles.sleepStatsRow}>
                <View style={styles.sleepStat}>
                  <Text style={styles.sleepStatLabel}>Hours</Text>
                  <Text style={styles.sleepStatValue}>{sleepStats.avgHours}h</Text>
                </View>
                <View style={styles.sleepStat}>
                  <Text style={styles.sleepStatLabel}>Quality</Text>
                  <Text style={styles.sleepStatValue}>{sleepStats.avgQuality}/5</Text>
                </View>
                <View style={styles.sleepStat}>
                  <Text style={styles.sleepStatLabel}>Total Logs</Text>
                  <Text style={styles.sleepStatValue}>{sleepStats.totalLogs}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Weekly Mood Chart */}
        <Card style={styles.moodCard}>
          <Card.Content>
            <Text style={styles.moodChartTitle}>Weekly Mood</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={moodChartData}
                width={Dimensions.get('window').width - 80}
                height={180}
                chartConfig={{
                  backgroundColor: '#f3f0fa',
                  backgroundGradientFrom: '#f3f0fa',
                  backgroundGradientTo: '#f3f0fa',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(75, 41, 150, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(75, 41, 150, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#e0e0e0',
                    strokeWidth: 1
                  }
                }}
                bezier
                fromZero
                style={styles.chart}
                formatYLabel={(y) => Number(y) > 0 ? moodIcons[Number(y) - 1]?.label || '' : ''}
              />
            </View>
            <View style={styles.moodLegendRow}>
              {moodIcons.map((mood) => (
                <View key={mood.value} style={styles.moodLegendItem}>
                  <MaterialCommunityIcons name={mood.icon as any} size={16} color={mood.color} />
                  <Text style={styles.moodLegendLabel}>{mood.value}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Motivational Quote */}
        <Text style={styles.quote}>
          "Every day is a new beginning. Take a deep breath and start again."
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B2996',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2996',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: '#f3f0fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2996',
  },
  card: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2996',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4B2996',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankingBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankingHabit: {
    flex: 1,
  },
  rankingHabitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rankingHabitFreq: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rankingStreak: {
    alignItems: 'flex-end',
  },
  rankingStreakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B2996',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  sleepCard: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sleepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2996',
    marginBottom: 8,
  },
  sleepText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  sleepStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sleepStat: {
    alignItems: 'center',
    backgroundColor: '#f3f0fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  sleepStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sleepStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2996',
  },
  moodCard: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  moodChartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B2996',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  moodLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  moodLegendItem: {
    alignItems: 'center',
  },
  moodLegendLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  quote: {
    textAlign: 'center',
    fontSize: 16,
    color: '#4B2996',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
});
