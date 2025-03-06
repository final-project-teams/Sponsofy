import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { socketService } from '../services/socketService';

const TermsScreen = () => {
  const [terms, setTerms] = useState([{ title: '', description: '', confirmations: 0 }]);
  const [termText, setTermText] = useState('');
  const [submittedCount, setSubmittedCount] = useState(0);

  useEffect(() => {
    socketService.connect('your_token_here');

    socketService.onNewTerm((term) => {
      setTerms((prevTerms) => [...prevTerms, term]);
    });

    socketService.onTermConfirmed((term) => {
      setTerms((prevTerms) => {
        return prevTerms.map((t) => (t.title === term.title ? { ...t, confirmations: t.confirmations + 1 } : t));
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleAddTerm = () => {
    const newTerm = { title: termText, description: '', confirmations: 0 };
    setTerms([...terms, newTerm]);
    socketService.sendMessage({ roomId: 'your_room_id', message: 'addTerm', userId: 'your_user_id' });
    setTermText('');
  };

  const handleSubmitTerm = (index: number) => {
    if (terms[index].title.trim()) {
      const newTerms = [...terms];
      newTerms[index].confirmations += 1; // Increment confirmation count
      setTerms(newTerms);

      if (newTerms[index].confirmations === 2) {
        socketService.sendMessage({ roomId: 'your_room_id', message: 'confirmTerm', userId: 'your_user_id' });
        Alert.alert('Success', `Term ${index + 1} confirmed!`);
      } else {
        Alert.alert('Confirmation', `Term ${index + 1} confirmed by one person. Waiting for another confirmation.`);
      }
    } else {
      Alert.alert('Error', 'Term cannot be empty.');
    }
  };

  const handleContinue = () => {
    Alert.alert('Terms Submitted', 'You have successfully submitted the terms.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Terms</Text>
      <ScrollView>
        {terms.map((term, index) => (
          <View key={index} style={styles.termContainer}>
            <TextInput
              placeholder={`Term ${index + 1}`}
              value={term.title}
              onChangeText={(text) => {
                const newTerms = [...terms];
                newTerms[index].title = text;
                setTerms(newTerms);
              }}
              style={styles.input}
            />
            <Text style={styles.submissionCount}>{term.confirmations}/2</Text>
            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmitTerm(index)}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTerm}>
          <Text style={styles.addButtonText}>+ Add More Terms</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  termContainer: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
  },
  submissionCount: {
    color: '#fff',
    marginVertical: 5,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  submitButtonText: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TermsScreen;