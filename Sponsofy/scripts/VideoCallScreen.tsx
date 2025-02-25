import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const VideoCallScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="chevron-down" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.participantsGrid}>
        <View style={[styles.participantBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.username, { color: colors.text }]}>Username</Text>
        </View>
        <View style={[styles.participantBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.username, { color: colors.text }]}>Username</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#FF3B30' }]}>
          <Icon name="call" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]}>
          <Icon name="videocam-off" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]}>
          <Icon name="mic-off" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]}>
          <Icon name="chatbubble" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.card }]}>
          <Icon name="information-circle" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  participantsGrid: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  participantBox: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoCallScreen;