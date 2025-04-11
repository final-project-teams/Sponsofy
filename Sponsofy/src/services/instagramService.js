import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../config/axios";

const instagramService = {
  fetchInstagramData: async () => {
    try {
      const accessToken = await AsyncStorage.getItem("instagram_token");
      const userToken = await AsyncStorage.getItem("userToken");

      if (!accessToken || !userToken) {
        throw new Error("Instagram access token or user token not found");
      }

      // Fetch Instagram user info
      const userInfoResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,media_count&access_token=${accessToken}`
      );

      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch Instagram user info");
      }

      const userInfo = await userInfoResponse.json();
      console.log("Instagram user info:", userInfo);

      // Fetch Instagram media data
      const mediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&access_token=${accessToken}&limit=20`
      );

      if (!mediaResponse.ok) {
        throw new Error("Failed to fetch Instagram media");
      }

      const mediaData = await mediaResponse.json();
      console.log("Instagram media data:", mediaData);

      // Store media data in the database
      const storeResponse = await api.post("/posts/instagram-import", {
        posts: mediaData.data.map(media => ({
          title: media.caption || "Instagram Post",
          mediaUrl: media.media_url || media.thumbnail_url,
          mediaType: media.media_type,
          platformId: media.id,
          platform: "instagram",
          permalink: media.permalink,
          publishedAt: media.timestamp,
          likes: media.like_count || 0,
          comments: media.comments_count || 0
        }))
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      // Update user's Instagram stats
      await api.put("/accounts/instagram/stats", {
        followers: userInfo.followers_count || 0,
        mediaCount: userInfo.media_count || 0
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      return {
        success: true,
        message: "Instagram data fetched and stored successfully",
        posts: storeResponse.data.posts
      };
    } catch (error) {
      console.error("Error fetching Instagram data:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  getInstagramStats: async () => {
    try {
      const accessToken = await AsyncStorage.getItem("instagram_token");
      
      if (!accessToken) {
        throw new Error("Instagram access token not found");
      }

      // Fetch Instagram user insights
      const userInfoResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username,media_count&access_token=${accessToken}`
      );

      if (!userInfoResponse.ok) {
        throw new Error("Failed to fetch Instagram user info");
      }

      const userInfo = await userInfoResponse.json();
      
      // For business/creator accounts, you can fetch more detailed insights
      // This requires a business/creator account and additional permissions
      
      return {
        success: true,
        stats: {
          username: userInfo.username,
          mediaCount: userInfo.media_count || 0,
          // Other stats would be available for business accounts
        }
      };
    } catch (error) {
      console.error("Error fetching Instagram stats:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  
  refreshInstagramToken: async () => {
    try {
      const accessToken = await AsyncStorage.getItem("instagram_token");
      const userToken = await AsyncStorage.getItem("userToken");
      
      if (!accessToken || !userToken) {
        throw new Error("Instagram access token or user token not found");
      }
      
      // Call your backend to refresh the token
      const response = await api.post("/accounts/instagram/refresh-token", {
        accessToken
      }, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      
      if (response.data.success && response.data.newToken) {
        await AsyncStorage.setItem("instagram_token", response.data.newToken);
        return {
          success: true,
          message: "Instagram token refreshed successfully"
        };
      } else {
        throw new Error("Failed to refresh Instagram token");
      }
    } catch (error) {
      console.error("Error refreshing Instagram token:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default instagramService;