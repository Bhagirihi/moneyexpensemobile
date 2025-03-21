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
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import {
  ExploreWorldIllustration,
  ReachSpotIllustration,
  ConnectIllustration,
} from "../components/OnboardingIllustrations";
import ThemeToggle from "../components/ThemeToggle";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Explore the\nworld easily",
    subtitle: "To your desire",
    Illustration: ExploreWorldIllustration,
  },
  {
    id: "2",
    title: "Reach the\nunknown spot",
    subtitle: "To your destination",
    Illustration: ReachSpotIllustration,
  },
  {
    id: "3",
    title: "Make connects\nwith explora",
    subtitle: "Start your travel trip",
    Illustration: ConnectIllustration,
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate("Login");
    }
  };

  const renderItem = ({ item }) => {
    const { Illustration } = item;
    return (
      <View style={[styles.slide, { backgroundColor: theme.background }]}>
        <View style={styles.illustrationContainer}>
          <Illustration
            width={width * 0.8}
            height={width * 0.8}
            color={theme.illustrationPrimary}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {item.subtitle}
          </Text>
        </View>
      </View>
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
      <View style={styles.content}>
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {slides.map((_, index) => (
              <View
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
            style={[
              styles.nextButton,
              { backgroundColor: theme.nextButtonBackground },
            ]}
            onPress={scrollTo}
          >
            <View
              style={[
                styles.nextButtonInner,
                { backgroundColor: theme.nextButtonInner },
              ]}
            >
              <Text
                style={[styles.nextButtonText, { color: theme.nextButtonText }]}
              >
                →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    top: 50,
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
  },
  illustrationContainer: {
    height: height * 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    paddingTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  },
});

export default OnboardingScreen;
