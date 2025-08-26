import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const EditProfileModal = ({ visible, onClose, onSubmit, user }) => {
  const [firstname, setFirstname] = useState(user.user_fname);
  const [lastname, setLastname] = useState(user.user_lname);
  const [email, setEmail] = useState(user.user_email);

  let userID = useState(user._id)

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFormSubmit = () => {
    if (newPassword) {
      if (!currentPassword) {
        return Alert.alert('Validation Error', 'Enter current password to change your password.');
      }
      if (newPassword.length < 6) {
        return Alert.alert('Validation Error', 'New password must be at least 6 characters.');
      }
      if (newPassword !== confirmPassword) {
        return Alert.alert('Validation Error', 'New password and confirmation do not match.');
      }
    }

    const formData = {
      firstname,
      lastname,
      email,
      userID
    };

    if (newPassword) {
      formData.currentPassword = currentPassword;
      formData.newPassword = newPassword;
    }

    onSubmit(formData);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Profile</Text>

          <TextInput
            placeholder="First Name"
            value={firstname}
            onChangeText={setFirstname}
            style={styles.input}
          />
          <TextInput
            placeholder="Last Name"
            value={lastname}
            onChangeText={setLastname}
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
          />

          {/* Current Password */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword.current}
            />
            <TouchableOpacity onPress={() => toggleVisibility('current')}>
              <Feather name={showPassword.current ? 'eye' : 'eye-off'} size={20} />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword.new}
            />
            <TouchableOpacity onPress={() => toggleVisibility('new')}>
              <Feather name={showPassword.new ? 'eye' : 'eye-off'} size={20} />
            </TouchableOpacity>
          </View>

          {/* Confirm New Password */}
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.passwordInput}
              secureTextEntry={!showPassword.confirm}
            />
            <TouchableOpacity onPress={() => toggleVisibility('confirm')}>
              <Feather name={showPassword.confirm ? 'eye' : 'eye-off'} size={20} />
            </TouchableOpacity>
          </View>

          <Button title="Submit" onPress={handleFormSubmit} />
          <Button title="Cancel" onPress={onClose} color="red" />
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingVertical: 4,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 4,
  },
});
