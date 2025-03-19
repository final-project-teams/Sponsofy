import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import FlashMessage from 'react-native-flash-message';

// Theme and Context Providers
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/socketContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import UserTypeScreen from './src/screens/UserTypeScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/homeScreen';
import SocialAccountsScreen from './src/screens/SocialAccountsScreen';
import ProfileContent from './src/screens/ProfileContent';
import PremiumScreen from './src/screens/PremiumScreen';
import ContractList from './src/screens/ContractList';
import ContractDetail from './src/screens/ContractDetail';
import ChatScreen from './src/screens/ChatScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import AddDeal from './src/screens/AddDeal';
import DealDetailsScreen from './src/screens/DealDetailsScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ContractDeals from './src/screens/ContractDeals';
import DealDetail from './src/screens/DealDetail';
import CreateDeal from './src/screens/CreateDeal';
import DealsScreen from './src/screens/DealsScreen';

// import TermsScreen from './src/screens/TermsScreen';


import CompanyCard from './src/components/CompanyCard';
import CompanyProfile from './src/screens/CompanyProfile';
import EditProfile from './src/screens/EditProfile';

const Stack = createStackNavigator();

const App = () => {
  return (
    <ThemeProvider>
      <SocketProvider>
      <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash">
              {/* Splash and Welcome Screens */}
              <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

              {/* Authentication Screens */}
              <Stack.Screen name="UserType" component={UserTypeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

              {/* Main App Screens */}
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SocialAccounts" component={SocialAccountsScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ProfileContent" component={ProfileContent} options={{ headerShown: false }} />
              <Stack.Screen name="PremiumScreen" component={PremiumScreen} options={{ headerShown: false }} />

              {/* Contract Screens */}
              <Stack.Screen 
                name="Contracts" 
                component={ContractList} 
                options={{ 
                  headerShown: true,
                  title: 'Contracts',
                  headerStyle: {
                    backgroundColor: '#6200ee',
                  },
                  headerTintColor: '#fff',
                }} 
              />
              <Stack.Screen 
                name="ContractDetail" 
                component={ContractDetail} 
                options={{ 
                  headerShown: true,
                  title: 'Contract Details',
                  headerStyle: {
                    backgroundColor: '#6200ee',
                  },
                  headerTintColor: '#fff',
                }} 
              />

              {/* Company-Related Screens */}
              <Stack.Screen name="CompanyProfile" component={CompanyProfile} options={{ headerShown: false }} />
          
              <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
              <Stack.Screen name="CompanyCard" component={CompanyCard} options={{ headerShown: false }} />

              {/* Deal and Contract Screens */}
              <Stack.Screen name="AddDeal" component={AddDeal} options={{ headerShown: false }} />
              <Stack.Screen name="DealDetails" component={DealDetailsScreen} options={{ headerShown: false }} />

              {/* Chat and Communication Screens */}
              <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
              <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />

              {/* Notifications Screen */}
              <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />

              {/* Contract Deals Screen */}
              <Stack.Screen
                name="ContractDeals"
                component={ContractDeals}
                options={{ headerShown: false }}
              />

              {/* Deal Detail Screen */}
              <Stack.Screen
                name="DealDetail"
                component={DealDetail}
                options={{ headerShown: false }}
              />

              {/* Create Deal Screen */}
              <Stack.Screen
                name="CreateDeal"
                component={CreateDeal}
                options={{ headerShown: false }}
              />

              {/* Deals Screen */}
              <Stack.Screen
                name="Deals"
                component={DealsScreen}
                options={{ headerShown: false }}
              />

              {/* <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} /> */}
            </Stack.Navigator>

            {/* Flash Message for Notifications */}
            <FlashMessage position="top" />
          </NavigationContainer>
          </AuthProvider>
        </SocketProvider>
    </ThemeProvider>
)  
};

export default App;