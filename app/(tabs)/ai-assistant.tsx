import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, TextInput as RNTextInput, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
}

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI self-care assistant. How can I help you today?",
      sender: 'assistant',
    },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "a",
          text: "I'm here to support your wellness journey! (AI response placeholder)",
          sender: 'assistant',
        },
      ]);
    }, 800);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.sender === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text style={item.sender === 'user' ? styles.userText : styles.assistantText}>{item.text}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#b3c6f7", "#e0c3fc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bg}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="robot" size={38} color="#7e57c2" />
          </View>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Ask me anything about self-care, habits, or wellness!</Text>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          style={{ flex: 1 }}
        />
        <View style={styles.inputRow}>
          <RNTextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <MaterialCommunityIcons name="send" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
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
  chatContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#f3f0fa',
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  assistantText: {
    color: '#2d3748',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f0fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    color: '#2d3748',
  },
  sendBtn: {
    backgroundColor: '#7e57c2',
    borderRadius: 16,
    padding: 8,
  },
}); 