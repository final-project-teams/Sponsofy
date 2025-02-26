import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from './src/screens/ChatScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import { darkColors, lightColors } from './src/theme/theme';
const lightTheme=lightColors
const Stack = createStackNavigator();
const darkTheme=darkColors
const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  return (
    <NavigationContainer theme={isDarkTheme ? darkTheme : lightTheme}>
      <Stack.Navigator initialRouteName="Chat">
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;