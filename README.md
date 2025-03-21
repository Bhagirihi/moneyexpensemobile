# TripExpanse Mobile App

A React Native mobile application for managing travel expenses and budgets, built with Expo and Supabase.

## Features

### Authentication & User Management

- Email and password authentication
- Google Sign-in integration
- Email verification flow
- Mobile number verification
- Secure password reset
- Session persistence
- Real-time connection status monitoring

### User Profile

- Profile creation and management
- Email and mobile verification status
- Avatar support
- Profile updates

### Security

- Row Level Security (RLS) implementation
- Secure data access policies
- Environment variable configuration
- Session management

### UI/UX

- Modern, responsive design
- Dark/Light theme support
- Loading states and animations
- Error handling and feedback
- Connection status indicator

## Tech Stack

- **Frontend Framework**: React Native with Expo
- **State Management**: Context API
- **Backend & Authentication**: Supabase
- **Storage**: AsyncStorage
- **Styling**: React Native StyleSheet
- **Navigation**: React Navigation

## Project Structure

```
src/
├── components/         # Reusable UI components
├── config/            # Configuration files
├── context/           # Context providers
├── screens/           # Screen components
├── theme/             # Theme configuration
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tripexpanse-mobile.git
cd tripexpanse-mobile
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

## Development

### Theme System

The app uses a custom theme system that supports both light and dark modes. Theme colors and styles are managed through the ThemeContext.

### Authentication Flow

1. User registration with email and password
2. Email verification
3. Mobile number verification
4. Profile creation
5. Session management

### Database Schema

The app uses Supabase with the following main tables:

- `profiles`: User profile information
- `auth.users`: Authentication data (managed by Supabase)

### Security Features

- Row Level Security (RLS) policies for data access
- Secure session management
- Environment variable protection
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/tripexpanse-mobile](https://github.com/yourusername/tripexpanse-mobile)
