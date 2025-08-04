import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Card, Provider, Surface, Text } from "react-native-paper";

function getTodayString() {
  const today = new Date();
  return today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchTodayCompletions();
          }
        }
      );

      fetchHabits();
      fetchTodayCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions.map((c) => c["habit-id"]));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try {
      const currentDate = new Date().toISOString();
      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;
      await databases.createDocument(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          "habit-id": id,
          user_id: user.$id,
          title: habit.title,
          description: habit.description,
          streak_count: habit.streak_count,
          last_completed: habit.last_completed,
          frequency: habit.frequency,
          created_at: currentDate,
          completed_at: currentDate,
        }
      );

      await databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    completedHabits?.includes(habitId);

  const renderRightActions = (habitId: string) => (
    <View style={styles.swipeActionRight}>
      {isHabitCompleted(habitId) ? (
        <Text style={{ color: "#fff" }}> Completed!</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        />
      )}
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons
        name="trash-can-outline"
        size={32}
        color={"#fff"}
      />
    </View>
  );

  return (
    <Provider>
      <LinearGradient
        colors={["#b3c6f7", "#e0c3fc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="white-balance-sunny" size={38} color="#6C63FF" />
            </View>
            <Text style={styles.greetingText}>
              {user ? `Hello, ${user.name || "Friend"}` : "Welcome!"}
            </Text>
            <Text style={styles.dateText}>{getTodayString()}</Text>
          </View>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.summaryTitle}>Today's Summary</Text>
              <Text style={styles.summaryText}>
                {habits?.length || 0} habits • {completedHabits?.length || 0} completed
              </Text>
            </Card.Content>
          </Card>
          <View style={styles.quickActionsRow}>
            <Button
              mode="contained"
              icon="plus-circle"
              style={styles.quickActionBtn}
              buttonColor="#6C63FF"
              onPress={() => router.push("/add-habit")}
            >
              Add Habit
            </Button>
            <Button
              mode="contained"
              icon="bed"
              style={styles.quickActionBtn}
              buttonColor="#4caf50"
              onPress={() => router.push("/add-sleep-log")}
            >
              Sleep Log
            </Button>
            <Button
              mode="contained"
              icon="spa"
              style={styles.quickActionBtn}
              buttonColor="#7e57c2"
              onPress={() => router.push("/meditation")}
            >
              Meditation
            </Button>
          </View>
          <Text style={styles.sectionTitle}>Your Habits</Text>
          {habits?.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={48} color="#6C63FF" />
              <Text style={styles.emptyStateText}>
                No Habits yet. Add your first Habit!
              </Text>
            </View>
          ) : (
            habits?.map((habit, key) => (
              <Swipeable
                ref={(ref) => {
                  swipeableRefs.current[habit.$id] = ref;
                }}
                key={key}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={() => renderRightActions(habit.$id)}
                onSwipeableOpen={(direction) => {
                  if (direction === "left") {
                    handleDeleteHabit(habit.$id);
                  } else if (direction === "right") {
                    handleCompleteHabit(habit.$id);
                  }
                  swipeableRefs.current[habit.$id]?.close();
                }}
              >
                <Surface
                  style={[
                    styles.card,
                    isHabitCompleted(habit.$id) && styles.cardCompleted,
                  ]}
                  elevation={2}
                >
                  <View style={styles.cardContentRow}>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={32}
                      color={isHabitCompleted(habit.$id) ? "#4caf50" : "#6C63FF"}
                      style={{ marginRight: 16 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{habit.title}</Text>
                      <Text style={styles.cardDescription}>{habit.description}</Text>
                      <View style={styles.cardFooterRow}>
                        <View style={styles.streakBadge}>
                          <MaterialCommunityIcons
                            name="star"
                            size={18}
                            color={"#FFD600"}
                          />
                          <Text style={styles.streakText}>
                            {habit.streak_count} day streak
                          </Text>
                        </View>
                        <View style={styles.frequencyBadge}>
                          <Text style={styles.frequencyText}>
                            {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Surface>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </Provider>
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
  greetingText: {
    color: "#2d3748",
    fontWeight: "bold",
    fontSize: 26,
    marginBottom: 2,
    textAlign: 'center',
  },
  dateText: {
    color: "#4caf50",
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 0,
    marginBottom: 12,
    backgroundColor: "#f8f7fc",
    borderRadius: 20,
    borderWidth: 0,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryTitle: {
    color: "#6C63FF",
    fontSize: 15,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  summaryText: {
    color: "#2d3748",
    fontSize: 20,
    fontWeight: "bold",
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 18,
  },
  quickActionBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    paddingVertical: 6,
    fontWeight: 'bold',
    fontSize: 16,
    elevation: 2,
  },
  sectionTitle: {
    color: "#2d3748",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 2,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 0,
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#2d3748",
  },
  cardDescription: {
    fontSize: 15,
    marginBottom: 8,
    color: "#4caf50",
  },
  cardFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffde7",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#FFD600",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    backgroundColor: "#e3fcec",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#388e3c",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  emptyStateText: {
    color: "#6C63FF",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
  logoutBtn: {
    marginTop: 12,
    alignSelf: "center",
  },
});
