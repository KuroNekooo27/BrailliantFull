import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import OtpModal from '../ui/OtpModal';
import ForgotPasswordModal from '../ui/ForgotPasswordModal';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setState } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);


  const togglePasswordVisibility = () => setSecureText(!secureText);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter valid credentials');
      return;
    }

    try {
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/login', {
        email,
        password,
      });
      if (data.otpSent) {
        setUserId(data.userId);
        setShowOtp(true);
      } else {
        Alert.alert('Error', 'Unexpected login flow');
      }
    } catch (error) {
      Alert.alert('Login Error', error.response?.data?.message || 'An error occurred');
    }
  };

  const handleOtpSubmit = async (otpValue) => {
    try {
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/verify-login-otp', {
        userId,
        otp: otpValue,
      })
      
      await AsyncStorage.setItem('@auth', JSON.stringify(data));
      setState(data);
      navigation.navigate('Main');
      setShowOtp(false);
    } catch (error) {
      Alert.alert('OTP Error', error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/splash-icon.png')} style={styles.banner}/>
      <Text style={styles.title}>Log In</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your Email</Text>
        <TextInput
          style={styles.input}
          placeholder="mavyorbit@gmail.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Ionicons name={secureText ? 'eye-off' : 'eye'} size={20} color="#444" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setShowForgotPasswordModal(true)}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <OtpModal visible={showOtp} onClose={() => setShowOtp(false)} onSubmit={handleOtpSubmit} />
      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  banner:{
    width: '100%',
    resizeMode: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    flex: 0.3,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#222',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    color: '#888',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    paddingRight: 40,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  forgot: {
    textAlign: 'right',
    color: '#999',
    fontSize: 13,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#0f0f2d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
