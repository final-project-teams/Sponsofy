import React from 'react';
import { StatusBar, LogBox, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import CompanyList from './src/components/company/CompanyList';
import CompanyProfileScreen from './src/screens/CompanyProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import { IconButton } from 'react-native-paper';

// Disable specific warnings
LogBox.ignoreLogs([
  'Require cycle:',
  'Non-serializable values were found in the navigation state',
]);

// Disable the debugger in development
if (__DEV__) {
  const noop = () => {};
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = noop;
  }
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <Stack.Navigator
            initialRouteName="CompanyProfile"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#000',
                elevation: 0, // for Android
                shadowOpacity: 0, // for iOS
                borderBottomWidth: 0,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="CompanyProfile"
              component={CompanyProfileScreen}
              options={{
                title: '',
                headerTransparent: true,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                title: 'Edit Profile',
              }}
            />
            <Stack.Screen
              name="Companies"
              component={CompanyList}
              options={({ navigation }) => ({
                title: 'Sponsofy',
                headerRight: () => (
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton
                      icon="bell"
                      color="#fff"
                      size={24}
                      onPress={() => {}}
                    />
                    <IconButton
                      icon="send"
                      color="#fff"
                      size={24}
                      onPress={() => {}}
                    />
                  </View>
                ),
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}