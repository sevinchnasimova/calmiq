import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
    Button,
    Card,
    SegmentedButtons,
    Text,
    TextInput,
    useTheme,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to create a habit");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a habit title");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a habit description");
      return;
    }

    // Check if environment variables are set
    if (!DATABASE_ID || !HABITS_COLLECTION_ID) {
      setError("Database configuration is missing. Please check your environment variables.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title: title.trim(),
          description: description.trim(),
          frequency,
          streak_count: 0,
          last_completed: null,
          created_at: new Date().toISOString(),
        }
      );

      Alert.alert(
        "Success!",
        "Habit created successfully",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error("Error creating habit:", error);
      
      if (error.code === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (error.code === 403) {
        setError("You don't have permission to create habits.");
      } else if (error.code === 404) {
        setError("Database or collection not found. Please check your configuration.");
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("There was an error creating the habit. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#b3c6f7", "#e0c3fc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="plus-circle" size={38} color="#6C63FF" />
          </View>
          <Text style={styles.title}>Create New Habit</Text>
          <Text style={styles.subtitle}>Build positive routines that stick. Start your journey to better habits today.</Text>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Habit Title"
              mode="outlined"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError(""); // Clear error when user types
              }}
              style={styles.input}
              placeholder="e.g., Morning Exercise"
              maxLength={50}
              outlineColor="#e2e8f0"
              activeOutlineColor="#6C63FF"
              left={<TextInput.Icon icon="format-title" color="#6C63FF" />}
            />
            
            <TextInput
              label="Description"
              mode="outlined"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setError(""); // Clear error when user types
              }}
              style={styles.input}
              placeholder="Describe your habit goal and why it's important to you"
              multiline
              numberOfLines={3}
              maxLength={200}
              outlineColor="#e2e8f0"
              activeOutlineColor="#6C63FF"
              left={<TextInput.Icon icon="text" color="#6C63FF" />}
            />
            
            <View style={styles.frequencyContainer}>
              <Text style={styles.frequencyLabel}>Frequency</Text>
              <SegmentedButtons
                value={frequency}
                onValueChange={(value) => setFrequency(value as Frequency)}
                buttons={FREQUENCIES.map((freq) => ({
                  value: freq,
                  label: freq.charAt(0).toUpperCase() + freq.slice(1),
                }))}
                style={styles.segmentedButtons}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={!title.trim() || !description.trim() || isLoading}
          loading={isLoading}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {isLoading ? "Creating Habit..." : "Create Habit"}
        </Button>
        
        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.tipsTitle}>💡 Habit Building Tips</Text>
            <Text style={styles.tipsText}>
              • Start small and build gradually{'\n'}
              • Be specific about your goals{'\n'}
              • Track your progress consistently{'\n'}
              • Celebrate small wins along the way
            </Text>
          </Card.Content>
        </Card>
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
    marginBottom: 24,
  },
  iconCircle: {
    backgroundColor: '#e3fcec',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6C63FF',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 24,
  },
  cardContent: {
    padding: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#f8fafc',
  },
  frequencyContainer: {
    marginBottom: 8,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },
  segmentedButtons: {
    backgroundColor: '#f8fafc',
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});