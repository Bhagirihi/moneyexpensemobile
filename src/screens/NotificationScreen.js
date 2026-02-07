import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Header } from "../components/Header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { notificationService } from "../services/notificationService";
import { showToast } from "../utils/toast";
import { formatCurrency } from "../utils/formatters";
import { realTimeSync } from "../services/realTimeSync";
import { useTranslation } from "../hooks/useTranslation";

const formatNotificationDate = (dateString, t) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return t ? t("today") : "Today";
  } else if (date.getTime() === yesterday.getTime()) {
    return t ? t("yesterday") : "Yesterday";
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
    });
  }
};

export const NotificationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchNotifications();
    const subscription = realTimeSync.subscribeToNotifications(
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showToast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
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

      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      showToast.error("Failed to mark all notifications as read");
    }
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);

    if (notification.trip_name) {
      navigation.navigate("ExpenseBoardDetails", {
        boardName: notification.trip_name,
      });
    }
  };

  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = (notification) => (
    console.log("notification", notification),
    (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          {
            backgroundColor: theme.cardBackground,
            borderLeftColor: notification.read ? "transparent" : theme.primary,
          },
        ]}
        onPress={() => handleNotificationPress(notification)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.notificationContent,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: `${notification.icon_color}70` },
            ]}
          >
            <MaterialCommunityIcons
              name={notification.icon}
              size={24}
              color={notification.icon_color}
            />
          </View>
          <View style={styles.notificationText}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, { color: theme.text }]}>
                {notification.title}
              </Text>
              <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                {formatNotificationDate(notification.created_at, t)}
              </Text>
            </View>
            <Text style={[styles.notificationMessage, { color: theme.text }]}>
              {notification.message}
            </Text>
            {notification.trip_name && (
              <View style={styles.tripNameContainer}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={theme.primary}
                  style={styles.tripIcon}
                />
                <Text style={[styles.tripName, { color: theme.primary }]}>
                  {notification.trip_name}
                </Text>
              </View>
            )}
          </View>
        </View>
        {!notification.read && (
          <View
            style={[styles.unreadDot, { backgroundColor: theme.primary }]}
          />
        )}
      </TouchableOpacity>
    )
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
        {t("noNotifications")}
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        {t("noNotificationsMessage")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Header
        title={t("notifications")}
        onBack={() => navigation.goBack()}
        rightComponent={
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
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="check-all"
              size={18}
              color={theme.primary}
              style={styles.markAllReadIcon}
            />

            {unreadCount > 0 && (
              <View
                style={[styles.unreadBadge, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.unreadCount}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.cardBackground}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          renderEmptyState()
        )}
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
    marginTop: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  tripNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  tripIcon: {
    marginRight: 4,
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
    lineHeight: 24,
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  markAllReadIcon: {
    marginRight: 4,
  },
  markAllReadText: {
    fontSize: 13,
    fontWeight: "500",
  },
  unreadBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: "center",
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
});
