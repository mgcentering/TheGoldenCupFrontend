import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { getMenuItems, updateMenuItem, createMenuItem, deleteMenuItem } from "../api";

export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Load menu
  const fetchMenu = async () => {
    try {
      const res = await getMenuItems();
      setMenuItems(res);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Save (add or update)
  const handleSave = async () => {
    if (!name || !price) {
      return Alert.alert("Missing Data", "Enter both name and price");
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, { name, price });
        Alert.alert("Updated", "Menu item updated");
      } else {
        await createMenuItem({ name, price });
        Alert.alert("Added", "Menu item created");
      }

      setName("");
      setPrice("");
      setEditingItem(null);
      fetchMenu();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save menu item");
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(String(item.price));
  };

  // Delete item
  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this menu item?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuItem(id);
              Alert.alert("Deleted", "Menu item removed successfully");
              fetchMenu();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🍔 Manage Menu</Text>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <Button
          title={editingItem ? "Update Item" : "Add Item"}
          onPress={handleSave}
        />

        {editingItem && (
          <TouchableOpacity
            style={styles.cancel}
            onPress={() => {
              setEditingItem(null);
              setName("");
              setPrice("");
            }}
          >
            <Text style={{ color: "white" }}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu List */}
      <Text style={styles.subHeader}>📋 Menu List</Text>

      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  form: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 5,
  },
  cancel: {
    backgroundColor: "#666",
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  subHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemPrice: { color: "#555" },
  actions: { flexDirection: "row", alignItems: "center" },
  edit: { marginRight: 10, fontSize: 18 },
  delete: { fontSize: 18, color: "red" },
});
