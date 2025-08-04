import { DATABASE_ID, databases, SLEEP_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { LineChart } from "react-native-chart-kit";
import { ScrollView } from "react-native-gesture-handler";
import {
    Button,
    Card,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

interface SleepLog {
  $id: string;
  userID: string;
  date: string;
  hours: number;
  bedtime: string;
  wakeTime: string;
  created_at: string;
}

export default function AddSleepLogScreen() {
  const [sleepHours, setSleepHours] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [error, setError] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Fetch last 7 sleep logs for the user
  const fetchSleepLogs = async () => {
    if (!user) return;
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        SLEEP_COLLECTION_ID,
        []
      );
      // Filter for this user and sort by date descending
      const logs = (res.documents as unknown as SleepLog[])
        .filter((log) => log.userID === user.$id)
        .sort((a, b) => b.date.localeCompare(a.date));
      setSleepLogs(logs);
    } catch (err) {
      setError("Failed to load sleep logs");
    }
  };

  useEffect(() => {
    if (showStats) fetchSleepLogs();
  }, [showStats, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!sleepHours || !bedtime || !wakeTime) {
      setError("Please fill in all fields.");
      return;
    }
    // Get local date string in YYYY-MM-DD
    const localDate = new Date();
    const dateString = localDate.getFullYear() + '-' +
      String(localDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(localDate.getDate()).padStart(2, '0');
    try {
      await databases.createDocument(
        DATABASE_ID,
        SLEEP_COLLECTION_ID,
        ID.unique(),
        {
          userID: user.$id,
          date: dateString,
          hours: parseFloat(sleepHours),
          bedtime,
          wakeTime,
          created_at: new Date().toISOString(),
        }
      );
      setShowStats(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error creating the sleep log");
    }
  };

  // Calculate stats
  const localDate = new Date();
  const today = localDate.getFullYear() + '-' +
    String(localDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(localDate.getDate()).padStart(2, '0');
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // Set to local midnight
    d.setDate(d.getDate() - (6 - i)); // 6 days ago up to today
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  });
  const weeklyLogs = last7.map((date) =>
    sleepLogs.find((log) => log.date === date)
  );
  const avgSleep =
    weeklyLogs.filter(Boolean).reduce((sum, log) => sum + (log?.hours || 0), 0) /
      (weeklyLogs.filter(Boolean).length || 1);
  const todayLog = sleepLogs.find((log) => log.date === today);
  const lastLog = sleepLogs[0];

  return (
    <LinearGradient
      colors={["#b3c6f7", "#e0c3fc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      {!showStats ? (
        <View style={styles.centered}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="bed" size={38} color="#6C63FF" />
              </View>
              <Text style={styles.title}>Add Sleep Log</Text>
              <Text style={styles.subtitle}>Rest well, feel well! Track your sleep for a healthier you.</Text>
              <TextInput
                label="Hours Slept"
                mode="outlined"
                keyboardType="numeric"
                value={sleepHours}
                onChangeText={setSleepHours}
                style={styles.input}
                placeholder="e.g. 7.5"
                theme={{ roundness: 12 }}
              />
              <Text style={styles.helperText}>Enter the total hours you slept last night.</Text>
              <TextInput
                label="Bedtime (e.g. 23:00)"
                mode="outlined"
                value={bedtime}
                onChangeText={setBedtime}
                style={styles.input}
                placeholder="e.g. 23:00"
                theme={{ roundness: 12 }}
              />
              <Text style={styles.helperText}>When did you go to bed?</Text>
              <TextInput
                label="Wake Time (e.g. 07:00)"
                mode="outlined"
                value={wakeTime}
                onChangeText={setWakeTime}
                style={styles.input}
                placeholder="e.g. 07:00"
                theme={{ roundness: 12 }}
              />
              <Text style={styles.helperText}>When did you wake up?</Text>
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!sleepHours || !bedtime || !wakeTime}
                style={styles.button}
                buttonColor="#6C63FF"
                icon="bed"
                contentStyle={{ flexDirection: 'row-reverse' }}
              >
                Add Sleep Log
              </Button>
              {error && <Text style={{ color: theme.colors.error, marginTop: 8 }}>{error}</Text>}
              <Text style={styles.quote}>
                "A good night's sleep is the foundation of wellness."
              </Text>
            </Card.Content>
          </Card>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.statsContentContainer}>
          <Text style={styles.statsTitle}>
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}, {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
          {/* Weekly sleep summary */}
          <View style={styles.weeklyRow}>
            {weeklyLogs.map((log, i) => (
              <View key={i} style={styles.weeklyCircleContainer}>
                <View style={styles.weeklyCircle}>
                  <Text style={styles.weeklyCircleText}>{log ? `${log.hours}h` : "-"}</Text>
                </View>
                <Text style={styles.weeklyDayLabel}>
                  {new Date(last7[i]).toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
              </View>
            ))}
          </View>
          {/* Average sleep */}
          <View style={styles.statsCardsRow}>
            <Card style={styles.statsCardLightCompact}>
              <Card.Content>
                <Text style={styles.statsCardLabel}>Average sleep time this week</Text>
                <Text style={styles.statsCardValue}>{avgSleep.toFixed(1)} hours per day</Text>
              </Card.Content>
            </Card>
          </View>
          {/* Last sleep info */}
          {lastLog && (
            <Card style={styles.lastSleepCardLightCompact}>
              <Card.Content>
                <Text style={styles.lastSleepTitle}>Last sleep information</Text>
                <View style={styles.lastSleepRow}>
                  <View style={styles.lastSleepCol}>
                    <Text style={styles.lastSleepLabel}>Time in sleep</Text>
                    <Text style={styles.lastSleepValue}>{lastLog.hours ? `${lastLog.hours}h` : "-"}</Text>
                  </View>
                  <View style={styles.lastSleepCol}>
                    <Text style={styles.lastSleepLabel}>Wake up time</Text>
                    <Text style={styles.lastSleepValue}>{lastLog.wakeTime || "-"}</Text>
                  </View>
                </View>
                <View style={styles.lastSleepRow}>
                  <View style={styles.lastSleepCol}>
                    <Text style={styles.lastSleepLabel}>Went to bed</Text>
                    <Text style={styles.lastSleepValue}>{lastLog.bedtime || "-"}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
          <View style={{ height: 12 }} />
          {/* Weekly sleep chart */}
          <Card style={styles.chartCardLightCompact}>
            <Card.Content>
              <Text style={styles.chartTitle}>Weekly sleep</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: last7.map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" })),
                    datasets: [
                      {
                        data: weeklyLogs.map((log) => log?.hours || 0),
                        color: () => '#4B2996', // solid dark purple line
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={Math.min(screenWidth - 80, 320)}
                  height={180}
                  chartConfig={{
                    backgroundColor: "#f8f7fc",
                    backgroundGradientFrom: "#f8f7fc",
                    backgroundGradientTo: "#f8f7fc",
                    decimalPlaces: 1,
                    color: () => '#4B2996',
                    labelColor: () => "#7e57c2",
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#4B2996",
                    },
                    propsForBackgroundLines: {
                      stroke: '#e0e0e0',
                    },
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 12, alignSelf: 'center' }}
                />
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
  },
  card: {
    backgroundColor: "#f8f7fc",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 18,
    elevation: 4,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    width: 340,
    maxWidth: '95%',
  },
  iconCircle: {
    backgroundColor: '#e3fcec',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6C63FF",
    marginBottom: 18,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f3f0fa',
    borderRadius: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 6,
    fontWeight: 'bold',
    fontSize: 18,
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  helperText: {
    color: '#888',
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  quote: {
    marginTop: 24,
    color: '#7e57c2',
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.85,
  },
  // Stats view styles
  statsTitle: {
    color: "#2d3748",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  weeklyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  weeklyCircleContainer: {
    alignItems: "center",
    flex: 1,
  },
  weeklyCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f0fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  weeklyCircleText: {
    color: "#6C63FF",
    fontWeight: "bold",
    fontSize: 16,
  },
  weeklyDayLabel: {
    color: "#7e57c2",
    fontSize: 12,
  },
  statsCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statsCardLightCompact: {
    flex: 1,
    backgroundColor: "#f3f0fa",
    marginHorizontal: 4,
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
    maxWidth: 360,
    alignSelf: 'center',
    width: '95%',
  },
  lastSleepCardLightCompact: {
    backgroundColor: "#f3f0fa",
    borderRadius: 14,
    marginBottom: 8,
    padding: 8,
    minHeight: 80,
    maxWidth: 360,
    alignSelf: 'center',
    width: '95%',
  },
  chartCardLightCompact: {
    backgroundColor: "#f3f0fa",
    borderRadius: 14,
    marginBottom: 24,
    padding: 8,
    minHeight: 200,
    maxWidth: 360,
    alignSelf: 'center',
    width: '95%',
  },
  statsContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  statsCardLabel: {
    color: "#7e57c2",
    fontSize: 13,
    marginBottom: 4,
  },
  statsCardValue: {
    color: "#6C63FF",
    fontSize: 22,
    fontWeight: "bold",
  },
  lastSleepTitle: {
    color: "#2d3748",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lastSleepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  lastSleepCol: {
    flex: 1,
    alignItems: "center",
  },
  lastSleepLabel: {
    color: "#7e57c2",
    fontSize: 13,
  },
  lastSleepValue: {
    color: "#6C63FF",
    fontSize: 16,
  },
  chartTitle: {
    color: "#2d3748",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 