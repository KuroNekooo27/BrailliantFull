import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import CustomHeader from '../ui/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import OtpModal from '../ui/OtpModal';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditProfileModal from "../ui/EditProfileModal";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { state, setState } = useContext(AuthContext);
  const [showOtp, setShowOtp] = useState(false);
  const [userId, setUserId] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [pendingEditData, setPendingEditData] = useState(null);
  const [otpContext, setOtpContext] = useState('');
  const [loading, setLoading] = useState(false);

  let name = `${state.user.user_fname} ${state.user.user_lname}`;
  let isActivated = state.user.isActivated;

  const handleUploadPicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Please allow access to your photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,

      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const base64Img = `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`;

      setLoading(true);


      const { data } = await axios.put(
        `https://brailliantweb.onrender.com/upload/mobile/${state.user._id}`,
        { image: base64Img, type: asset.mimeType || "image/jpeg" },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!data.success) throw new Error(data.message);

      const updatedUser = { ...state.user, user_img: data.imageUrl };
      const updatedData = { ...state, user: updatedUser };

      await AsyncStorage.setItem("@auth", JSON.stringify(updatedData));
      setState(updatedData);

      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.log("Upload error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (newData) => {
    try {
      setLoading(true);
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/send-otp-for-edit', {
        email: newData.email,
      });

      if (data.otpSent) {
        setOtpContext('edit');
        setPendingEditData(newData);
        setUserId(data.userId);
        setShowOtp(true);
      } else {
        Alert.alert('Error', 'Could not send OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setEditVisible(false);
      setLoading(false);
    }
  };

  const handleEditOtpSubmit = async (otp) => {
    try {
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/verify-edit', {
        otp,
        ...pendingEditData,
      });

      if (!data.success) throw new Error(data.message);

      const newData = await axios.put("https://brailliantweb.onrender.com/api/v1/auth/update", pendingEditData);
      const updatedData = { ...state, user: newData.data.updatedUser };

      const newAudit = {
        at_user: newData.data.updatedUser.user_email,
        at_date: new Date(),
        at_action: 'Edited Profile',
        at_details: {
          at_edit_profile: {
            at_ep_fn_old: updatedData.user.user_fname,
            at_ep_ln_old: updatedData.user.user_lname,
            at_ep_dob_old: updatedData.user.user_dob,
            at_ep_email_old: updatedData.user.user_email,
            at_ep_img_old: updatedData.user.user_img,

            at_ep_fn_new: newData.data.updatedUser.user_fname,
            at_ep_ln_new: newData.data.updatedUser.user_lname,
            at_ep_dob_new: newData.data.updatedUser.user_dob,
            at_ep_email_new: newData.data.updatedUser.user_email,
            at_ep_img_new: newData.data.updatedUser.user_img,
          }
        }
      };
      await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);
      await AsyncStorage.setItem('@auth', JSON.stringify(newData));
      setState(updatedData);
      Alert.alert('Success', 'Profile updated');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'OTP verification failed');
    } finally {
      setShowOtp(false);
      setPendingEditData(null);
      setOtpContext('');
    }
  };

  const handleActivate = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/activate', {
        email: state.user.user_email,
      });

      if (data.otpSent) {
        setOtpContext('activate');
        setUserId(data._id);
        setShowOtp(true);
      } else {
        Alert.alert('Error', 'Unexpected Activation flow');
      }
    } catch (error) {
      console.log("Activation Error:", error);
      Alert.alert('Activation Error', error?.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otpValue) => {
    try {
      const { data } = await axios.post('https://brailliantweb.onrender.com/api/v1/auth/activate-otp', {
        userId,
        otp: otpValue,
      });

      if (!data.success) throw new Error(data.message || 'Activation failed');

      const newAudit = {
        at_user: data.user.user_email,
        at_date: new Date(),
        at_action: 'Activated Account'
      };
      await axios.post('https://brailliantweb.onrender.com/api/newaudittrail', newAudit);

      const updatedData = {
        ...state,
        user: data.user,
      };
      await AsyncStorage.setItem('@auth', JSON.stringify(updatedData));
      setState(updatedData);

      Alert.alert('Success', 'Account successfully activated.');
    } catch (error) {
      Alert.alert('OTP Error', error.response?.data?.message || error.message || 'Invalid OTP');
    } finally {
      setShowOtp(false);
      setOtpContext('');
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="My Profile" onBack={() => navigation.goBack()} image={state.user.user_img} />

      <View style={styles.content}>
        <Image
          source={state.user.user_img ? { uri: state.user.user_img } : require('../../../assets/adaptive-icon.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{name}</Text>

        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPicture}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={styles.uploadText}>Upload Picture</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>Personal Information</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)}>
            <Feather name="edit" size={16} color="#000" />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>First Name: {state.user.user_fname}</Text>
          <Text style={styles.infoText}>Last Name: {state.user.user_lname}</Text>
          <Text style={styles.infoText}>Email: {state.user.user_email}</Text>

          <View style={styles.statusRow}>
            <Text style={styles.infoText}>
              Account Status: {' '}
              <Text style={isActivated ? styles.activatedText : styles.notActivatedText}>
                {isActivated ? "Activated" : "Not Activated"}
              </Text>
            </Text>

            {!state.user.isActivated && (
              <TouchableOpacity
                style={styles.activateBtn}
                onPress={handleActivate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="green" />
                ) : (
                  <Text style={styles.activateText}>Activate</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Modals */}
      <OtpModal
        visible={showOtp}
        onClose={() => setShowOtp(false)}
        onSubmit={otpContext === 'edit' ? handleEditOtpSubmit : handleOtpSubmit}
      />

      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSubmit={handleEditSubmit}
        user={state.user}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  content: { alignItems: 'center', padding: 16 },
  avatar: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    marginTop: 12,
  },
  name: {
    fontSize: width < 600 ? 16 : 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'orange',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  uploadText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  infoHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: width < 600 ? 14 : 16,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
  },
  editText: {
    marginLeft: 4,
    fontSize: width < 600 ? 12 : 14,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999',
  },
  infoText: {
    fontSize: width < 600 ? 12 : 14,
    marginBottom: 6,
  },
  activatedText: {
    color: 'green',
    fontWeight: 'bold',
  },
  notActivatedText: {
    color: 'red',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activateBtn: {
    borderWidth: 1,
    borderColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activateText: {
    color: 'green',
    fontSize: width < 600 ? 12 : 14,
  },
});
