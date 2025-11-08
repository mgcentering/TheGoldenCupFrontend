import { Platform, PermissionsAndroid, Alert } from 'react-native';

let BluetoothSerial;
if (Platform.OS !== 'web') {
  try {
    BluetoothSerial = require('react-native-bluetooth-classic').default;
  } catch (err) {
    console.log('BluetoothClassic not available:', err);
  }
}

/* -----------------------------
   1️⃣ Request Bluetooth permissions
--------------------------------- */
export async function requestBluetoothPermission() {
  if (Platform.OS !== 'android') return true;

  try {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const granted = Object.values(result).every(
      (v) => v === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!granted) {
      Alert.alert('Permission required', 'Please enable Bluetooth permissions');
      return false;
    }
    return true;
  } catch (err) {
    console.log('Permission error', err);
    return false;
  }
}

/* -----------------------------
   2️⃣ List paired printers
--------------------------------- */
export async function listPrinters() {
  if (Platform.OS === 'web') {
    console.log('🖨️ Web: returning mock printer list');
    return [{ name: 'Web Demo Printer', address: 'WEB-001' }];
  }

  await requestBluetoothPermission();
  const enabled = await BluetoothSerial.isBluetoothEnabled();
  if (!enabled) await BluetoothSerial.requestEnabled();
  const devices = await BluetoothSerial.getBondedDevices();
  return devices || [];
}

/* -----------------------------
   3️⃣ Connect to a printer
--------------------------------- */
export async function connectPrinter(address) {
  if (Platform.OS === 'web') {
    Alert.alert('Web mode', 'Simulated printer connected');
    return { name: 'Web Demo Printer', address };
  }

  try {
    const device = await BluetoothSerial.connectToDevice(address);
    return device;
  } catch (err) {
    throw new Error('Unable to connect to printer');
  }
}

/* -----------------------------
   4️⃣ Print formatted receipt
--------------------------------- */
export async function printReceipt(device, order) {
  if (!device || !order) {
    Alert.alert('Error', 'Printer or order missing');
    return;
  }

  // --- Header ---
  let text = '';
  text += '\n';
  text += centerText('THE GOLDEN CUP CAFE');
  text += centerText('------------------------------');
  text += centerText(`Order #${order.id}`);
  text += centerText(`Customer: ${order.customer_name || 'Walk-in'}`);
  text += centerText(formatDate(order.created_at));
  text += '\n';

  // --- Items ---
  text += 'Item               Qty  Price  Amt\n';
  text += '--------------------------------\n';
  (order.items || []).forEach((i) => {
    const name = i.item_name.padEnd(16, ' ').substring(0, 16);
    const qty = String(i.qty).padStart(3, ' ');
    const price = String(Number(i.price).toFixed(0)).padStart(6, ' ');
    const amt = String((i.qty * Number(i.price)).toFixed(0)).padStart(6, ' ');
    text += `${name}${qty}${price}${amt}\n`;
  });

  // --- Totals ---
  text += '--------------------------------\n';
  const total = order.items.reduce(
    (sum, i) => sum + i.qty * Number(i.price),
    0
  );
  text += rightText(`TOTAL: ₹${total.toFixed(2)}`);
  text += '\n\n';

  // --- Footer ---
  text += centerText('Thank you! Visit Again ☕');
  text += '\n\n\n';

  if (Platform.OS === 'web') {
    console.log('🖨️ Web simulated print:\n' + text);
    Alert.alert('🖨️ Web Print Preview', text);
    return;
  }

  try {
    await device.write(text);
  } catch (err) {
    Alert.alert('Print Failed', err.message);
  }
}

/* -----------------------------
   5️⃣ Helpers for formatting
--------------------------------- */
function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return '';
  }
}

function centerText(str) {
  const width = 32;
  const space = Math.floor((width - str.length) / 2);
  return ' '.repeat(space > 0 ? space : 0) + str + '\n';
}

function rightText(str) {
  const width = 32;
  const space = Math.max(width - str.length, 0);
  return ' '.repeat(space) + str + '\n';
}
