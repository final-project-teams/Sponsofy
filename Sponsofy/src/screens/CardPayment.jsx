import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";



const MainCardScreen = ({ navigation, route }) => {
    // Extract userId and profile from route.params
    const { userId, profile } = route.params || {};
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Card Payment Options</Text>
        <Text style={styles.subtitle}>
          Welcome, {profile?.first_name} {profile?.last_name}
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="View All Cards"
            onPress={() => navigation.navigate("GetAllCards", { userId })}
            color="#8A2BE2"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Add New Card"
            onPress={() => navigation.navigate("PostCard", { userId })}
            color="#8A2BE2"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Update Card"
            onPress={() => navigation.navigate("UpdateCard", { userId })}
            color="#8A2BE2"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Delete Card"
            onPress={() => navigation.navigate("DeleteCard", { userId })}
            color="#8A2BE2"
          />
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#121212",
    },
    title: {
      fontSize: 24,
      marginBottom: 10,
      color: "white",
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
      color: "#8A2BE2",
    },
    buttonContainer: {
      marginVertical: 10,
    }
  });
  
  export default MainCardScreen;
  