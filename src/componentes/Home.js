
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
        <ActivityIndicator size="large" color="#F5D477" />
        <Text style={styles.textoCarga}>
          Cargando cartas de Yu-Gi-Oh...
        </Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.error}>
          No se pudieron cargar las cartas:
        </Text>
        <Text style={styles.errorDetalle}>{errorMsg}</Text>
      </View>
    );
  }

  const renderCarta = ({ item: carta }) => {
    const imagen =
      carta.card_images?.[0]?.image_url_small ||
      carta.card_images?.[0]?.image_url;

    return (
      <View style={styles.item}>
        <Text style={styles.nombre} numberOfLines={2}>
          {carta.name}
        </Text>

        {imagen ? (
          <Image
            source={{ uri: imagen }}
            style={styles.imagen}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagenSinCarta}>
            <Text style={styles.textoSinImagen}>
              Imagen no disponible
            </Text>
          </View>
        )}

        <Text style={styles.tipo}>
          {carta.type}
        </Text>

        <Text style={styles.id}>
          ID: {carta.id}
        </Text>

        {carta.attribute && (
          <Text style={styles.dato}>
            Atributo: {carta.attribute}
          </Text>
        )}

        {carta.level != null && (
          <Text style={styles.dato}>
            Nivel: {carta.level} ⭐
          </Text>
        )}

        {(carta.atk != null || carta.def != null) && (
          <View style={styles.estadisticas}>
            {carta.atk != null && (
              <Text style={styles.ataque}>
                ATK: {carta.atk}
              </Text>
            )}

            {carta.def != null && (
              <Text style={styles.defensa}>
                DEF: {carta.def}
              </Text>
            )}
          </View>
        )}

        <Text style={styles.descripcion} numberOfLines={4}>
          {carta.desc}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>
          YU-GI-OH! CARDS
        </Text>

        <Text style={styles.subtitulo}>
          Explora tu colección de cartas
        </Text>
      </View>

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
        removeClippedSubviews={true}
        ListEmptyComponent={
          <Text style={styles.sinResultados}>
            No se encontraron cartas.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#081522',
  },

  encabezado: {
    backgroundColor: '#101F30',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#C9A44C',
    alignItems: 'center',
  },

  titulo: {
    color: '#F5D477',
    fontSize: 25,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  subtitulo: {
    color: '#C6D0DC',
    fontSize: 13,
    marginTop: 5,
  },

  lista: {
    padding: 8,
    paddingBottom: 25,
  },

  fila: {
    justifyContent: 'space-around',
  },

  item: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: '#17283A',
    borderWidth: 1.5,
    borderColor: '#C9A44C',
    borderRadius: 12,
    padding: 9,
    margin: 5,
    alignItems: 'center',
    elevation: 6,
  },

  nombre: {
    color: '#F5D477',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    minHeight: 38,
    marginBottom: 7,
  },

  imagen: {
    width: '100%',
    height: 185,
    backgroundColor: '#0B1927',
    borderRadius: 7,
    marginBottom: 9,
  },

  imagenSinCarta: {
    width: '100%',
    height: 185,
    backgroundColor: '#0B1927',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
  },

  textoSinImagen: {
    color: '#C6D0DC',
    fontSize: 11,
  },

  tipo: {
    color: '#F5D477',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },

  id: {
    color: '#8496A9',
    fontSize: 10,
    marginBottom: 5,
  },

  dato: {
    color: '#D5DDE6',
    fontSize: 11,
    marginVertical: 2,
  },

  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 9,
    paddingVertical: 7,
    backgroundColor: '#0B1927',
    borderRadius: 6,
  },

  ataque: {
    color: '#FF7777',
    fontSize: 11,
    fontWeight: 'bold',
  },

  defensa: {
    color: '#75B9FF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  descripcion: {
    color: '#C6D0DC',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 9,
  },

  centrado: {
    flex: 1,
    backgroundColor: '#081522',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  textoCarga: {
    color: '#F5D477',
    fontSize: 15,
    marginTop: 15,
  },

  error: {
    color: '#FF7777',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  errorDetalle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },

  sinResultados: {
    color: '#F5D477',
    textAlign: 'center',
    marginTop: 30,
  },
});
