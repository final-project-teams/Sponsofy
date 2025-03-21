import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/axios'; // Adjust the path as necessary

// Initialize WebBrowser for auth sessions
WebBrowser.maybeCompleteAuthSession();

// Instagram app credentials - replace these with your actual credentials
const INSTAGRAM_CLIENT_ID = "YOUR_ACTUAL_INSTAGRAM_CLIENT_ID"; // Replace with your real Instagram app ID
const INSTAGRAM_APP_SECRET = "YOUR_ACTUAL_INSTAGRAM_APP_SECRET"; // Replace with your real Instagram app secret
const INSTAGRAM_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'sponsofy'
});

const authService = {
  instagramLogin: async () => {
    try {
      console.log("Starting Instagram login process");
      console.log("Redirect URI:", INSTAGRAM_REDIRECT_URI);
      
      // Define the Instagram OAuth endpoints
      const discovery = {
        authorizationEndpoint: "https://api.instagram.com/oauth/authorize",
        tokenEndpoint: "https://api.instagram.com/oauth/access_token",
      };

      // Create the auth request with proper configuration
      const authRequest = new AuthSession.AuthRequest({
        clientId: INSTAGRAM_CLIENT_ID,
        scopes: ['user_profile', 'user_media'],
        redirectUri: INSTAGRAM_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: false, // Instagram doesn't support PKCE
      });

      console.log("Auth request created, starting auth flow");
      
      // Start the auth flow
      const result = await authRequest.promptAsync(discovery);
      console.log("Auth result:", result);

      if (result.type === "success" && result.params.code) {
        console.log("Auth successful, exchanging code for token");
        
        // Exchange the code for an access token
        const formData = new FormData();
        formData.append('client_id', INSTAGRAM_CLIENT_ID);
        formData.append('client_secret', INSTAGRAM_APP_SECRET);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
        formData.append('code', result.params.code);
        
        const tokenResponse = await fetch(discovery.tokenEndpoint, {
          method: "POST",
          body: formData
        });

        const data = await tokenResponse.json();
        console.log("Token response:", data);

        if (data.access_token) {
          await AsyncStorage.setItem("instagram_token", data.access_token);
          await AsyncStorage.setItem("instagram_user_id", data.user_id?.toString() || "");
          
          // Store the Instagram account in your backend
          const storeResult = await authService.storeInstagramAccount(data.access_token, data.user_id);
          
          return { success: true, ...storeResult };
        } else {
          console.error("Failed to obtain access token:", data);
          return { 
            success: false, 
            error: data.error_message || "Failed to obtain access token",
            details: data
          };
        }
      } else if (result.type === "error") {
        console.error("Instagram login error:", result.error);
        return { 
          success: false, 
          error: result.error?.message || "Instagram login failed",
          details: result.error
        };
      } else {
        console.error("Instagram login failed or cancelled:", result);
        return { 
          success: false, 
          error: "Instagram login was cancelled or failed",
          details: result
        };
      }
    } catch (error) {
      console.error("Instagram login error:", error);
      return { 
        success: false, 
        error: error.message || "An unexpected error occurred",
        details: error
      };
    }
  },

  storeInstagramAccount: async (accessToken, instagramUserId) => {
    try {
      console.log("Fetching Instagram user profile");
      const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`);
      const userData = await response.json();
      console.log("Instagram user data:", userData);

      if (userData.id && userData.username) {
        // Get the current user's token
        const userToken = await AsyncStorage.getItem('userToken');
        
        // Create account data to store
        const accountData = {
          platform: 'instagram',
          token: accessToken,
          username: userData.username,
          platformUserId: userData.id || instagramUserId,
          accountType: userData.account_type || 'personal',
          mediaCount: userData.media_count || 0
        };

        console.log("Storing Instagram account in backend");
        const response = await api.post('/accounts', accountData, {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        });
        
        return { 
          success: true, 
          account: response.data.account,
          message: "Instagram account linked successfully" 
        };
      } else {
        console.error("Invalid user data from Instagram:", userData);
        return { success: false, error: "Invalid user data from Instagram" };
      }
    } catch (error) {
      console.error("Error storing Instagram account:", error.message);
      return { success: false, error: error.message };
    }
  },

  logoutInstagram: async () => {
    try {
      await AsyncStorage.removeItem("instagram_token");
      await AsyncStorage.removeItem("instagram_user_id");
      
      // Get the current user's token
      const userToken = await AsyncStorage.getItem('userToken');
      
      // Call your backend to remove the Instagram account
      await api.delete('/accounts/instagram', {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error logging out from Instagram:", error);
      return { success: false, error: error.message };
    }
  }
};

export default authService;