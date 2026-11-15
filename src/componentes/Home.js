import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';

export default function Home() {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Puedes pedir solo 50 cartas usando num y offset, o recortar el resultado
        const res = await fetch(
          "https://ygoprodeck.com"
        );

        const json = await res.json();
        setData(json.data || []);
      } catch (error) {
        console.error("Error al obtener cartas:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text>Cargando cartas de Yu-Gi-Oh...</Text>
      </View>
    );
  }

  const renderCarta = ({ item: carta }) => (
    <View style={styles.item}>
      <Text style={styles.nombre} numberOfLines={2}>
        {carta.name}
      </Text>

      <Image
        source={{
          // Usamos image_url_small para cargar mucho más rápido en listas
          uri: carta.card_images?.[0]?.image_url_small,
        }}
        style={styles.imagen}
      />

      <Text style={styles.id}>ID: {carta.id}</Text>
      <Text style={styles.tipo}>{carta.type}</Text>

      {carta.attribute && <Text>Atributo: {carta.attribute}</Text>}
      {carta.level != null && <Text>Nivel: {carta.level}</Text>}
      {carta.atk != null && <Text>ATK: {carta.atk}</Text>}
      {carta.def != null && <Text>DEF: {carta.def}</Text>}

      <Text style={styles.descripcion} numberOfLines={4}>
        {carta.desc}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderCarta}
      numColumns={2}
      contentContainerStyle={styles.lista}
      columnWrapperStyle={styles.fila}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: 10,
  },
  fila: {
    justifyContent: 'space-between',
  },
  item: {
    backgroundColor: 'aliceblue',
    width: '48%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  nombre: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 5,
  },
  imagen: {
    width: 130,
    height: 180,
    resizeMode: 'contain',
  },
  id: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
  },
  tipo: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  descripcion: {
    fontSize: 11,
    textAlign: 'justify',
    marginTop: 5,
  },
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
