import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function OrderCard({ order, onView }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Order #{order.id}</Text>
      <Text>Customer: {order.customer_name || 'Walk-in'}</Text>
      <Text>Total: ₹{Number(order.total).toFixed(2)}</Text>
      <Text>Date: {new Date(order.created_at).toLocaleString()}</Text>
      <Button title="View" onPress={() => onView(order.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
