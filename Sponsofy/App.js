import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import FlashMessage from 'react-native-flash-message';

// Import screens
// import ChatScreen from './src/screens/ChatScreen';
// import VideoCallScreen from './src/screens/VideoCallScreen';
import HomeScreen from './src/screens/homeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import CompanyList from './src/components/company/CompanyList';
import CompanyProfileScreen from './src/screens/CompanyProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ShareProfileScreen from './src/screens/ShareProfileScreen';
import { IconButton } from 'react-native-paper';
import ChatScreen from './src/screens/ChatScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';

const Stack = createStackNavigator();

// Main app component that uses the theme context
const MainApp = () => {
  const { isDarkMode, currentTheme } = useTheme();
  
  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={currentTheme.colors.background} 
      />
      
      <Stack.Navigator initialRouteName="CompanyProfile">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen
          name="CompanyProfile"
          component={CompanyProfileScreen}
          options={({ navigation }) => ({
            title: 'Sponsofy',
            headerTitleStyle: {
              color: '#701FF1',
              fontWeight: 'bold',
            },
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <IconButton
                  icon="bell"
                  color={currentTheme.colors.text}
                  size={24}
                  onPress={() => {}}
                />
                <IconButton
                  icon="send"
                  color={currentTheme.colors.text}
                  size={24}
                  onPress={() => {}}
                />
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{
            title: 'Edit Profile',
          }}
        />
        <Stack.Screen
          name="ShareProfile"
          component={ShareProfileScreen}
          options={{
            title: 'Share Profile',
            headerStyle: {
              backgroundColor: currentTheme.colors.headerBackground || currentTheme.colors.surface,
            },
            headerTintColor: currentTheme.colors.text,
          }}
        />
        <Stack.Screen
          name="Companies"
          component={CompanyList}
          options={{
            title: 'Companies',
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'Chat',
          }}
        />
        <Stack.Screen
          name="VideoCall"
          component={VideoCallScreen}
          options={{
            title: 'Video Call',
          }}
        />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

// Root component that provides the theme
const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;