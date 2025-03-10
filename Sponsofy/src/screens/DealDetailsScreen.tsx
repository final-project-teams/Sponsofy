import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import api from '../config/axios';
const DealDetailsScreen = ({ route }) => {
  const { dealId } = route.params;
  // const dealId = 1;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await api.get(`/deal/${dealId}`);
        setDeal(response.data.deal);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Deal Details</Text>
      {deal && (
        <View>
          <Text style={styles.subHeader}>Contract Information</Text>
          <Text>Title: {deal.Contract.title}</Text>
          <Text>Description: {deal.Contract.description}</Text>
          <Text>Start Date: {new Date(deal.Contract.start_date).toLocaleDateString()}</Text>
          <Text>End Date: {new Date(deal.Contract.end_date).toLocaleDateString()}</Text>
          <Text>Status: {deal.Contract.status}</Text>
          <Text>Payment Terms: {deal.Contract.payment_terms}</Text>
          <Text>Rank: {deal.Contract.rank}</Text>

          <Text style={styles.subHeader}>Company Information</Text>
          <Text>Name: {deal.Contract.Company.name}</Text>
          <Text>Industry: {deal.Contract.Company.industry}</Text>
          <Text>Code Fiscal: {deal.Contract.Company.codeFiscal}</Text>

          <Text style={styles.subHeader}>Content Creator Information</Text>
          <Text>Name: {deal.ContentCreatorDeals.first_name} {deal.ContentCreatorDeals.last_name}</Text>
          <Text>Bio: {deal.ContentCreatorDeals.bio}</Text>

          <Text style={styles.subHeader}>Deal Information</Text>
          <Text>Price: ${deal.price}</Text>
          <Text>Status: {deal.status}</Text>

          <Text style={styles.subHeader}>Terms</Text>
          {deal.Terms.map(term => (
            <View key={term.id} style={styles.term}>
              <Text>Title: {term.title}</Text>
              <Text>Description: {term.description}</Text>
              <Text>Status: {term.status}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  term: {
    marginBottom: 8,
  },
});

export default DealDetailsScreen;
