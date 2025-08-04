import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { IconButton, Menu, Text } from "react-native-paper";

export default function TabsLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleNavigate = (route: string) => {
    closeMenu();
    router.push(route as any);
  };

  const handleSignOut = () => {
    closeMenu();
    // You may want to call your signOut logic here
    router.replace("/auth");
  };

  const headerRight = () => (
    <Menu
      visible={menuVisible}
      onDismiss={closeMenu}
      anchor={
        <IconButton
          icon="menu"
          size={28}
          onPress={openMenu}
          accessibilityLabel="Open menu"
        />
      }
      contentStyle={{ backgroundColor: '#fff', borderRadius: 16, minWidth: 200, paddingVertical: 4, elevation: 4 }}
    >
      <Menu.Item
        onPress={() => handleNavigate("/")}
        title={<Text style={{ fontWeight: 'bold', fontSize: 16 }}>Home</Text>}
        leadingIcon={() => <MaterialCommunityIcons name="calendar-today" size={22} color="#6C63FF" />}
        style={{ paddingVertical: 8 }}
      />
      <Menu.Item
        onPress={() => handleNavigate("/meditation")}
        title={<Text style={{ fontWeight: 'bold', fontSize: 16 }}>Meditation</Text>}
        leadingIcon={() => <MaterialCommunityIcons name="spa" size={22} color="#4caf50" />}
        style={{ paddingVertical: 8 }}
      />
      <Menu.Item
        onPress={() => handleNavigate("/add-habit")}
        title={<Text style={{ fontWeight: 'bold', fontSize: 16 }}>Add Habit</Text>}
        leadingIcon={() => <MaterialCommunityIcons name="plus-circle" size={22} color="#2196f3" />}
        style={{ paddingVertical: 8 }}
      />
      <Menu.Item
        onPress={() => handleNavigate("/add-sleep-log")}
        title={<Text style={{ fontWeight: 'bold', fontSize: 16 }}>Add Sleep Log</Text>}
        leadingIcon={() => <MaterialCommunityIcons name="bed" size={22} color="#ff9800" />}
        style={{ paddingVertical: 8 }}
      />
      <Menu.Item
        onPress={() => handleNavigate('/ai-assistant')}
        title={<Text style={{ fontWeight: 'bold', fontSize: 16 }}>AI Assistant</Text>}
        leadingIcon={() => <MaterialCommunityIcons name="robot" size={22} color="#7e57c2" />}
        style={{ paddingVertical: 8 }}
      />
      <Menu.Item
        onPress={handleSignOut}
        title={<Text style={{ fontWeight: 'bold', fontSize: 16, color: '#e53935' }}>Sign Out</Text>}
        leadingIcon={() => <MaterialCommunityIcons name="logout" size={22} color="#e53935" />}
        style={{ paddingVertical: 8 }}
      />
    </Menu>
  );

  const headerTitle = () => (
    <Text style={{ color: "#2d3748", fontWeight: "bold", fontSize: 22, marginLeft: 4 }}>
      Self-Care
    </Text>
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f5f5f5" },
        headerShadowVisible: false,
        headerRight,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#666666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-today"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="plus-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add-sleep-log"
        options={{
          title: "Add Sleep Log",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bed"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meditation"
        options={{
          title: "Meditation",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="spa"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: "AI Assistant",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="robot"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
