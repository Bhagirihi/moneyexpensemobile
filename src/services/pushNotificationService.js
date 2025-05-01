import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "../config/supabase";
import { Alert } from "react-native";
import { formatCurrency } from "../utils/formatters";

// Function to register for push notifications and save the token
export async function registerForPushNotificationsAsync() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    console.error(
      "Session error:",
      sessionError?.message || "No user session found"
    );
    Alert.alert("Login required to get push notifications!");
    return null;
  }

  if (!Device.isDevice) {
    Alert.alert("Must use physical device for Push Notifications!");
    return null;
  }

  // Check for existing notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus === "denied") {
    Alert.alert(
      "Push notifications are currently denied. Please go to your device settings to enable them."
    );
    return null;
  }

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Failed to get push token for push notification!");
    return null;
  }

  // Get the Expo Push Token
  const { data: tokenData } = await Notifications.getExpoPushTokenAsync();
  const token = tokenData;

  if (token) {
    // Save the token to Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("Error updating token in profiles:", updateError.message);
    }

    console.log("Token saved to Supabase:", token);
  }

  // Set up Android-specific notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}

// Function to send a push notification
export async function sendPushNotification(
  title = "New Notification",
  message = "You have a new notification!"
) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id);

  console.log("user", user[0].expo_push_token);
  const body = {
    to: user[0].expo_push_token,
    sound: "default",
    title: title,
    body: message,
    data: { extraData: "Some extra data if needed" },
  };

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseData = await response.json();

  if (responseData.data) {
    console.log("Push notification sent successfully");
  } else {
    console.error("Failed to send push notification:", responseData);
  }
}

export async function sendNotification(
  type = "info",
  title = "New Notification",
  message = "You have a new notification!",
  tripName = null,
  icon = "dots-horizontal",
  iconColor = "#000000"
) {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error(
        "Session error:",
        sessionError?.message || "No user session found"
      );
      Alert.alert("Login required to get push notifications!");
      return null;
    }
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: session.user.id,
        type: type,
        title: title,
        message: message,
        trip_name: tripName,
        icon: icon,
        icon_color: iconColor,
        read: false, // new notifications are unread by default
      },
    ]);

    if (error) {
      console.error("Error sending notification:", error.message);
      throw new Error(error.message);
    }

    console.log("Notification sent successfully.");
  } catch (err) {
    console.error("sendNotification error:", err.message);
  }
}

// Handle foreground notifications
export function handleForegroundNotifications() {
  Notifications.addNotificationReceivedListener((notification) => {
    console.log("Notification received in foreground:", notification);
    // Handle the notification (show an alert, update UI, etc.)
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("Notification clicked:", response);
    // Handle the user click (navigate, perform an action, etc.)
  });
}

// Handle background notifications
export function handleBackgroundNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      console.log("Notification received in background:", notification);
      // Modify notification behavior (e.g., sound, priority)
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    },
  });
}

export async function sendCreateExpenseBoardNotification({
  boardName,
  icon,
  iconColor,
}) {
  await sendNotification({
    type: "info",
    title: "Expense board created",
    message: "Your expense board has been created successfully",
    tripName: boardName,
    icon: icon,
    iconColor: iconColor,
  });

  await sendPushNotification(
    (message = `Your expense board ${boardName} has been created successfully`),
    (title = "Expense board created")
  );
}

export async function sendExpenseBoardInviteNotification({
  boardName,
  inviteeName,
  icon,
  iconColor,
}) {
  await sendNotification({
    type: "info",
    title: "Expense board invited",
    message: "You have been invited to an expense board",
    tripName: inviteeName,
    icon: icon,
    iconColor: iconColor,
  });
  await sendPushNotification(
    (message = `You have been invited to an expense board ${boardName}`),
    (title = "Expense board invited")
  );
}

export async function sendCreateExpenseNotification({
  boardName,
  icon,
  iconColor,
  expenseName,
  expenseAmount,
}) {
  await sendNotification({
    type: "info",
    title: "Expense created",
    message: `You have created an expense of ${formatCurrency(expenseAmount)}.`,
    tripName: boardName,
    icon: icon,
    iconColor: iconColor,
  });
  await sendPushNotification(
    (message = `You have created ${expenseName} expense of ${expenseAmount}`),
    (title = "Expense created")
  );
}

export async function sendCreateCategoryNotification({
  boardName,
  icon,
  iconColor,
  categoryName,
}) {
  await sendNotification({
    type: "info",
    title: "Category created",
    message: "You have created a category",
    tripName: boardName,
    icon: icon,
    iconColor: iconColor,
    categoryName: categoryName,
  });
  await sendPushNotification(
    (message = `You have created a category ${categoryName}`),
    (title = "Category created")
  );
}

export async function sendExpenseOverBudgetNotification({
  boardName,
  icon,
  iconColor,
  budgetAmount,
  expenseAmount,
}) {
  await sendNotification({
    type: "info",
    title: "Expense over budget",
    message: "You have exceeded your budget",
    tripName: boardName,
    icon: icon,
    iconColor: iconColor,
    budgetAmount: budgetAmount,
    expenseAmount: expenseAmount,
  });
  await sendPushNotification(
    (message = `You have exceeded your budget ${expenseAmount}`),
    (title = "Expense over budget")
  );
}

export async function sendExpenseDeletedNotification({
  boardName = "Board Name",
  icon = "dots-horizontal",
  iconColor = "#000000",
  expenseName = "Expense Name",
  expenseAmount = 0,
}) {
  sendNotification(
    "info",
    "Expense deleted",
    `You have deleted ${expenseName} expense of ${formatCurrency(
      expenseAmount
    )}`,
    boardName,
    icon,
    iconColor,
    expenseName,
    expenseAmount
  );
  sendPushNotification(
    (message = `You have deleted ${expenseName} expense of ${formatCurrency(
      expenseAmount
    )} from ${boardName}`),
    (title = "Expense deleted")
  );
}

export async function sendExpenseBoardDeletedNotification({
  boardName,
  icon,
  iconColor,
}) {
  await sendNotification({
    type: "info",
    title: "Expense board deleted",
    message: "You have deleted an expense board",
    tripName: boardName,
    icon: icon,
    iconColor: iconColor,
  });
  await sendPushNotification(
    (message = `You have deleted an expense board ${boardName}`),
    (title = "Expense board deleted")
  );
}

export async function sendExpenseBoardUpdatedNotification({
  boardName,
  icon,
  iconColor,
}) {
  await sendNotification({
    type: "info",
    title: "Expense board updated",
    message: "You have updated an expense board",
    tripName: boardName,
    icon: icon,
    iconColor: iconColor,
  });
  await sendPushNotification(
    (message = `You have updated an expense board ${boardName}`),
    (title = "Expense board updated")
  );
}
