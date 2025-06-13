# Orbit - Expo Mobile Application

A modern, feature-rich mobile application built with Expo and React Native, designed to provide an exceptional user experience.

## 🚀 Features

- **Modern UI/UX**: Built with Gluestack UI components for a polished look
- **Cross-Platform**: Works seamlessly on both iOS and Android
- **TypeScript**: Type-safe development for better code quality
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Built with performance in mind

## 📋 Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Git
- Expo CLI
- For development:
  - iOS: XCode (for Mac users)
  - Android: Android Studio
  - Expo Go app on your mobile device

## 🛠 Installation

1. Clone the repository:

```bash
git clone https://github.com/arshfx01/orbit-app.git
cd gluestack-ui-starter-kits
```

2. Navigate to the Expo app directory and install dependencies:

```bash
cd expo-app
yarn install
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start the development server
yarn start

# Or use the specific command
yarn expo start
```

### Running on Different Platforms

```bash
# For iOS
yarn ios

# For Android
yarn android

# For web
yarn web
```

## 📱 Testing on Physical Devices

1. Install Expo Go on your mobile device
2. Scan the QR code that appears in the terminal
3. The app will load on your device

## 📁 Project Structure

```
expo-app/
├── assets/           # Images, fonts, and other static assets
├── components/       # Reusable UI components
├── screens/          # App screens and pages
├── navigation/       # Navigation configuration
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── constants/       # App constants and configuration
└── types/           # TypeScript type definitions
```

## 🔧 Development Guidelines

1. **Code Style**:

   - Follow the existing code style
   - Use TypeScript for all new files
   - Write meaningful component and function names

2. **Component Structure**:

   - Keep components small and focused
   - Use Gluestack UI components when possible
   - Implement proper prop typing

3. **State Management**:

   - Use React hooks for local state
   - Follow the established state management patterns

4. **Performance**:
   - Optimize images and assets
   - Use proper list rendering techniques
   - Implement proper memoization where needed

## 🚨 Common Issues and Solutions

### Development Issues

1. **Metro Bundler Issues**:

```bash
# Clear metro bundler cache
yarn start --clear
```

2. **Dependency Issues**:

```bash
# Clear yarn cache and reinstall
yarn cache clean
yarn install
```

3. **Expo Issues**:

```bash
# Update Expo CLI
yarn global add expo-cli
```

### Build Issues

1. **iOS Build Issues**:

   - Ensure XCode is up to date
   - Clean build folder in XCode
   - Reset iOS simulator

2. **Android Build Issues**:
   - Clean Android build
   - Update Android SDK
   - Check Gradle version

## 📦 Building for Production

### iOS Build

```bash
yarn build:ios
```

### Android Build

```bash
yarn build:android
```

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test:coverage
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support:

- Open an issue in the GitHub repository
- Contact the development team
- Check the documentation

---

Made with ❤️ by the Orbit Team
