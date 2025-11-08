import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import RNPickerSelect from "react-native-picker-select";

export default function ItemRow({ item, menu, onChange, onDelete }) {
  // find currently selected menu item
  const selectedMenuItem = menu.find((m) => m.name === item.item_name);

  return (
    <View style={styles.row}>
      {/* Dropdown */}
      <View style={{ flex: 2 }}>
        <RNPickerSelect
          placeholder={{ label: "Select Item", value: null }}
          items={menu.map((m) => ({
            label: `${m.name} (₹${m.price})`,
            value: String(m.id), // string for safety
          }))}
          value={selectedMenuItem ? String(selectedMenuItem.id) : null}
          onValueChange={(selectedId) => {
            // convert string back to number and find item
            const selected = menu.find((m) => String(m.id) === String(selectedId));
            if (selected) {
              onChange({
                ...item,
                item_name: selected.name,
                price: parseFloat(selected.price), // make sure it's a number
              });
            }
          }}
        />
      </View>

      {/* Quantity */}
      <TextInput
        style={styles.qty}
        keyboardType="numeric"
        value={String(item.qty)}
        onChangeText={(val) => onChange({ ...item, qty: Number(val || 0) })}
      />

      {/* Show price */}
      <Text style={styles.price}>
        ₹{item.price ? item.price.toFixed(2) : "0.00"}
      </Text>

      {/* Delete item */}
      <TouchableOpacity onPress={onDelete}>
        <Text style={{ color: "red", fontWeight: "bold" }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    padding: 6,
    borderRadius: 6,
  },
  qty: {
    width: 50,
    marginHorizontal: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    textAlign: "center",
  },
  price: {
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
  },
});
