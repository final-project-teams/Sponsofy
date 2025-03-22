// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Modal,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   FlatList,
//   Dimensions
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as DocumentPicker from 'expo-document-picker';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { useTheme } from '../theme/ThemeContext';
// import { companyService } from '../services/api';

// // Get screen dimensions for responsive layout
// const { width } = Dimensions.get('window');
// const CARD_SIZE = (width - 48) / 3;

// interface MediaItem {
//   id: number | string;
//   media_type: 'image' | 'video' | 'audio' | 'document';
//   file_url: string;
//   file_name: string;
//   description?: string;
//   createdAt: string;
// }

// interface CompanyGalleryProps {
//   companyId: string;
//   editable?: boolean;
//   compactMode?: boolean;
// }

// const CompanyGallery = ({ companyId, editable = false, compactMode = false }: CompanyGalleryProps) => {
//   const { currentTheme, isDarkMode } = useTheme();
  
//   const [media, setMedia] = useState<MediaItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
//   const [mediaModalVisible, setMediaModalVisible] = useState(false);
//   const [pickerModalVisible, setPickerModalVisible] = useState(false);

//   // Load company media when component mounts or companyId changes
//   useEffect(() => {
//     fetchCompanyMedia();
//   }, [companyId]);

//   // Fetch media for the company
//   const fetchCompanyMedia = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await companyService.getCompanyMedia(companyId);
      
//       if (response.success) {
//         setMedia(response.media);
//       } else {
//         setError('Failed to load media');
//         setMedia([]);
//       }
//     } catch (error) {
//       console.error('Error fetching company media:', error);
//       setError('An error occurred while loading media');
//       setMedia([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Handle refresh
//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchCompanyMedia();
//   };

//   // Request permissions for accessing the photo library
//   const requestMediaLibraryPermissions = async () => {
//     if (Platform.OS !== 'web') {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert(
//           'Permission Denied',
//           'Sorry, we need camera roll permissions to upload photos or videos.',
//           [{ text: 'OK' }]
//         );
//         return false;
//       }
//       return true;
//     }
//     return true;
//   };

//   // Open image picker
//   const pickImage = async () => {
//     const hasPermission = await requestMediaLibraryPermissions();
//     if (!hasPermission) return;
    
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const file = {
//           uri: result.assets[0].uri,
//           name: `image-${Date.now()}.${result.assets[0].uri.split('.').pop()}`,
//           type: result.assets[0].type || 'image/jpeg'
//         };
//         uploadMedia(file, 'Company image');
//       }
//     } catch (error) {
//       console.error('Error picking image:', error);
//       Alert.alert('Error', 'Failed to select image. Please try again.');
//     } finally {
//       setPickerModalVisible(false);
//     }
//   };

//   // Open video picker
//   const pickVideo = async () => {
//     const hasPermission = await requestMediaLibraryPermissions();
//     if (!hasPermission) return;
    
//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Videos,
//         allowsEditing: true,
//         aspect: [16, 9],
//         quality: 1,
//       });
      
//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const file = {
//           uri: result.assets[0].uri,
//           name: `video-${Date.now()}.${result.assets[0].uri.split('.').pop()}`,
//           type: result.assets[0].type || 'video/mp4'
//         };
//         uploadMedia(file, 'Company video');
//       }
//     } catch (error) {
//       console.error('Error picking video:', error);
//       Alert.alert('Error', 'Failed to select video. Please try again.');
//     } finally {
//       setPickerModalVisible(false);
//     }
//   };

//   // Open document picker
//   const pickDocument = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: '*/*',
//         copyToCacheDirectory: true,
//       });
      
//       if (result.canceled === false && result.assets && result.assets.length > 0) {
//         const asset = result.assets[0];
//         const file = {
//           uri: asset.uri,
//           name: asset.name,
//           type: asset.mimeType || 'application/octet-stream'
//         };
//         uploadMedia(file, 'Company document');
//       }
//     } catch (error) {
//       console.error('Error picking document:', error);
//       Alert.alert('Error', 'Failed to select document. Please try again.');
//     } finally {
//       setPickerModalVisible(false);
//     }
//   };

//   // Upload the selected media
//   const uploadMedia = async (file, description = '') => {
//     try {
//       setUploading(true);
      
//       const response = await companyService.uploadCompanyMedia(companyId, file, description);
      
//       if (response.success) {
//         // Add the new media to the list
//         setMedia([response.media, ...media]);
//         Alert.alert('Success', 'Media uploaded successfully');
//       } else {
//         Alert.alert('Error', response.message || 'Failed to upload media');
//       }
//     } catch (error) {
//       console.error('Error uploading media:', error);
//       Alert.alert('Error', 'Failed to upload media. Please try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Handle media item press
//   const handleMediaPress = (item: MediaItem) => {
//     setSelectedMedia(item);
//     setMediaModalVisible(true);
//   };

//   // Render media item
//   const renderMediaItem = ({ item }: { item: MediaItem }) => (
//     <TouchableOpacity 
//       style={styles.mediaCard}
//       onPress={() => handleMediaPress(item)}
//       activeOpacity={0.7}
//     >
//       {item.media_type === 'image' ? (
//         <Image 
//           source={{ uri: item.file_url }} 
//           style={styles.mediaImage}
//           resizeMode="cover"
//         />
//       ) : item.media_type === 'video' ? (
//         <View style={styles.videoContainer}>
//           <Image 
//             source={{ uri: item.file_url }} 
//             style={styles.mediaImage}
//             resizeMode="cover"
//           />
//           <Icon 
//             name="play-circle" 
//             size={28} 
//             color="#FFFFFF" 
//             style={styles.playIcon} 
//           />
//         </View>
//       ) : (
//         <View style={styles.documentContainer}>
//           <Icon 
//             name={
//               item.media_type === 'audio' ? 'file-music-outline' : 
//               'file-document-outline'
//             } 
//             size={32} 
//             color={isDarkMode ? '#FFFFFF' : '#333333'} 
//           />
//           <Text 
//             style={[
//               styles.documentName, 
//               { color: isDarkMode ? '#FFFFFF' : '#333333' }
//             ]}
//             numberOfLines={1}
//           >
//             {item.file_name}
//           </Text>
//         </View>
//       )}
//     </TouchableOpacity>
//   );

//   // Render media modal for previewing selected media
//   const renderMediaModal = () => (
//     <Modal
//       visible={mediaModalVisible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={() => setMediaModalVisible(false)}
//     >
//       <View style={styles.modalContainer}>
//         <View 
//           style={[
//             styles.modalContent,
//             { backgroundColor: isDarkMode ? '#222222' : '#FFFFFF' }
//           ]}
//         >
//           <TouchableOpacity 
//             style={styles.closeButton}
//             onPress={() => setMediaModalVisible(false)}
//           >
//             <Icon name="close" size={24} color={isDarkMode ? '#FFFFFF' : '#333333'} />
//           </TouchableOpacity>

//           {selectedMedia && (
//             <View style={styles.modalMediaContainer}>
//               {selectedMedia.media_type === 'image' ? (
//                 <Image 
//                   source={{ uri: selectedMedia.file_url }} 
//                   style={styles.modalImage}
//                   resizeMode="contain"
//                 />
//               ) : selectedMedia.media_type === 'video' ? (
//                 <View style={styles.modalVideoContainer}>
//                   {/* Implement video player here */}
//                   <Text style={{ color: isDarkMode ? '#FFFFFF' : '#333333' }}>
//                     Video Player Placeholder
//                   </Text>
//                 </View>
//               ) : (
//                 <View style={styles.modalDocumentContainer}>
//                   <Icon 
//                     name={
//                       selectedMedia.media_type === 'audio' ? 'file-music-outline' : 
//                       'file-document-outline'
//                     } 
//                     size={64} 
//                     color={isDarkMode ? '#FFFFFF' : '#333333'} 
//                   />
//                   <Text 
//                     style={{ 
//                       color: isDarkMode ? '#FFFFFF' : '#333333',
//                       marginTop: 10
//                     }}
//                   >
//                     {selectedMedia.file_name}
//                   </Text>
//                 </View>
//               )}

//               {selectedMedia.description && (
//                 <Text 
//                   style={[
//                     styles.mediaDescription,
//                     { color: isDarkMode ? '#CCCCCC' : '#666666' }
//                   ]}
//                 >
//                   {selectedMedia.description}
//                 </Text>
//               )}

//               <Text 
//                 style={[
//                   styles.mediaDate,
//                   { color: isDarkMode ? '#AAAAAA' : '#999999' }
//                 ]}
//               >
//                 {new Date(selectedMedia.createdAt).toLocaleDateString()} at {' '}
//                 {new Date(selectedMedia.createdAt).toLocaleTimeString()}
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );

//   // Render media picker modal
//   const renderPickerModal = () => (
//     <Modal
//       visible={pickerModalVisible}
//       transparent={true}
//       animationType="slide"
//       onRequestClose={() => setPickerModalVisible(false)}
//     >
//       <View style={styles.pickerModalContainer}>
//         <View 
//           style={[
//             styles.pickerModalContent,
//             { backgroundColor: isDarkMode ? '#222222' : '#FFFFFF' }
//           ]}
//         >
//           <Text 
//             style={[
//               styles.pickerModalTitle,
//               { color: isDarkMode ? '#FFFFFF' : '#333333' }
//             ]}
//           >
//             Add Media to Gallery
//           </Text>

//           <TouchableOpacity 
//             style={[
//               styles.pickerOption,
//               { backgroundColor: isDarkMode ? '#333333' : '#F5F5F5' }
//             ]}
//             onPress={pickImage}
//           >
//             <Icon name="image-outline" size={24} color={currentTheme.colors.primary} />
//             <Text 
//               style={[
//                 styles.pickerOptionText,
//                 { color: isDarkMode ? '#FFFFFF' : '#333333' }
//               ]}
//             >
//               Upload Photo
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[
//               styles.pickerOption,
//               { backgroundColor: isDarkMode ? '#333333' : '#F5F5F5' }
//             ]}
//             onPress={pickVideo}
//           >
//             <Icon name="video-outline" size={24} color={currentTheme.colors.primary} />
//             <Text 
//               style={[
//                 styles.pickerOptionText,
//                 { color: isDarkMode ? '#FFFFFF' : '#333333' }
//               ]}
//             >
//               Upload Video
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[
//               styles.pickerOption,
//               { backgroundColor: isDarkMode ? '#333333' : '#F5F5F5' }
//             ]}
//             onPress={pickDocument}
//           >
//             <Icon name="file-document-outline" size={24} color={currentTheme.colors.primary} />
//             <Text 
//               style={[
//                 styles.pickerOptionText,
//                 { color: isDarkMode ? '#FFFFFF' : '#333333' }
//               ]}
//             >
//               Upload Document
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[
//               styles.cancelButton,
//               { backgroundColor: isDarkMode ? '#444444' : '#EEEEEE' }
//             ]}
//             onPress={() => setPickerModalVisible(false)}
//           >
//             <Text 
//               style={[
//                 styles.cancelButtonText,
//                 { color: isDarkMode ? '#FFFFFF' : '#333333' }
//               ]}
//             >
//               Cancel
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   // Render the component
//   return (
//     <View style={[styles.container, compactMode && styles.compactContainer]}>
//       <View style={styles.headerContainer}>
//         <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#333333' }]}>
//           Media Gallery
//         </Text>
        
//         {editable && (
//           <TouchableOpacity 
//             style={styles.addButton}
//             onPress={() => setPickerModalVisible(true)}
//             disabled={uploading}
//           >
//             <Icon name="plus" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         )}
//       </View>

//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={currentTheme.colors.primary} />
//           <Text style={{ color: isDarkMode ? '#CCCCCC' : '#666666', marginTop: 10 }}>
//             Loading media...
//           </Text>
//         </View>
//       ) : error ? (
//         <View style={styles.errorContainer}>
//           <Icon name="alert-circle-outline" size={48} color="#F44336" />
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity 
//             style={styles.retryButton}
//             onPress={fetchCompanyMedia}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       ) : media.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Icon 
//             name="image-off-outline" 
//             size={64} 
//             color={isDarkMode ? '#444444' : '#CCCCCC'} 
//           />
//           <Text style={{ color: isDarkMode ? '#CCCCCC' : '#666666', marginTop: 10 }}>
//             No media found
//           </Text>
//           {editable && (
//             <TouchableOpacity 
//               style={[
//                 styles.addMediaButton,
//                 { backgroundColor: currentTheme.colors.primary }
//               ]}
//               onPress={() => setPickerModalVisible(true)}
//             >
//               <Text style={styles.addMediaButtonText}>Add Media</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ) : (
//         <FlatList
//           data={media}
//           renderItem={renderMediaItem}
//           keyExtractor={(item) => item.id.toString()}
//           numColumns={3}
//           contentContainerStyle={styles.mediaGrid}
//           showsVerticalScrollIndicator={false}
//           refreshing={refreshing}
//           onRefresh={handleRefresh}
//         />
//       )}

//       {uploading && (
//         <View style={styles.uploadingContainer}>
//           <View style={styles.uploadingContent}>
//             <ActivityIndicator size="large" color={currentTheme.colors.primary} />
//             <Text style={{ color: '#FFFFFF', marginTop: 10 }}>
//               Uploading media...
//             </Text>
//           </View>
//         </View>
//       )}

//       {renderMediaModal()}
//       {renderPickerModal()}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 0,
//     width: '100%',
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     paddingHorizontal: 16,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   addButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#8A2BE2',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   mediaGrid: {
//     padding: 8,
//   },
//   mediaCard: {
//     width: CARD_SIZE,
//     height: CARD_SIZE,
//     margin: 4,
//     borderRadius: 8,
//     overflow: 'hidden',
//     backgroundColor: '#1A1A1A',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   mediaImage: {
//     width: '100%',
//     height: '100%',
//   },
//   videoContainer: {
//     position: 'relative',
//     width: '100%',
//     height: '100%',
//   },
//   playIcon: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     marginLeft: -14,
//     marginTop: -14,
//   },
//   documentContainer: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 8,
//   },
//   documentName: {
//     fontSize: 10,
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   errorText: {
//     marginTop: 16,
//     fontSize: 16,
//     textAlign: 'center',
//     color: '#F44336',
//     marginBottom: 16,
//   },
//   retryButton: {
//     backgroundColor: '#8A2BE2',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
//   addMediaButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   addMediaButtonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   uploadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   uploadingContent: {
//     padding: 20,
//     borderRadius: 8,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//   },
//   modalContent: {
//     width: '90%',
//     maxHeight: '80%',
//     borderRadius: 8,
//     overflow: 'hidden',
//     padding: 16,
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     zIndex: 10,
//     padding: 8,
//   },
//   modalMediaContainer: {
//     alignItems: 'center',
//     paddingTop: 24,
//   },
//   modalImage: {
//     width: '100%',
//     height: 300,
//     borderRadius: 8,
//   },
//   modalVideoContainer: {
//     width: '100%',
//     height: 300,
//     borderRadius: 8,
//     backgroundColor: '#000000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalDocumentContainer: {
//     padding: 16,
//     alignItems: 'center',
//   },
//   mediaDescription: {
//     fontSize: 14,
//     marginTop: 16,
//     textAlign: 'center',
//   },
//   mediaDate: {
//     fontSize: 12,
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   pickerModalContainer: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   pickerModalContent: {
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     padding: 16,
//     paddingBottom: Platform.OS === 'ios' ? 36 : 16,
//   },
//   pickerModalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   pickerOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   pickerOptionText: {
//     fontSize: 16,
//     marginLeft: 12,
//   },
//   cancelButton: {
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 8,
//     alignItems: 'center',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   compactContainer: {
//     height: 200,
//   },
// });

// export default CompanyGallery; 