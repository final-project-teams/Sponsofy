"use client"

import { useEffect } from "react"
import { View, Image, StyleSheet } from "react-native"





const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to the welcome screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace("Welcome")
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <View style={styles.container}>
     <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
  },
})

export default SplashScreen

