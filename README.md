# TripExpanse Mobile App

A modern React Native mobile application for managing travel expenses and trips with a beautiful UI, dark/light theme support, and seamless user experience.

## Features

### Authentication & User Management

- 🔐 Secure user authentication system
- 📱 Mobile number verification
- 🌐 Google Sign-in integration
- 🔑 Password recovery functionality
- ✨ Smooth onboarding experience

### UI/UX Features

- 🌓 Dynamic Theme Switching (Dark/Light mode)
- 🎨 Modern and clean user interface
- 📱 Responsive design for all screen sizes
- ⚡ Smooth animations and transitions
- 🔄 Form validation with error handling

## Tech Stack

- **React Native** - Mobile application framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Context API** - State management
- **React Native Vector Icons** - Icon library
- **React Native Reanimated** - Animation library

## Project Structure

```
Mobile_2/
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/           # Application screens
│   ├── context/           # Context providers
│   ├── navigation/        # Navigation configuration
│   └── theme/            # Theme configuration
├── assets/               # Images, fonts, etc.
└── App.js               # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd Mobile_2
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npx expo start
```

## Key Components

### ThemeToggle

- Custom toggle switch for theme switching
- Smooth animation effects
- Visual feedback with icons

### Authentication Screens

- **Login Screen**: Email/password login with Google sign-in option
- **Register Screen**: User registration with form validation
- **Forgot Password Screen**: Password recovery workflow

## Theme System

The app uses a dynamic theming system with two modes:

### Light Theme

- Clean, bright interface
- High contrast for readability
- Subtle shadows and depth

### Dark Theme

- Eye-friendly dark mode
- Carefully selected dark palette
- Maintained accessibility

## Form Validation

Comprehensive form validation including:

- Required field validation
- Email format verification
- Password strength requirements
- Mobile number format checking
- Terms & conditions agreement

## Best Practices

- ♿ Accessibility considerations
- 📱 Platform-specific adaptations
- 🔒 Secure data handling
- 🎨 Consistent styling
- ⚡ Performance optimizations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Biometric authentication
- [ ] Multi-language support
- [ ] Offline data persistence
- [ ] Enhanced animations
- [ ] Push notifications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [support@tripexpanse.com](mailto:support@tripexpanse.com) or join our Slack channel.

## Detailed Screen Documentation

### 1. Welcome Screen

- **Purpose**: Initial entry point displaying app branding
- **Duration**: Auto-navigates after 2 seconds
- **Components**:
  - Mountain illustration (theme-aware)
  - Status bar adaptation
  - Brand text elements
- **Theme Integration**:
  ```javascript
  <View style={[styles.container, { backgroundColor: theme.background }]}>
    <StatusBar
      barStyle={theme.dark ? "light-content" : "dark-content"}
      backgroundColor={theme.background}
    />
  </View>
  ```

### 2. Onboarding Screen

- **Features**:
  - Swipeable carousel (3 screens)
  - Progress indicators
  - Theme toggle
  - "Get Started" button
- **Slides Content**:
  1. "Explore the world easily"
  2. "Reach your destination"
  3. "Connect with travelers"
- **Navigation**:
  - Swipe gestures
  - Next button
  - Skip option
- **Theme Integration**:
  ```javascript
  const styles = {
    slideContainer: {
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      color: theme.text,
      fontSize: 24,
    },
  };
  ```

### 3. Register Screen

- **Input Fields**:
  - Full Name
  - Email
  - Mobile Number
  - Password
  - Confirm Password
- **Validation Rules**:
  ```javascript
  const validations = {
    name: /^[A-Za-z\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mobile: /^[0-9]{10}$/,
    password: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/,
  };
  ```
- **Features**:
  - Real-time validation
  - Google Sign-up option
  - Terms & Conditions checkbox
  - Navigation to Login
- **Theme Integration**:
  - Input backgrounds: theme.secondary
  - Error states: theme.error
  - Button colors: theme.primary

### 4. Login Screen

- **Components**:
  - Email input
  - Password input
  - Remember Me toggle
  - Forgot Password link
  - Google Sign-in button
- **Features**:
  - Secure password entry
  - Form validation
  - Social authentication
  - Remember Me functionality
- **Theme Integration**:
  - Text colors: theme.text
  - Input backgrounds: theme.secondary
  - Links: theme.primary

### 5. Forgot Password Screen

- **Flow**:
  1. Email input
  2. Verification code
  3. New password setup
- **Features**:
  - Email validation
  - Reset link generation
  - Success/error messages
- **Theme Integration**:
  - Background: theme.background
  - Button colors: theme.primary
  - Message colors: theme.success/theme.error

## Comprehensive Theme System

### Theme Context

```javascript
const ThemeContext = createContext({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
});
```

### Theme Tokens

```javascript
const lightTheme = {
  // Base Colors
  primary: "#6c63ff",
  secondary: "#F4F4FB",
  background: "#FFFFFF",
  surface: "#F8F9FA",

  // Text Colors
  text: "#000000",
  textSecondary: "#666666",
  textTertiary: "#999999",

  // Status Colors
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",

  // Component Specific
  inputBackground: "#F4F4FB",
  cardBackground: "#FFFFFF",
  divider: "#E5E5E5",

  // Interactive States
  buttonHover: "#5B53FF",
  buttonPressed: "#4A43FF",

  // Elevation
  elevation1: "0px 1px 3px rgba(0,0,0,0.1)",
  elevation2: "0px 2px 6px rgba(0,0,0,0.15)",
};

const darkTheme = {
  // Base Colors
  primary: "#7C74FF",
  secondary: "#2C2C2E",
  background: "#000000",
  surface: "#1C1C1E",

  // Text Colors
  text: "#FFFFFF",
  textSecondary: "#EBEBF5",
  textTertiary: "#8E8E93",

  // Status Colors
  error: "#FF453A",
  success: "#32D74B",
  warning: "#FF9F0A",

  // Component Specific
  inputBackground: "#2C2C2E",
  cardBackground: "#1C1C1E",
  divider: "#38383A",

  // Interactive States
  buttonHover: "#8C85FF",
  buttonPressed: "#6B63FF",

  // Elevation
  elevation1: "0px 1px 3px rgba(0,0,0,0.2)",
  elevation2: "0px 2px 6px rgba(0,0,0,0.25)",
};
```

### Theme Usage Examples

#### 1. Basic Styling

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    padding: 20,
  },
  text: {
    color: theme.text,
    fontSize: 16,
  },
});
```

#### 2. Component Theming

```javascript
const ThemedButton = ({ onPress, title }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.primary,
          shadowColor: theme.text,
        },
      ]}
      onPress={onPress}
    >
      <Text style={{ color: theme.background }}>{title}</Text>
    </TouchableOpacity>
  );
};
```

#### 3. Dynamic Styles

```javascript
const getDynamicStyles = (theme, state) => ({
  input: {
    backgroundColor: state.isError ? theme.error : theme.inputBackground,
    borderColor: state.isFocused ? theme.primary : theme.divider,
    color: theme.text,
  },
});
```

### Theme Switching Animation

```javascript
const animatedValue = useRef(new Animated.Value(0)).current;

const handleThemeChange = () => {
  Animated.spring(animatedValue, {
    toValue: isDarkMode ? 0 : 1,
    useNativeDriver: false,
  }).start();
  toggleTheme();
};
```

## Development Guidelines

### Theme Best Practices

1. **Consistency**

   - Use theme tokens for all colors
   - Maintain consistent spacing
   - Follow typography scale

2. **Accessibility**

   - Maintain contrast ratios
   - Support dynamic text sizes
   - Include focus states

3. **Performance**

   - Memoize theme-dependent styles
   - Use StyleSheet.create
   - Optimize animations

4. **Maintenance**
   - Document color usage
   - Keep theme tokens updated
   - Test both themes
