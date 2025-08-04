import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

export default function MeditationPlayerScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const router = useRouter();
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(300);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const durations = [
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
    { label: '20 min', value: 1200 },
  ];

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            Alert.alert(
              'Meditation Complete!',
              'Great job! Your meditation session is complete.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
            return selectedDuration;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, selectedDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration);
  };

  const handleDurationChange = (duration: number) => {
    if (!isRunning) {
      setSelectedDuration(duration);
      setTimeLeft(duration);
    }
  };

  const handleStop = () => {
    Alert.alert(
      'Stop Meditation?',
      'Are you sure you want to stop your meditation session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setIsPaused(false);
            setTimeLeft(selectedDuration);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#b3c6f7', '#e0c3fc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleStop} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#2d3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || 'Meditation'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Timer Display */}
        <Card style={styles.timerCard}>
          <Card.Content style={styles.timerContent}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerLabel}>
                {isRunning ? (isPaused ? 'Paused' : 'Meditating') : 'Ready'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Duration Selection */}
        {!isRunning && (
          <View style={styles.durationSection}>
            <Text style={styles.sectionTitle}>Choose Duration</Text>
            <View style={styles.durationButtons}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.value}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration.value && styles.selectedDuration
                  ]}
                  onPress={() => handleDurationChange(duration.value)}
                >
                  <Text style={[
                    styles.durationButtonText,
                    selectedDuration === duration.value && styles.selectedDurationText
                  ]}>
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controls}>
          {!isRunning ? (
            <Button
              mode="contained"
              onPress={handleStart}
              style={styles.startButton}
              contentStyle={styles.buttonContent}
            >
              <MaterialCommunityIcons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Start Meditation</Text>
            </Button>
          ) : (
            <View style={styles.runningControls}>
              {isPaused ? (
                <Button
                  mode="contained"
                  onPress={handleResume}
                  style={styles.controlButton}
                  contentStyle={styles.buttonContent}
                >
                  <MaterialCommunityIcons name="play" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Resume</Text>
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  onPress={handlePause}
                  style={styles.controlButton}
                  contentStyle={styles.buttonContent}
                >
                  <MaterialCommunityIcons name="pause" size={20} color="#6C63FF" />
                  <Text style={[styles.buttonText, { color: '#6C63FF' }]}>Pause</Text>
                </Button>
              )}
              
              <Button
                mode="outlined"
                onPress={handleReset}
                style={styles.controlButton}
                contentStyle={styles.buttonContent}
              >
                <MaterialCommunityIcons name="refresh" size={20} color="#6C63FF" />
                <Text style={[styles.buttonText, { color: '#6C63FF' }]}>Reset</Text>
              </Button>
            </View>
          )}
        </View>

        {/* Meditation Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.tipsTitle}>Meditation Tips</Text>
            <Text style={styles.tipsText}>
              • Find a comfortable position{'\n'}
              • Focus on your breath{'\n'}
              • Let thoughts pass by without judgment{'\n'}
              • Be patient with yourself
            </Text>
          </Card.Content>
        </Card>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 30,
  },
  timerContent: {
    alignItems: 'center',
    padding: 30,
  },
  timerCircle: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6C63FF',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  durationSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 15,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedDuration: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  selectedDurationText: {
    color: '#fff',
  },
  controls: {
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    elevation: 4,
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    borderRadius: 12,
    borderColor: '#6C63FF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 