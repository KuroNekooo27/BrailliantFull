import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const SessionSummaryModal = ({ visible, onProceed, sessionData }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.text}>Date:   {sessionData.date}</Text>
          <Text style={styles.text}>Student Name:   {sessionData.studentName}</Text>
          <Text style={styles.text}>Book:   {sessionData.book}</Text>
          <Text style={styles.text}>Time Elapsed:   {sessionData.timeElapsed}</Text>

          <TouchableOpacity style={styles.button} onPress={onProceed}>
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#FF6A2C", // Orange like your screenshot
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SessionSummaryModal;
