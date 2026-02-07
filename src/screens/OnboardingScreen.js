import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  ExploreWorldIllustration,
  ReachSpotIllustration,
  ConnectIllustration,
} from "../components/OnboardingIllustrations";
import ThemeToggle from "../components/ThemeToggle";
import { useTranslation } from "../hooks/useTranslation";

const { width, height } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const slideKeys = [
  {
    id: "1",
    titleKey: "trackTravelExpenses",
    subtitleKey: "keepCostsInOnePlace",
    Illustration: ExploreWorldIllustration,
  },
  {
    id: "2",
    titleKey: "splitBillsEasily",
    subtitleKey: "shareWithCompanions",
    Illustration: ReachSpotIllustration,
  },
  {
    id: "3",
    titleKey: "planYourBudget",
    subtitleKey: "setBudgetsAndTrack",
    Illustration: ConnectIllustration,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slideKeys.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace("Login");
    }
  };

  const renderItem = ({ item, index }) => {
    const { Illustration } = item;
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
    });

    return (
      <Animated.View
        style={[
          styles.slide,
          {
            backgroundColor: theme.background,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.illustrationContainer}>
          <Illustration
            width={width * 0.8}
            height={width * 0.8}
            color={theme.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t(item.titleKey)}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t(item.subtitleKey)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <AnimatedFlatList
          data={slideKeys}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: true,
            }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {slideKeys.map((_, index) => (
              <Animated.View
                key={index.toString()}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      currentIndex === index
                        ? theme.primary
                        : theme.dotInactive,
                    width: currentIndex === index ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={scrollTo}
          >
            <View
              style={[styles.nextButtonInner, { backgroundColor: theme.white }]}
            >
              <Text style={[styles.nextButtonText, { color: theme.primary }]}>
                {currentIndex === slideKeys.length - 1 ? t("getStarted") : "→"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
  },
  themeToggleContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  slide: {
    width,
    paddingHorizontal: 20,
    paddingTop: height * 0.1,
    alignItems: "center",
  },
  illustrationContainer: {
    height: height * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 38,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nextButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: "600",
  },
});

export default OnboardingScreen;
