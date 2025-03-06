import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { paymentService } from '../services/api'; // Adjust as necessary
import { useNavigation } from '@react-navigation/native';

const ConfirmationScreen = () => {
  const [termText, setTermText] = useState('');
  const navigation = useNavigation();

  const handleAddTerm = async () => {
    try {
      const response = await paymentService.addTerm({ text: termText }); // Adjust API call
      Alert.alert('Success', 'Term added successfully!');
      setTermText('');
      if (response.success) {
        navigation.navigate('TermsSummary'); // Redirect to the summary page
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add term.');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter term"
        value={termText}
        onChangeText={setTermText}
      />
      <Button title="Add Term" onPress={handleAddTerm} />
    </View>
  );
};

export default ConfirmationScreen;
