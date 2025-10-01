import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const EditProfileModal = ({ visible, onClose, onSubmit, user }) => {
  const [firstname, setFirstname] = useState(user.user_fname || '');
  const [lastname, setLastname] = useState(user.user_lname || '');
  const [email, setEmail] = useState(user.user_email || '');

  const userID = user._id;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Real-time validation
  useEffect(() => {
    validateForm();
  }, [firstname, lastname, email, currentPassword, newPassword, confirmPassword]);

  const validateForm = () => {
    let newErrors = {};

    if (!firstname.trim() || firstname.length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    }
    if (!lastname.trim() || lastname.length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Enter your current password';
      }
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;

    const formData = {
      firstname,
      lastname,
      email,
      userID,
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

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* First Name */}
            <TextInput
              placeholder="First Name"
              value={firstname}
              onChangeText={setFirstname}
              style={[styles.input, errors.firstname && styles.errorInput]}
            />
            {errors.firstname && <Text style={styles.errorText}>{errors.firstname}</Text>}

            {/* Last Name */}
            <TextInput
              placeholder="Last Name"
              value={lastname}
              onChangeText={setLastname}
              style={[styles.input, errors.lastname && styles.errorInput]}
            />
            {errors.lastname && <Text style={styles.errorText}>{errors.lastname}</Text>}

            {/* Email */}
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, errors.email && styles.errorInput]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Current Password */}
            <View style={[styles.passwordWrapper, errors.currentPassword && styles.errorInput]}>
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
            {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}

            {/* New Password */}
            <View style={[styles.passwordWrapper, errors.newPassword && styles.errorInput]}>
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
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

            {/* Confirm Password */}
            <View style={[styles.passwordWrapper, errors.confirmPassword && styles.errorInput]}>
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
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            {/* Buttons */}
            <TouchableOpacity
              style={[styles.button, Object.keys(errors).length > 0 && styles.disabledButton]}
              onPress={handleFormSubmit}
              disabled={Object.keys(errors).length > 0}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    maxHeight: '85%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 6,
  },
  errorInput: {
    borderColor: 'red',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
});
