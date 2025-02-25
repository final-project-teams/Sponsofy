import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatScreen = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.username, { color: colors.text }]}>Username</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="call" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="videocam" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.messagesContainer}>
        <View style={[styles.messageReceived, { backgroundColor: colors.messageBackground }]}>
          <Text style={[styles.messageText, { color: colors.text }]}>Hey There!</Text>
        </View>
        <View style={[styles.messageSent, { backgroundColor: colors.messageSent }]}>
          <Text style={styles.messageSentText}>Hey How is it going?</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.attachmentButtons}>
          <TouchableOpacity>
            <Icon name="image" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="videocam" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="document" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
          <TextInput
            placeholder="Message..."
            placeholderTextColor={colors.border}
            style={[styles.input, { color: colors.text }]}
          />
          <TouchableOpacity>
            <Icon name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  username: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageReceived: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  messageSent: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
  },
  messageSentText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputContainer: {
    padding: 16,
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 24,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
});

export default ChatScreen;