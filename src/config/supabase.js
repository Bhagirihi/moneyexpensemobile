import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Connection status check
export const checkSupabaseConnection = async () => {
  try {
    // Try to fetch a simple query to check connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase connection error:", error.message);
      return {
        isConnected: false,
        error: error.message,
        status: "error",
      };
    }

    return {
      isConnected: true,
      error: null,
      status: "connected",
    };
  } catch (error) {
    console.error("Supabase connection check failed:", error.message);
    return {
      isConnected: false,
      error: error.message,
      status: "error",
    };
  }
};

// Authentication helpers
export const signUpWithEmail = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: "tripexpanse://verify-email",
      },
    });

    if (error) throw error;

    // The profile will be created automatically by the trigger
    // No need to manually create it here

    return { data, error: null };
  } catch (error) {
    console.error("SignUp error:", error.message);
    return { data: null, error };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user profile
    if (data?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      return { data: { ...data, profile }, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error("SignIn error:", error.message);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("SignOut error:", error.message);
    return { error };
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "tripexpanse://reset-password",
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Reset password error:", error.message);
    return { error };
  }
};

// User profile helpers
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date() })
      .eq("id", userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Update profile error:", error.message);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Get profile error:", error.message);
    return { data: null, error };
  }
};

// Session management
export const getSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return { session };
  } catch (error) {
    console.error("Error getting session:", error.message);
    return { session: null };
  }
};

// Verification helpers
export const sendVerificationOTP = async (type, value) => {
  try {
    // In a real implementation, you would call your backend to send OTP
    // This is a mock implementation
    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { type, value },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const verifyOTP = async (type, value, code) => {
  try {
    // In a real implementation, you would verify OTP with your backend
    const { data, error } = await supabase.functions.invoke("verify-otp", {
      body: { type, value, code },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
