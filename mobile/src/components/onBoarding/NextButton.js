import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

const NextButton = ({ scrollTo, buttonText }) => {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <TouchableOpacity style={[styles.button, { paddingHorizontal: width * 0.1 }]} onPress={scrollTo}>
                <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default NextButton;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: '6%',
    },
    button: {
        backgroundColor: '#003366',
        paddingVertical: 14,
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
