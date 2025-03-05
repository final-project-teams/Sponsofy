import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";

// Debug log to verify AuthSession import
console.log("AuthSession loaded:", AuthSession);

// Instagram Auth Configuration
const INSTAGRAM_CLIENT_ID = "960875616017018"; // From your Meta Developer dashboard
const INSTAGRAM_CLIENT_SECRET = "55e6d5dc44f234b0b25050165e71485f"; // Add your Instagram client secret here
const INSTAGRAM_REDIRECT_URI = "https://auth.expo.io/@Sponsofy/Sponsofy"; // Ensure registered in Meta Developer Console
const INSTAGRAM_SCOPE = "instagram_basic,instagram_content_publish";

// YouTube Auth Configuration
const YOUTUBE_CLIENT_ID = "138832898082-1vc26riqnsitmkbqfl3g3sqkrjtlid3m.apps.googleusercontent.com";
const YOUTUBE_REDIRECT_URI = "https://auth.expo.io/@Sponsofy/Sponsofy"; // Ensure registered in Google Developer Console
const YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

// Auth service for handling social logins
const authService = {
  // Instagram authentication
  instagramLogin: async () => {
    try {
      console.log("Starting Instagram login process...");
  
      const discovery = {
        authorizationEndpoint: "https://api.instagram.com/oauth/authorize",
        tokenEndpoint: "https://api.instagram.com/oauth/access_token",
      };
  
      console.log("Discovery object created:", discovery);
  
      const authRequest = new AuthSession.AuthRequest({
        clientId: INSTAGRAM_CLIENT_ID,
        redirectUri: INSTAGRAM_REDIRECT_URI,
        scopes: ["instagram_basic", "instagram_content_publish"],
        responseType: "code",
      });
  
      console.log("AuthRequest object created:", authRequest);
  
      const result = await authRequest.promptAsync(discovery);
      console.log("AuthSession promptAsync result:", result);
  
      if (result.type === "success") {
        console.log("Authentication successful, extracting authorization code...");
        const { code } = result.params;
        console.log("Authorization code:", code);
  
        // Exchange the authorization code for an access token
        console.log("Exchanging authorization code for access token...");
        const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: INSTAGRAM_CLIENT_ID,
            client_secret: INSTAGRAM_CLIENT_SECRET,
            grant_type: "authorization_code",
            redirect_uri: INSTAGRAM_REDIRECT_URI,
            code: code,
          }),
        });
  
        console.log("Token exchange response status:", tokenResponse.status);
        if (!tokenResponse.ok) {
          const errorResponse = await tokenResponse.json();
          console.error("Failed to exchange code for access token. Error response:", errorResponse);
          throw new Error("Failed to exchange code for access token");
        }
  
        const tokenData = await tokenResponse.json();
        console.log("Token data received:", tokenData);
  
        const { access_token } = tokenData;
        console.log("Access token extracted:", access_token);
  
        // Fetch user info using the access token
        console.log("Fetching Instagram user info...");
        const userInfoResponse = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`,
        );
  
        console.log("User info response status:", userInfoResponse.status);
        if (!userInfoResponse.ok) {
          const errorResponse = await userInfoResponse.json();
          console.error("Failed to fetch user info. Error response:", errorResponse);
          throw new Error("Invalid Instagram token");
        }
  
        const userInfo = await userInfoResponse.json();
        console.log("User info received:", userInfo);
  
        // Save token and user info
        console.log("Saving Instagram token and user info to AsyncStorage...");
        await AsyncStorage.setItem("instagram_token", access_token);
        await AsyncStorage.setItem("instagram_user", JSON.stringify(userInfo));
  
        console.log("Instagram login process completed successfully.");
        return {
          success: true,
          user: userInfo,
          token: access_token,
        };
      } else {
        console.log("Authentication failed or was cancelled. Result type:", result.type);
        return {
          success: false,
          error: result.type === "cancel" ? "Authentication cancelled" : "Authentication failed",
        };
      }
    } catch (error) {
      console.error("Instagram auth error:", error.message, error.stack);
      return {
        success: false,
        error: error.message || "Instagram authentication failed",
      };
    }
  },

  // Fetch Instagram media data
  fetchInstagramMedia: async () => {
    try {
      const accessToken = await AsyncStorage.getItem("instagram_token");
      const instagramBusinessAccountId = await AsyncStorage.getItem("instagram_business_account_id");

      if (!accessToken || !instagramBusinessAccountId) {
        throw new Error("Instagram access token or business account ID not found");
      }

      const mediaResponse = await fetch(
        `https://graph.facebook.com/v22.0/${instagramBusinessAccountId}/media?fields=caption,comments_count,id,ig_id,like_count,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${accessToken}`
      );

      if (!mediaResponse.ok) {
        throw new Error("Failed to fetch Instagram media");
      }

      const mediaData = await mediaResponse.json();
      return mediaData;
    } catch (error) {
      console.error("Error fetching Instagram media:", error.message);
      return null;
    }
  },

  // Fetch Instagram profile data
  fetchInstagramProfile: async () => {
    try {
      const accessToken = await AsyncStorage.getItem("instagram_token");
      const instagramBusinessAccountId = await AsyncStorage.getItem("instagram_business_account_id");

      if (!accessToken || !instagramBusinessAccountId) {
        throw new Error("Instagram access token or business account ID not found");
      }

      const profileResponse = await fetch(
        `https://graph.facebook.com/v22.0/${instagramBusinessAccountId}?fields=biography,id,ig_id,followers_count,follows_count,media_count,name,profile_picture_url,username,website&access_token=${accessToken}`
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch Instagram profile");
      }

      const profileData = await profileResponse.json();
      return profileData;
    } catch (error) {
      console.error("Error fetching Instagram profile:", error.message);
      return null;
    }
  },

  // Store Instagram Business Account ID
  storeInstagramBusinessAccountId: async (accountId) => {
    try {
      await AsyncStorage.setItem("instagram_business_account_id", accountId);
      return true;
    } catch (error) {
      console.error("Error storing Instagram Business Account ID:", error.message);
      return false;
    }
  },

  // YouTube authentication
  youtubeLogin: async () => {
    try {
      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token", // Add token endpoint
      };

      const authRequest = new AuthSession.AuthRequest({
        clientId: YOUTUBE_CLIENT_ID,
        redirectUri: YOUTUBE_REDIRECT_URI,
        scopes: [YOUTUBE_SCOPE],
        responseType: "code", // Authorization code flow
        usePKCE: true, // Enable PKCE for YouTube
      });

      const result = await authRequest.promptAsync(discovery);

      console.log("auth request melek ", result);

      if (result.type === "success") {
        const { code } = result.params;

        // Exchange the authorization code for an access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: YOUTUBE_CLIENT_ID,
            client_secret: "YOUTUBE_CLIENT_SECRET", // Add your YouTube client secret
            grant_type: "authorization_code",
            redirect_uri: YOUTUBE_REDIRECT_URI,
            code: code,
            code_verifier: authRequest.codeVerifier, // Include PKCE code verifier
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange code for access token");
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;

        // Fetch YouTube channel info using the access token
        const userInfoResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        if (!userInfoResponse.ok) {
          throw new Error("Invalid YouTube token");
        }
        const userData = await userInfoResponse.json();
        const channelInfo = userData.items?.[0];

        if (!channelInfo) {
          throw new Error("No YouTube channel found for this account");
        }

        // Save token and user info
        await AsyncStorage.setItem("youtube_token", access_token);
        await AsyncStorage.setItem("youtube_user", JSON.stringify(channelInfo));

        return {
          success: true,
          user: channelInfo,
          token: access_token,
        };
      } else {
        return {
          success: false,
          error: result.type === "cancel" ? "Authentication cancelled" : "YouTube authentication failed",
        };
      }
    } catch (error) {
      console.error("YouTube auth error:", error.message, error.stack);
      return {
        success: false,
        error: error.message || "YouTube authentication failed",
      };
    }
  },

  // Check if user is authenticated with Instagram
  isInstagramAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem("instagram_token");
      return !!token;
    } catch (error) {
      console.error("Error checking Instagram auth:", error.message);
      return false;
    }
  },

  // Check if user is authenticated with YouTube
  isYoutubeAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem("youtube_token");
      return !!token;
    } catch (error) {
      console.error("Error checking YouTube auth:", error.message);
      return false;
    }
  },

  // Get Instagram user data
  getInstagramUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem("instagram_user");
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting Instagram user:", error.message);
      return null;
    }
  },

  // Get YouTube user data
  getYoutubeUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem("youtube_user");
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error("Error getting YouTube user:", error.message);
      return null;
    }
  },

  // Logout from Instagram with optional token revocation
  instagramLogout: async () => {
    try {
      const token = await AsyncStorage.getItem("instagram_token");
      if (token) {
        // Instagram doesn't have a direct revoke endpoint; just clear storage
        await AsyncStorage.removeItem("instagram_token");
        await AsyncStorage.removeItem("instagram_user");
        await AsyncStorage.removeItem("instagram_business_account_id");
      }
      return true;
    } catch (error) {
      console.error("Error logging out from Instagram:", error.message);
      return false;
    }
  },

  // Logout from YouTube with token revocation
  youtubeLogout: async () => {
    try {
      const token = await AsyncStorage.getItem("youtube_token");
      if (token) {
        // Revoke YouTube token via Google API
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        // Clear storage regardless of revocation success
        await AsyncStorage.removeItem("youtube_token");
        await AsyncStorage.removeItem("youtube_user");
      }
      return true;
    } catch (error) {
      console.error("Error logging out from YouTube:", error.message);
      return false;
    }
  },

  // Get all selected social accounts
  getSelectedAccounts: async () => {
    try {
      const accounts = await AsyncStorage.getItem("selected_accounts");
      return accounts ? JSON.parse(accounts) : null;
    } catch (error) {
      console.error("Error getting selected accounts:", error.message);
      return null;
    }
  },

  // Save selected social accounts
  saveSelectedAccounts: async (accounts) => {
    try {
      await AsyncStorage.setItem("selected_accounts", JSON.stringify(accounts));
      return true;
    } catch (error) {
      console.error("Error saving selected accounts:", error.message);
      return false;
    }
  },
};

export default authService;