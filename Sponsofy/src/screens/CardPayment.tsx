import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome, AntDesign, Feather } from "@expo/vector-icons";

const MainCardScreen = ({ navigation, route }) => {
  const { userId, profile } = route.params || {};

  const options = [
    {
      title: "View All Cards",
      icon: <MaterialIcons name="credit-card" size={30} color="#8A2BE2" />,
      action: () => navigation.navigate("GetAllCards", { userId })
    },
    {
      title: "Add New Card",
      icon: <FontAwesome name="plus-square" size={30} color="#8A2BE2" />,
      action: () => navigation.navigate("PostCard", { userId })
    },
    {
      title: "Update Card",
      icon: <AntDesign name="edit" size={30} color="#8A2BE2" />,
      action: () => navigation.navigate("UpdateCard", { userId })
    },
    {
      title: "Delete Card",
      icon: <Feather name="trash-2" size={30} color="#8A2BE2" />,
      action: () => navigation.navigate("DeleteCard", { userId })
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Payment Options</Text>
      <Text style={styles.subtitle}>
        Welcome, {profile?.first_name} {profile?.last_name}
      </Text>
      
      <View style={styles.gridContainer}>
        {options.map((option, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.gridItem}
            onPress={option.action}
          >
            <View style={styles.iconContainer}>
              {option.icon}
            </View>
            <Text style={styles.gridText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
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
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  gridItem: {
    width: "48%", // Slightly less than half to account for spacing
    aspectRatio: 1, // Makes items square
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#8A2BE2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 10,
  },
  gridText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  }
});

export default MainCardScreen;