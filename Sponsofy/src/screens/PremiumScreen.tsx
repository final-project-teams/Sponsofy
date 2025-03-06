import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useStripe, StripeProvider } from '@stripe/stripe-react-native';
import { paymentService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PremiumScreen = ({ navigation }) => {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
  
    const handleJoinPremium = async () => {
      try {
        setLoading(true);
        
        // Create a payment intent - amount in cents (1500 = $15.00)
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            throw new Error('Authentication token is missing');
        }
        const tokenToUse = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const response = await paymentService.createPaymentIntent(1500, tokenToUse);
        
        if (!response || !response.paymentIntent) {
          console.error('Invalid response from payment service:', response);
          Alert.alert('Payment Error', 'Unable to process payment. Please try again later.');
          setLoading(false);
          return;
        }
        
        // Initialize the payment sheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: response.paymentIntent,
          merchantDisplayName: 'Sponsofy',
        });
        
        if (initError) {
          console.error('Error initializing payment sheet:', initError);
          Alert.alert('Payment Error', initError.message || 'Unable to initialize payment');
          setLoading(false);
          return;
        }
        
        // Present the payment sheet
        const { error: presentError } = await presentPaymentSheet();
        
        if (presentError) {
          console.error('Error presenting payment sheet:', presentError.message);
          if (presentError.code !== 'Canceled') {
            Alert.alert('Payment Error', presentError.message || 'Payment failed');
          }
        } else {
          console.log('Payment successful!');
          Alert.alert('Success', 'Your premium subscription has been activated!');
          // Handle successful payment (e.g., update user's subscription status)
        }
      } catch (error) {
        console.error('Payment process error:', error);
        
        // Handle authentication errors specifically
        if (error.response?.data?.error === 'jwt malformed') {
          Alert.alert(
            'Authentication Error',
            'Your session has expired. Please log in again.',
            [
              { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]
          );
        } else {
          Alert.alert(
            'Payment Error',
            'Something went wrong processing your payment. Please try again later.'
          );
        }
      } finally {
        setLoading(false);
      }
    };
  

  return (
    <StripeProvider publishableKey="sk_test_51Qy8lRIWpAHIXIsBoSqxrUEHMuDUSWMsqCxPW8AD4p19FRwtsx5kMpvMctQwcAoHcAViyTV6cjNSNyFgNNCzPXrE00NmnVeWdO">
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Enjoy an enhanced experience, newly added deals, top-tier verification and security.
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Premium Card */}
          <View style={styles.premiumCard}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>15$</Text>
              <Text style={styles.originalPrice}>31$</Text>
            </View>
            <Text style={styles.paymentType}>one-time-payment</Text>
            
            <TouchableOpacity 
              style={styles.premiumButton} 
              onPress={handleJoinPremium}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Join Sponsofy Premium</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>get latest deals</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>get all types of contracts</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>better UI / UX</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>moderator's priority</Text>
              </View>
            </View>
          </View>

          {/* Free Tier Card */}
          <View style={styles.freeCard}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>0$</Text>
            </View>
            <Text style={styles.paymentType}>free tier</Text>
            
            <TouchableOpacity style={styles.freeButton} disabled={true}>
              <Text style={styles.freeButtonText}>Already Joined</Text>
            </TouchableOpacity>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>get old deals</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>only silver contracts</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>Basic UI / UX</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>no moderator's priority</Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={styles.helpText}>Got questions? Find answers in our help center.</Text>
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
    lineHeight: 22,
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  premiumCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  freeCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  originalPrice: {
    color: '#888',
    fontSize: 20,
    textDecorationLine: 'line-through',
  },
  paymentType: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  freeButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  freeButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    color: '#888',
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    color: '#888',
    fontSize: 14,
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
});

export default PremiumScreen;