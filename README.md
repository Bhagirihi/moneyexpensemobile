# TripExpanse Mobile App

A modern React Native mobile application for managing travel expenses and budgets with a beautiful UI and seamless user experience.

## Features

### Authentication

- **User Registration**

  - Email & Mobile verification
  - Password strength validation
  - Google Sign-up integration
  - Terms & Conditions agreement

- **Login System**

  - Email/Password authentication
  - Google Sign-in
  - Forgot Password recovery
  - Persistent session management

- **Verification System**
  - Two-step verification (Email & Mobile)
  - OTP-based verification
  - Resend functionality with cooldown
  - Real-time validation

### UI/UX Features

- Modern and clean interface
- Smooth animations and transitions
- Theme support (Light/Dark mode)
- Form validation with visual feedback
- Responsive design for all screen sizes

## Tech Stack

- **Frontend**

  - React Native
  - Expo
  - React Navigation
  - Context API for state management
  - Vector Icons

- **UI Components**
  - Custom animated components
  - Material Community Icons
  - Custom form inputs
  - Responsive layouts

## Project Structure

```
Mobile_2/
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── VerificationScreen.js
│   │   └── ForgotPasswordScreen.js
│   ├── context/
│   │   └── ThemeContext.js
│   └── components/
├── App.js
└── package.json
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
git clone https://github.com/Bhagirihi/moneyexpensemobile.git
cd moneyexpensemobile
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
expo start
```

### Running the App

- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan QR code with Expo Go app for physical device

## Development

### Theme System

The app uses a custom theme system that supports:

- Light and dark mode
- Custom color schemes
- Dynamic theme switching
- Consistent styling across components

### Authentication Flow

1. Welcome Screen → Onboarding
2. Registration with validation
3. Two-step verification (Email & Mobile)
4. Login with multiple options
5. Password recovery system

### Verification System

- Separate email and mobile verification
- OTP input with auto-focus
- Resend functionality with 30s cooldown
- Success/Error animations
- Progress tracking between steps

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: [https://github.com/Bhagirihi/moneyexpensemobile](https://github.com/Bhagirihi/moneyexpensemobile)
