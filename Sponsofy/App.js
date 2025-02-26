import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import ChatScreen from './src/ChatScreen';
// import VideoCallScreen from './src/VideoCallScreen';
// import { darkTheme, lightTheme } from './src/themes';

const Stack = createStackNavigator();

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  return (
    <NavigationContainer>
      {/* <Stack.Navigator>
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} /> 
         <Stack.Screen name="VideoCall" component={VideoCallScreen} options={{ headerShown: false }} />
      </Stack.Navigator> */}
    </NavigationContainer>
  );
};

export default App;