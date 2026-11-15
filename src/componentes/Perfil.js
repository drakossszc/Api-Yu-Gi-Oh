import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from
'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

export default function Perfil() {
const [nombre, setNombre] = useState('');
const [fecha, setFecha] = useState('');
const [telefono, setTelefono] = useState('');
const [cargando, setCargando] = useState(true);

const uid = auth.currentUser?.uid;

useEffect(() => {
if (!uid) return;
const traerDatos = async () => {
const docRef = doc(db, 'usuarios', uid);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
const data = docSnap.data();

setNombre(data.nombre || '');
setFecha(data.fecha || '');
setTelefono(data.telefono || '');
} else {
Alert.alert('Usuario no encontrado');
}
setCargando(false);
};
traerDatos();
}, [uid]);

const actualizarDatos = async () => {
try {
const docRef = doc(db, 'usuarios', uid);
await updateDoc(docRef, {
nombre,
fecha,
telefono,
});
Alert.alert('Datos actualizados');
} catch (error) {
console.error(error);
Alert.alert('Error al actualizar');
}
};

if (cargando) return <Text style={styles.cargando}>Cargando...</Text>;

return (

<View style={styles.contenedor}>

<Text style={styles.titulo}>Perfil del Usuario</Text>

<TextInput
style={styles.input}
placeholder="Nombre"
value={nombre}
onChangeText={setNombre}
/>

<TextInput
style={styles.input}
placeholder="Fecha de nacimiento (YYYY-MM-DD)"
value={fecha}
onChangeText={setFecha}
/>

<TextInput
style={styles.input}
placeholder="Teléfono"
value={telefono}
onChangeText={setTelefono}
keyboardType="phone-pad"
/>
<Button title="Guardar cambios" onPress={actualizarDatos} />
</View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081522',
    padding: 20,
  },

  title: {
    color: '#F5D477',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },

  profileCard: {
    backgroundColor: '#17283A',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#C9A44C',
    padding: 20,
    alignItems: 'center',
    elevation: 7,
  },

  avatar: {
    width: 115,
    height: 115,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#D6B65C',
    marginBottom: 15,
  },

  username: {
    color: '#F5D477',
    fontSize: 22,
    fontWeight: 'bold',
  },

  description: {
    color: '#C6D0DC',
    fontSize: 14,
    marginVertical: 8,
  },

  input: {
    width: '100%',
    backgroundColor: '#0D1B29',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A9873C',
    borderRadius: 9,
    padding: 12,
    marginVertical: 7,
  },

  saveButton: {
    backgroundColor: '#9C7933',
    width: '100%',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});