import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from
'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig'; // Ajusta el path si es diferente
//import { useNavigation } from '@react-navigation/native';}
import { useNavigation } from '@react-navigation/native';

export default function Login() {
const [correo, setCorreo] = useState('');
const [contrasena, setContrasena] = useState('');
const navigation = useNavigation();

const handleLogin = async () => {
try {
await signInWithEmailAndPassword(auth, correo, contrasena);
} catch (error) {
Alert.alert('Error al iniciar sesión', error.message);
}
};

return (
<View style={styles.container}>
<Text style={styles.titulo}>Iniciar Sesión</Text>

<TextInput
placeholder="Correo electrónico"
value={correo}
onChangeText={setCorreo}
style={styles.input}
autoCapitalize="none"
keyboardType="email-address"
/>
<TextInput
placeholder="Contraseña"
value={contrasena}
onChangeText={setContrasena}
style={styles.input}
secureTextEntry
/>

<Button title="Ingresar" onPress={handleLogin} />
<View style={{ marginTop: 10 }}>
<Button title="¿No tienes cuenta? Regístrate" onPress={() =>
navigation.navigate('Registro')} />
</View>
</View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081522',
    justifyContent: 'center',
    padding: 25,
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 15,
  },

  title: {
    color: '#F5D477',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    color: '#C6D0DC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },

  form: {
    backgroundColor: '#17283A',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#C9A44C',
    padding: 20,
  },

  input: {
    backgroundColor: '#0B1927',
    borderWidth: 1,
    borderColor: '#A9873C',
    borderRadius: 9,
    padding: 14,
    color: '#FFFFFF',
    marginVertical: 8,
  },

  loginButton: {
    backgroundColor: '#A68136',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  registerText: {
    color: '#F5D477',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },

  errorText: {
    color: '#FF7777',
    textAlign: 'center',
    marginTop: 10,
  },
});