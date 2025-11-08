import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CreateOrder from "./src/screens/CreateOrder";
import OrdersList from "./src/screens/OrdersList";
import MenuScreen from "./src/screens/MenuScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Create Order" component={CreateOrder} />
        <Tab.Screen name="Orders" component={OrdersList} />
        <Tab.Screen name="Menu" component={MenuScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
