// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/Ionicons";

// // Define a notification type
// interface Notification {
//   id: string;
//   message: string;
//   timestamp: string;
//   read: boolean;
// }

// // Mock notifications data
// const mockNotifications: Notification[] = [
//   {
//     id: "1",
//     message: "New contract proposal from TechCorp",
//     timestamp: "2 hours ago",
//     read: false,
//   },
//   {
//     id: "2",
//     message: "Your deal with FitnessBrand has been accepted",
//     timestamp: "Yesterday",
//     read: false,
//   },
//   {
//     id: "3",
//     message: "Payment received from BeautyCompany",
//     timestamp: "3 days ago",
//     read: true,
//   },
//   {
//     id: "4",
//     message: "New message from FoodDelivery",
//     timestamp: "1 week ago",
//     read: true,
//   },
// ];

// const NotificationsScreen = () => {
//   const navigation = useNavigation();
//   const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

//   const markAsRead = (id: string) => {
//     setNotifications(
//       notifications.map((notification) =>
//         notification.id === id ? { ...notification, read: true } : notification
//       )
//     );
//   };

//   const renderNotification = ({ item }: { item: Notification }) => (
//     <TouchableOpacity
//       style={[styles.notificationItem, item.read ? styles.read : styles.unread]}
//       onPress={() => markAsRead(item.id)}
//     >
//       <View style={styles.notificationContent}>
//         <Text style={styles.notificationText}>{item.message}</Text>
//         <Text style={styles.timestamp}>{item.timestamp}</Text>
//       </View>
//       {!item.read && <View style={styles.unreadDot} />}
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Icon name="arrow-back" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Notifications</Text>
//         <TouchableOpacity style={styles.clearButton}>
//           <Text style={styles.clearButtonText}>Clear All</Text>
//         </TouchableOpacity>
//       </View>

//       {notifications.length > 0 ? (
//         <FlatList
//           data={notifications}
//           renderItem={renderNotification}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={styles.notificationsList}
//         />
//       ) : (
//         <View style={styles.emptyContainer}>
//           <Icon name="notifications-off-outline" size={60} color="#444" />
//           <Text style={styles.emptyText}>No notifications yet</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000000",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#222",
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#FFFFFF",
//   },
//   clearButton: {
//     padding: 8,
//   },
//   clearButtonText: {
//     color: "#701FF1",
//     fontSize: 14,
//   },
//   notificationsList: {
//     padding: 16,
//   },
//   notificationItem: {
//     flexDirection: "row",
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   unread: {
//     backgroundColor: "rgba(112, 31, 241, 0.1)",
//   },
//   read: {
//     backgroundColor: "#111",
//   },
//   notificationContent: {
//     flex: 1,
//   },
//   notificationText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   timestamp: {
//     color: "#666",
//     fontSize: 12,
//   },
//   unreadDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#701FF1",
//     marginLeft: 8,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   emptyText: {
//     color: "#666",
//     fontSize: 16,
//     marginTop: 12,
//   },
// });

// export default NotificationsScreen; 