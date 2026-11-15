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
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await fetch(
          'https://db.ygoprodeck.com/api/v7/cardinfo.php'
        );

        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const json = await res.json();
        setData(json.data || []);
      } catch (error) {
        console.error('Error al obtener cartas:', error);
        setErrorMsg(error.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#d4af37" />
        <Text>Cargando cartas de Yu-Gi-Oh...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={{ color: 'red', textAlign: 'center' }}>
          No se pudieron cargar las cartas: {errorMsg}
        </Text>
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
    <View style={styles.contenedor}>
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
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No se encontraron cartas.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081522',
    padding: 15,
  },

  title: {
    color: '#F5D477',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
    letterSpacing: 1,
  },

  subtitle: {
    color: '#C6D0DC',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },

  searchInput: {
    backgroundColor: '#17283A',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B89445',
    borderRadius: 10,
    padding: 13,
    marginBottom: 18,
  },

  cardContainer: {
    backgroundColor: '#17283A',
    borderWidth: 1.5,
    borderColor: '#C9A44C',
    borderRadius: 12,
    padding: 10,
    margin: 7,
    flex: 1,
    alignItems: 'center',
    elevation: 6,
  },

  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    borderRadius: 7,
  },

  cardName: {
    color: '#F5D477',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },

  cardDescription: {
    color: '#D5DDE6',
    fontSize: 11,
    textAlign: 'center',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },

  attack: {
    color: '#FF7777',
    fontWeight: 'bold',
  },

  defense: {
    color: '#75B9FF',
    fontWeight: 'bold',
  },

  button: {
    backgroundColor: '#9C7933',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

