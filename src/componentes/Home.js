
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

export default function Home() {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await fetch(
          "https://db.ygoprodeck.com/api/v7/cardinfo.php"
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

  return (
    <ScrollView>
      <View style={styles.lista}>
        {data.map((carta) => (
          <View key={carta.id} style={styles.item}>

            <Text style={styles.nombre}>
              {carta.name}
            </Text>

            <Image
              source={{
                uri: carta.card_images?.[0]?.image_url,
              }}
              style={styles.imagen}
            />

            <Text style={styles.id}>
              ID: {carta.id}
            </Text>

            <Text style={styles.tipo}>
              {carta.type}
            </Text>

            {carta.attribute && (
              <Text>
                Atributo: {carta.attribute}
              </Text>
            )}

            {carta.level !== undefined && (
              <Text>
                Nivel: {carta.level}
              </Text>
            )}

            {carta.atk !== undefined && (
              <Text>
                ATK: {carta.atk}
              </Text>
            )}

            {carta.def !== undefined && (
              <Text>
                DEF: {carta.def}
              </Text>
            )}

            <Text style={styles.descripcion}>
              {carta.desc}
            </Text>

          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'space-between',
    padding: 10,
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
