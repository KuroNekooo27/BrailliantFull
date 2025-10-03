import { useDevice } from "../../context/DeviceContext";
import { Buffer } from "buffer";
import { Alert } from "react-native";

const FALLBACK_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const FALLBACK_CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

/**
 * Hook to send text to the connected Braille device (AT-09)
 */
export const useSendToBrailleDevice = () => {
  const { connectedDevice } = useDevice();

  const sendToBrailleDevice = async (text) => {
    try {
      if (!connectedDevice) throw new Error("No connected device");

      const isConnected = await connectedDevice.isConnected();
      if (!isConnected) throw new Error("Device is disconnected");

      await connectedDevice.discoverAllServicesAndCharacteristics();

      // Encode to Base64
      const base64Data = Buffer.from(text, "utf-8").toString("base64");

      // ✅ Use writeWithoutResponse (AT-09/HM-10 requirement)
      try {
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          FALLBACK_SERVICE_UUID,
          FALLBACK_CHARACTERISTIC_UUID,
          base64Data
        );
        Alert.alert("✅ Success", `Sent via FFE0/FFE1: "${text}"`);
        return true;
      } catch (ffeError) {
        Alert.alert("⚠️ FFE0/FFE1 Failed", ffeError.message || String(ffeError));
        console.warn("FFE0/FFE1 write failed:", ffeError);
      }

      // 🔍 Fallback → search all services for writable characteristic
      let targetChar = null;
      const services = await connectedDevice.services();

      for (const service of services) {
        const characteristics = await service.characteristics();
        targetChar = characteristics.find(
          (c) => c.isWritableWithResponse || c.isWritableWithoutResponse
        );
        if (targetChar) {
          console.log("✅ Found writable:", targetChar.uuid, "in service:", service.uuid);
          break;
        }
      }

      if (!targetChar) {
        Alert.alert("❌ Error", "No writable characteristic found");
        return false;
      }

      // Try sending again via discovered characteristic
      await connectedDevice.writeCharacteristicWithoutResponseForService(
        targetChar.serviceUUID,
        targetChar.uuid,
        base64Data
      );

      Alert.alert("✅ Success", `Sent via dynamic char: "${text}"`);
      return true;

    } catch (err) {
      Alert.alert("❌ Failed", err.message || String(err));
      console.error("❌ Failed to send:", err);
      return false;
    }
  };

  return { sendToBrailleDevice };
};
