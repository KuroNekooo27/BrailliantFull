import React from "react";
import { View, StyleSheet } from "react-native";

const BrailleLetter = ({ dots }) => {
  const dotArray = dots.split("");

  const getDotStyle = (num) => ({
    backgroundColor: dotArray[num] === "1" ? "black" : "white",
    borderWidth: dotArray[num] === "1" ? 0 : 1,
    borderColor: "black",
  });

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <View style={[styles.dot, getDotStyle(0)]} />
        <View style={[styles.dot, getDotStyle(1)]} />
        <View style={[styles.dot, getDotStyle(2)]} />
      </View>
      <View style={styles.column}>
        <View style={[styles.dot, getDotStyle(3)]} />
        <View style={[styles.dot, getDotStyle(4)]} />
        <View style={[styles.dot, getDotStyle(5)]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 4,
  },
  column: {
    flexDirection: "column",
    gap: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default BrailleLetter;