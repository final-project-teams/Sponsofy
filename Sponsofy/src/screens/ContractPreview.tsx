import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { API_URL } from '../config/source';
import { useParams } from 'react-router-dom';
import api from '../config/axios';



const ContractPreview = () => {

    const { contractId } = useParams();

    interface Contract {
        id: number;
        title: string;
        description: string;
        createdAt: string;
        updatedAt: string;
    }

    const fetchContract = async () => {
      const data = await api.get(`${API_URL}/contract/detail/${contractId}`);
        setContract(data.data);
    }

const [contract, setContract] = useState<Contract | null>(null);

  return (
    <View>
      <Text>Contract Preview</Text>
    </View>
  );
};

export default ContractPreview;