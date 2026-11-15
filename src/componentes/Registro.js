import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from
'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function Registro() {
const [nombre, setNombre] = useState('');
const [correo, setCorreo] = useState('');
const [contrasena, setContrasena] = useState('');
const [fecha, setFecha] = useState('');
const [telefono, setTelefono] = useState('');
const navigation = useNavigation();

let ganados = 0;
let perdidos = 0;

const handleRegistro = async () => {
try {
const userCredential = await createUserWithEmailAndPassword(auth,
correo, contrasena);
const user = userCredential.user;

// 🔁 Guardar datos en Firestore con el mismo UID como ID del
documento
await setDoc(doc(db, 'usuarios', user.uid), {
uid: user.uid,
nombre,
correo,
fecha,
telefono,
ganados,

perdidos
});

Alert.alert('Éxito', 'Usuario registrado correctamente');
navigation.navigate('Login'); // o a Home si prefieres
} catch (error) {
Alert.alert('Error al registrarse', error.message);
}
};

return (
<View style={styles.container}>
<Text style={styles.titulo}>Registro</Text>

<TextInput placeholder="Nombre" value={nombre}
onChangeText={setNombre} style={styles.input} />
<TextInput placeholder="Correo" value={correo}
onChangeText={setCorreo} style={styles.input} />
<TextInput placeholder="Contraseña" value={contrasena}
onChangeText={setContrasena} secureTextEntry style={styles.input} />
<TextInput placeholder="Fecha de nacimiento" value={fecha}
onChangeText={setFecha} style={styles.input} />
<TextInput placeholder="Teléfono" value={telefono}
onChangeText={setTelefono} keyboardType="phone-pad"
style={styles.input} />

<Button title="Registrarse" onPress={handleRegistro} />
<View style={{ marginTop: 10 }}>
<Button title="¿Ya tienes cuenta? Inicia sesión" onPress={() =>
navigation.navigate('Login')} />
</View>

</View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081522',
    justifyContent: 'center',
    padding: 22,
  },

  title: {
    color: '#F5D477',
    fontSize: 29,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    color: '#C6D0DC',
    textAlign: 'center',
    marginBottom: 25,
  },

  form: {
    backgroundColor: '#17283A',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#C9A44C',
    padding: 18,
  },

  input: {
    backgroundColor: '#0B1927',
    borderColor: '#A9873C',
    borderWidth: 1,
    borderRadius: 9,
    padding: 13,
    color: '#FFFFFF',
    marginVertical: 7,
  },

  registerButton: {
    backgroundColor: '#A68136',
    padding: 15,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginText: {
    color: '#F5D477',
    textAlign: 'center',
    marginTop: 20,
  },

  errorText: {
    color: '#FF7777',
    textAlign: 'center',
    marginTop: 10,
  },
});