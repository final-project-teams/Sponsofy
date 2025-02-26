// import React from 'react';
// import { StyleSheet, ScrollView } from 'react-native';
// import React, { useState, useEffect } from 'react'
// import { useTheme } from '../theme/ThemeContext';
// import { Card } from '../components/ui/Card';
// import { Button } from '../components/ui/button';
// import { Typography } from '../components/ui/Typography';


// interface Deal {
//   id: string;
//   title: string;
//   description: string;
//   start_date: string;
//   end_date: string;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
// }
// export function Home() {
//   const { currentTheme } = useTheme();
//   const [data, setData] = useState<Deal[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   // const fetchData = async () => {
//   //   try {
//   //     console.log('Fetching data...');
//   //     const response = await fetch('http://192.168.104.20:3304/api/contract');
//   //     console.log('Response status:', response.status);

//   //     if (!response.ok) {
//   //       throw new Error(HTTP error! status: ${response.status});
//   //     }

//   //     const jsonData = await response.json();
//   //     console.log('Received data:', jsonData);
//   //     setData(jsonData);
//   //   } catch (err) {
//   //     console.error('Error fetching data:', err);
//   //     setError(err instanceof Error ? err.message : 'Failed to fetch data');
//   //   }
//   // }

//   // useEffect(() => {
//   //   fetchData();
//   // }, []);
//   return (
//     <ScrollView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
//       <Typography variant="h1" color={currentTheme.colors.primary} align="left">
//         Deals
//       </Typography>
//       {data.map(deal => (
//         <Card key={deal.id} variant="elevated" style={styles.card}>
//           <Typography variant="h2" color={currentTheme.colors.text}>
//             {deal.username}
//           </Typography>
//           <Typography variant="body" color={currentTheme.colors.textSecondary}>
//             {deal.date}
//           </Typography>
//           <Typography variant="body" color={currentTheme.colors.text}>
//             {deal.description}
//           </Typography>
//           <Button title="View Deal" onPress={() => {}} />
//           <Button title="Contact" variant="secondary" onPress={() => {}} />
//         </Card>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   card: {
//     marginBottom: 16,
//   },
// });
