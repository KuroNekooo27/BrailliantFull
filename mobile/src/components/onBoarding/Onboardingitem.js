import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Image } from 'react-native';

const Onboardingitem = ({ item }) => {
    const { width, height } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <Image
                source={item.image}
                style={[styles.image, { width: width * 0.7, height: height * 0.4 }]}
                resizeMode="contain"
            />
            <View style={styles.textContainer}>
                <Text style={[styles.title, { fontSize: width * 0.07 }]}>{item.title}</Text>
                <Text style={[styles.description, { fontSize: width * 0.045, paddingHorizontal: width * 0.1 }]}>
                    {item.description}
                </Text>
            </View>
        </View>
    );
};

export default Onboardingitem;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        flex: 0.7,
        justifyContent: 'center',
    },
    textContainer: {
        flex: 0.3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: '800',
        marginBottom: 10,
        color: '#051440',
        textAlign: 'center',
    },
    description: {
        fontWeight: '300',
        color: '#627594',
        textAlign: 'center',
    },
});
