import React, { useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../ui/CustomHeader';
import { convertTextToBrailleDots } from '../brailleConverter/brailleConverter';
import BrailleLetter from '../brailleConverter/BrailleLetter';
import { useDevice } from '../../context/DeviceContext';
import DisconnectionModal from '../ui/DisconnectionModal';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const TextToBrailleScreen = () => {
  const [text, setText] = useState('');
  const { connectedDevice, setConnectedDevice } = useDevice();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const { state, setState } = useContext(AuthContext);

  useEffect(() => {
    if (!connectedDevice) return;

    const monitor = connectedDevice.onDisconnected(() => {
      setConnectedDevice(null);
      setIsDisconnected(true);
    });

    return () => monitor.remove();
  }, [connectedDevice]);

  const handleSync = () => {
    if (!connectedDevice) {
      Alert.alert(
        'No Device Connected',
        'Please connect your Brailliant RBD before syncing text.'
      );
      return;
    }

    // TODO: send text to device via BLE here
    console.log('Sending Braille data:', text);
  };

  const brailleDots = convertTextToBrailleDots(text).split(' ');

  return (
    <View style={styles.container}>
      <CustomHeader title="Text-to-Braille" image = {state.user.user_img} />

      <View style={styles.contentWrapper}>
        <Text style={styles.description}>
          Type custom text and sync in simple Braille sentences with the Brailliant RBD!
        </Text>

        <View style={styles.textBoxWrapper}>
          <TextInput
            multiline
            placeholder="Input text here...."
            style={styles.input}
            maxLength={8}
            value={text}
            onChangeText={setText}
          />
          <Text style={styles.charCount}>{text.length}/8 characters</Text>
        </View>

        <Text style={styles.previewLabel}>PREVIEW</Text>
        <View style={styles.previewBox}>
          {text.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {brailleDots.map((dot, index) => (
                <BrailleLetter key={index} dots={dot} />
              ))}
            </ScrollView>
          ) : (
            <Text style={{ color: '#aaa' }}>Braille output will show here</Text>
          )}
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Ionicons name="sync" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.syncText}>SYNC TEXT</Text>
        </TouchableOpacity>
      </View>

      <DisconnectionModal visible={isDisconnected} onClose={() => setIsDisconnected(false)} />

    </View>
  );
};

export default TextToBrailleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  contentWrapper: {
    padding: 16,
  },
  description: {
    fontSize: width < 600 ? 14 : 15,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  textBoxWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    minHeight: 120,
    marginBottom: 6,
  },
  input: {
    fontSize: width < 600 ? 12 : 14,
    textAlignVertical: 'top',
    minHeight: 80,
    color: '#000',
  },
  charCount: {
    textAlign: 'right',
    fontSize: width < 600 ? 10 : 12,
    color: '#999',
  },
  previewLabel: {
    fontSize: width < 600 ? 12 : 13,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: '600',
    color: '#333',
  },
  previewBox: {
    backgroundColor: '#eaeaea',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffa500',
    marginTop: 24,
    borderRadius: 30,
    paddingVertical: 12,
  },
  syncText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width < 600 ? 12 : 14,
  },
});
