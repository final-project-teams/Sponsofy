import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeProvider } from "./src/theme/ThemeContext";

import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import UserTypeScreen from "./src/screens/UserTypeScreen";
import SignupScreen from "./src/screens/SignupScreen";
import HomeScreen from "./src/screens/homeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SocialAccountsScreen from "./src/screens/SocialAccountsScreen";
import ProfileContent from "./src/screens/ProfileContent";
import EditProfileContent from "./src/screens/EditProfileContent";
import EditProfilePicture from "./src/screens/EditProfilePicture";
import FlashMessage from "react-native-flash-message";
import AddDeal from "./src/screens/AddDeal";
const Stack = createStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserType" component={UserTypeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SocialAccounts" component={SocialAccountsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProfileContent" component={ProfileContent} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfileContent" component={EditProfileContent} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfilePicture" component={EditProfilePicture} options={{ headerShown: false }} />
          <Stack.Screen name="AddDeal" component={AddDeal} options={{ headerShown: false }} />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
