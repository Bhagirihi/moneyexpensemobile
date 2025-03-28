import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("app_language");
      const savedCurrency = await AsyncStorage.getItem("app_currency");

      if (savedLanguage) setLanguage(savedLanguage);
      if (savedCurrency) setCurrency(savedCurrency);
    } catch (error) {
      console.error("Error loading app settings:", error);
    }
  };

  const updateLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem("app_language", newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const updateCurrency = async (newCurrency) => {
    try {
      await AsyncStorage.setItem("app_currency", newCurrency);
      setCurrency(newCurrency);
    } catch (error) {
      console.error("Error saving currency:", error);
    }
  };

  return (
    <AppSettingsContext.Provider
      value={{
        language,
        currency,
        updateLanguage,
        updateCurrency,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error(
      "useAppSettings must be used within an AppSettingsProvider"
    );
  }
  return context;
};
