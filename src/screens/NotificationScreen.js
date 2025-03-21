import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const NotificationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "expense",
      title: "New Expense Added",
      message: "John added a new expense of $50 for dinner",
      tripName: "Summer Vacation 2024",
      timestamp: "2 hours ago",
      read: false,
      icon: "cash-plus",
      iconColor: "#4CAF50",
    },
    {
      id: 2,
      type: "settlement",
      title: "Payment Settlement",
      message: "Alice needs to pay John $150",
      tripName: "Weekend Trip",
      timestamp: "5 hours ago",
      read: false,
      icon: "cash-transfer",
      iconColor: "#2196F3",
    },
    {
      id: 3,
      type: "budget",
      title: "Budget Alert",
      message: "You're approaching your budget limit",
      tripName: "Business Trip",
      timestamp: "1 day ago",
      read: true,
      icon: "alert-circle",
      iconColor: "#FFC107",
    },
    {
      id: 4,
      type: "trip",
      title: "Trip Reminder",
      message: "Your trip to Paris starts in 3 days",
      tripName: "Paris Vacation",
      timestamp: "2 days ago",
      read: true,
      icon: "airplane",
      iconColor: "#9C27B0",
    },
  ]);
  const [buttonScale] = useState(new Animated.Value(1));

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        {
          backgroundColor: theme.cardBackground,
          borderLeftColor: notification.read ? "transparent" : theme.primary,
        },
      ]}
      onPress={() => markAsRead(notification.id)}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: notification.iconColor + "20" },
          ]}
        >
          <MaterialCommunityIcons
            name={notification.icon}
            size={24}
            color={notification.iconColor}
          />
        </View>
        <View style={styles.notificationText}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, { color: theme.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
              {notification.timestamp}
            </Text>
          </View>
          <Text style={[styles.notificationMessage, { color: theme.text }]}>
            {notification.message}
          </Text>
          <Text style={[styles.tripName, { color: theme.primary }]}>
            {notification.tripName}
          </Text>
        </View>
      </View>
      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="bell-off"
        size={64}
        color={theme.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightComponent={
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.markAllReadButton,
                {
                  opacity: hasUnreadNotifications ? 1 : 0.5,
                  backgroundColor: hasUnreadNotifications
                    ? `${theme.primary}15`
                    : "rgba(0,0,0,0.05)",
                },
              ]}
              onPress={markAllAsRead}
              disabled={!hasUnreadNotifications}
            >
              <MaterialCommunityIcons
                name="check-all"
                size={18}
                color={theme.primary}
                style={styles.markAllReadIcon}
              />
              <Text style={[styles.markAllReadText, { color: theme.primary }]}>
                Mark all
              </Text>
              {unreadCount > 0 && (
                <View
                  style={[
                    styles.unreadBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.unreadCount}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        }
      />
      <ScrollView style={styles.content}>
        {notifications.length > 0
          ? notifications.map(renderNotification)
          : renderEmptyState()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  tripName: {
    fontSize: 14,
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
    alignSelf: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  markAllReadIcon: {
    marginRight: 2,
  },
  markAllReadText: {
    fontSize: 13,
    fontWeight: "500",
  },
  unreadBadge: {
    marginLeft: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    alignItems: "center",
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
});
