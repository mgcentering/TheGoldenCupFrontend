import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import moment from "moment";
import { listOrders } from "../api";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { width } = useWindowDimensions(); // 👈 Dynamic screen width

  useEffect(() => {
    fetchOrders(1, date, true);
  }, [date]);

  const fetchOrders = async (pg = 1, selectedDate = date, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await listOrders(pg, selectedDate);
      if (reset) setOrders(data.orders || []);
      else setOrders((prev) => [...prev, ...(data.orders || [])]);
      setHasMore(data.orders?.length >= 10);
      setPage(pg);
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Error", "Failed to fetch orders");
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) fetchOrders(page + 1, date);
  };

  const handleWebDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate && newDate !== date) setDate(newDate);
  };

  const handleNativeDateChange = (event, selectedDate) => {
    if (Platform.OS !== "ios") setShowDatePicker(false);
    if (selectedDate) {
      const newDate = moment(selectedDate).format("YYYY-MM-DD");
      if (newDate !== date) setDate(newDate);
    }
  };

  const renderOrder = ({ item }) => (
    <View style={[styles.card, width > 800 && styles.cardWide]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.title, { fontSize: width > 600 ? 18 : 16 }]}>
          Order #{item.id}
        </Text>
        <Text style={{ color: "#888", fontSize: 12 }}>
          {moment(item.created_at).format("DD MMM YYYY, hh:mm A")}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={{ fontSize: width > 600 ? 16 : 14 }}>
          Customer: <Text style={{ fontWeight: "bold" }}>{item.customer_name}</Text>
        </Text>
        <Text style={{ fontSize: width > 600 ? 16 : 14 }}>
          Total: ₹{Number(item.total).toFixed(2)}
        </Text>
      </View>

      <View style={styles.itemList}>
        <Text style={styles.itemHeader}>Items:</Text>
        {item.items && item.items.length ? (
          item.items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{it.item_name}</Text>
              <Text style={styles.itemQty}>
                × {it.qty} = ₹{(it.qty * it.price).toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.itemEmpty}>No items</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, width > 800 && styles.containerWide]}>
      <Text style={[styles.header, { fontSize: width > 600 ? 26 : 22 }]}>
        🧾 Orders List
      </Text>

      <View style={[styles.topBar, width > 600 && styles.topBarWide]}>
        <Text style={styles.dateText}>
          {moment(date).format("DD MMM YYYY")}
        </Text>

        {Platform.OS === "web" ? (
          <input
            type="date"
            value={date}
            onChange={handleWebDateChange}
            style={{
              padding: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              fontSize: width > 600 ? 16 : 14,
              cursor: "pointer",
            }}
            max={moment().format("YYYY-MM-DD")}
          />
        ) : (
          <>
            <Button
              title="📅 Change Date"
              onPress={() => setShowDatePicker(true)}
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date(date)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleNativeDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        numColumns={width > 900 ? 2 : 1} // 👈 responsive grid for web/tablet
        columnWrapperStyle={width > 900 ? { justifyContent: "space-between" } : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <Text style={styles.loading}>Loading...</Text> : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.noData}>No orders for this date</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  containerWide: {
    paddingHorizontal: "10%",
    backgroundColor: "#fafafa",
  },
  header: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topBarWide: {
    justifyContent: "center",
    gap: 20,
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardWide: {
    width: "48%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardBody: {
    marginBottom: 8,
  },
  title: { fontWeight: "bold" },
  itemList: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 5 },
  itemHeader: { fontWeight: "bold", marginBottom: 4 },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  itemName: { flex: 1 },
  itemQty: { textAlign: "right" },
  itemEmpty: { color: "#999", fontStyle: "italic" },
  loading: {
    textAlign: "center",
    marginVertical: 10,
    fontStyle: "italic",
    color: "#666",
  },
  noData: {
    textAlign: "center",
    marginVertical: 20,
    color: "#999",
  },
});
