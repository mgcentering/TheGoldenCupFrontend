import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import CreateOrder from "./src/screens/CreateOrder";
import OrdersList from "./src/screens/OrdersList";
import MenuScreen from "./src/screens/MenuScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "Create Order") {
              iconName = focused ? "cart" : "cart-outline";
            } else if (route.name === "Orders") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Menu") {
              iconName = focused ? "fast-food" : "fast-food-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#6b3e26",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#fff8f2",
            borderTopWidth: 1,
            borderTopColor: "#e0d5c3",
            height: 60,
            paddingBottom: 8,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Create Order" component={CreateOrder} />
        <Tab.Screen name="Orders" component={OrdersList} />
        <Tab.Screen name="Menu" component={MenuScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
