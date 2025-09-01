import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import OtpModal from './OtpModal'; // reuse your OTP modal

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/forgot-password', {
        email,
      });

      Alert.alert('Success', data.message || 'OTP sent to your email');
      setUserId(data.userId); // assuming backend returns userId
      setShowOtpModal(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otpValue) => {
    try {
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/verify-forgot-otp', { // Make sure this URL matches your updated router.post path
        userId,
        otp: otpValue,
      });

      // --- IMPORTANT CHANGE HERE ---
      // The backend now sends the temporary password via email, not in the response.
      Alert.alert('Password Reset', data.message || 'A temporary password has been sent to your email address.');
      // --- END IMPORTANT CHANGE ---

      setShowOtpModal(false); // Close the OTP modal
      onClose(); // Close the Forgot Password modal
      setEmail(''); // Clear email input
      setUserId(null); // Clear userId
    } catch (error) {
      Alert.alert('OTP Error', error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.label}>Enter your registered email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={handleSendOtp} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reused OTP Modal */}
      <OtpModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleOtpSubmit}
      />
    </Modal>
  );
};

export default ForgotPasswordModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0f0f2d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancel: {
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});
