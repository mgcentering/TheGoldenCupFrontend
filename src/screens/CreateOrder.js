import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { getMenuItems, createOrder, getOrder } from "../api";
import {
  listPrinters,
  connectPrinter,
  printReceipt,
} from "../printer"; // printer.js file you already have

export default function CreateOrder() {
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState([{ item_name: "", price: 0, qty: 1 }]);
  const [menu, setMenu] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [printer, setPrinter] = useState(null);
  const { width } = useWindowDimensions();
  const isWide = width > 900; // responsive breakpoint

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    try {
      const data = await getMenuItems();
      setMenu(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load menu items");
    }
  }

  const addItem = () => {
    setItems([...items, { item_name: "", price: 0, qty: 1 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "item_name") {
      const found = menu.find((m) => m.name === value);
      newItems[index].price = found ? parseFloat(found.price) : 0;
    }

    setItems(newItems);
  };

  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const total = items.reduce(
    (sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0),
    0
  );

  async function handleSaveAndPrint() {
    try {
      const validItems = items.filter(
        (i) => i.item_name && i.qty > 0 && i.price > 0
      );
      if (validItems.length === 0) {
        Alert.alert("Error", "Please add at least one valid item");
        return;
      }
      if (!printer) {
        Alert.alert("Error", "Please connect a printer first");
        return;
      }

      const orderData = {
        customer_name: customer || "Walk-in",
        items: validItems.map((i) => ({
          item_name: i.item_name,
          qty: Number(i.qty),
          price: Number(i.price),
        })),
      };

      const saveRes = await createOrder(orderData);
      const orderId = saveRes.order_id;
      const order = await getOrder(orderId);
      await printReceipt(printer, order);

      setCustomer("");
      setItems([{ item_name: "", price: 0, qty: 1 }]);
      Alert.alert("✅ Success", "Order saved & printed!");
    } catch (err) {
      Alert.alert("Error", err.message || "Save failed");
    }
  }

  async function scanPrinters() {
    try {
      const list = await listPrinters();
      setPrinters(list);
      if (list.length === 0) Alert.alert("No paired printers found");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  }

  async function connectToPrinter(p) {
    try {
      const dev = await connectPrinter(p.address);
      setPrinter(dev);
      Alert.alert("Connected", `Connected to ${p.name}`);
    } catch (err) {
      Alert.alert("Failed", err.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.headerBox, isWide && styles.headerBoxWide]}>
        <Text style={styles.header}>☕ The Golden Cup ☕</Text>
      </View>

      {/* Printer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖨️ Printer</Text>
        <View style={styles.printerRow}>
          <TouchableOpacity style={styles.scanBtn} onPress={scanPrinters}>
            <Text style={styles.scanBtnText}>Scan Printers</Text>
          </TouchableOpacity>
          {printer && (
            <Text style={styles.connectedText}>✅ {printer.name}</Text>
          )}
        </View>
        <View style={styles.printerList}>
          {printers.map((p) => (
            <TouchableOpacity
              key={p.address}
              onPress={() => connectToPrinter(p)}
              style={[
                styles.printerItem,
                printer?.address === p.address && styles.activePrinter,
              ]}
            >
              <Text style={styles.printerName}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Customer</Text>
        <TextInput
          style={styles.input}
          placeholder="Customer Name (optional)"
          value={customer}
          onChangeText={setCustomer}
        />
      </View>

      {/* Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧾 Items</Text>
        <View style={[styles.tableHeader, isWide && styles.tableHeaderWide]}>
          <Text style={[styles.th, { flex: 3 }]}>Item</Text>
          <Text style={[styles.th, { width: 60, textAlign: "center" }]}>
            Qty
          </Text>
          <Text style={[styles.th, { width: 70, textAlign: "right" }]}>
            Price
          </Text>
          <Text style={[styles.th, { width: 80, textAlign: "right" }]}>
            Amount
          </Text>
        </View>

        {items.map((i, idx) => {
          const found = menu.find((m) => m.name === i.item_name);
          const price = found ? parseFloat(found.price) : i.price;
          const amount = (price * (i.qty || 0)).toFixed(2);
          return (
            <View key={idx} style={[styles.itemRow, isWide && styles.itemRowWide]}>
              <View style={{ flex: 3 }}>
                <RNPickerSelect
                  placeholder={{ label: "Select Item", value: null }}
                  items={menu.map((m) => ({
                    label: `${m.name} (₹${m.price})`,
                    value: m.name,
                  }))}
                  value={i.item_name}
                  onValueChange={(val) => updateItem(idx, "item_name", val)}
                />
              </View>

              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={String(i.qty)}
                onChangeText={(val) => updateItem(idx, "qty", Number(val))}
              />

              <Text style={styles.priceText}>₹{price}</Text>
              <Text style={styles.amountText}>₹{amount}</Text>

              <TouchableOpacity onPress={() => deleteItem(idx)}>
                <Text style={styles.deleteX}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {/* Total Section */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAndPrint}>
        <Text style={styles.saveBtnText}>💾 Save & Print</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  headerBox: {
    alignItems: "center",
    marginBottom: 10,
  },
  headerBoxWide: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e2723",
    textAlign: "center",
  },
  dateText: { fontSize: 12, color: "#555", marginTop: 4 },
  section: {
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  printerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scanBtn: {
    backgroundColor: "#6b3e26",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  scanBtnText: { color: "#fff", fontWeight: "bold" },
  connectedText: { fontSize: 14, color: "green", marginLeft: 10 },
  printerList: { marginTop: 8 },
  printerItem: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginVertical: 4,
  },
  activePrinter: { backgroundColor: "#e0d8d1", borderColor: "#6b3e26" },
  printerName: { color: "#3e2723", fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    fontSize: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#efebe9",
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  th: { fontWeight: "bold", color: "#3e2723", fontSize: 14 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  qtyInput: {
    width: 50,
    marginHorizontal: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },
  priceText: { width: 70, textAlign: "right", color: "#3e2723" },
  amountText: { width: 80, textAlign: "right", fontWeight: "bold", color: "#1b5e20" },
  deleteX: { color: "red", fontWeight: "bold", fontSize: 18, marginLeft: 6 },
  addBtn: {
    marginTop: 10,
    backgroundColor: "#4e342e",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#efebe9",
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  totalLabel: { fontSize: 18, fontWeight: "bold", color: "#3e2723" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#1b5e20" },
  saveBtn: {
    backgroundColor: "#6b3e26",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
