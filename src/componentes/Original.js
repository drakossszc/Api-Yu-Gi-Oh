
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

const API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

export default function Original() {

  // ESTADOS DEL JUEGO
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('Preparando duelo...');
  const [gameOver, setGameOver] = useState(false);

  const [vidaJugador, setVidaJugador] = useState(4000);
  const [vidaCPU, setVidaCPU] = useState(4000);

  const [manoJugador, setManoJugador] = useState([]);
  const [manoCPU, setManoCPU] = useState([]);

  const [mazoJugador, setMazoJugador] = useState([]);
  const [mazoCPU, setMazoCPU] = useState([]);

  const [campoJugador, setCampoJugador] = useState(null);
  const [campoCPU, setCampoCPU] = useState(null);

  const [seleccionada, setSeleccionada] = useState(null);

  const [turno, setTurno] = useState('jugador');
  const [invoco, setInvoco] = useState(false);
  const [ataco, setAtaco] = useState(false);

  // MEZCLAR CARTAS
  const mezclar = (cartas) => {
    let resultado = [...cartas];

    for (let i = resultado.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));

      [resultado[i], resultado[j]] =
        [resultado[j], resultado[i]];
    }

    return resultado;
  };

  // OBTENER CARTAS DE LA API
  const iniciarDuelo = async () => {

    setCargando(true);
    setGameOver(false);

    try {

      const [efectos, normales] = await Promise.all([
        fetch(`${API}?type=Effect%20Monster`),
        fetch(`${API}?type=Normal%20Monster`)
      ]);

      if (!efectos.ok || !normales.ok) {
        throw new Error('Error al conectar con la API');
      }

      const datosEfectos = await efectos.json();
      const datosNormales = await normales.json();

      // UNIR LOS DOS TIPOS DE MONSTRUOS
      const todas = [
        ...(datosEfectos.data || []),
        ...(datosNormales.data || [])
      ];

      // FILTRAR CARTAS CON IMAGEN Y ATK VÁLIDO
      const cartasValidas = todas.filter((carta) => {

        return (
          carta.card_images &&
          carta.card_images.length > 0 &&
          Number.isFinite(Number(carta.atk)) &&
          Number(carta.atk) >= 0
        );

      });

      // ELIMINAR CARTAS REPETIDAS
      const cartasUnicas = [
        ...new Map(
          cartasValidas.map(carta => [carta.id, carta])
        ).values()
      ];

      if (cartasUnicas.length < 80) {
        throw new Error('No hay suficientes cartas para el duelo');
      }

      const baraja = mezclar(cartasUnicas);

      // CREAR MAZOS DE 40 CARTAS
      const mazo1 = baraja.slice(0, 40);
      const mazo2 = baraja.slice(40, 80);

      // REPARTIR 5 CARTAS A CADA JUGADOR
      setManoJugador(mazo1.slice(0, 5));
      setManoCPU(mazo2.slice(0, 5));

      setMazoJugador(mazo1.slice(5));
      setMazoCPU(mazo2.slice(5));

      // REINICIAR CAMPO Y PUNTOS
      setVidaJugador(4000);
      setVidaCPU(4000);

      setCampoJugador(null);
      setCampoCPU(null);

      setSeleccionada(null);

      setTurno('jugador');
      setInvoco(false);
      setAtaco(false);

      setMensaje('¡Tu turno! Selecciona una carta.');

    } catch (error) {

      console.log(error);
      setMensaje('No se pudieron cargar las cartas.');

    } finally {

      setCargando(false);

    }
  };

  useEffect(() => {
    iniciarDuelo();
  }, []);

  // OBTENER ATK DE UNA CARTA
  const obtenerATK = (carta) => {
    return Number(carta.atk) || 0;
  };

  // OBTENER IMAGEN
  const obtenerImagen = (carta) => {

    return {
      uri:
        carta.card_images[0].image_url_small ||
        carta.card_images[0].image_url
    };

  };

  // INVOCAR MONSTRUO
  const invocarMonstruo = () => {

    if (turno !== 'jugador' || gameOver) return;

    if (invoco) {
      setMensaje('Ya realizaste tu invocación este turno.');
      return;
    }

    if (campoJugador !== null) {
      setMensaje('Ya tienes un monstruo en el campo.');
      return;
    }

    if (seleccionada === null) {
      setMensaje('Selecciona primero una carta.');
      return;
    }

    const carta = manoJugador.find(
      item => item.id === seleccionada
    );

    if (!carta) return;

    setCampoJugador(carta);

    setManoJugador(
      manoJugador.filter(item => item.id !== carta.id)
    );

    setSeleccionada(null);
    setInvoco(true);

    setMensaje(`${carta.name} ha sido invocado.`);
  };

  // ATACAR
  const atacar = () => {

    if (turno !== 'jugador' || gameOver) return;

    if (!campoJugador) {
      setMensaje('Primero debes invocar un monstruo.');
      return;
    }

    if (ataco) {
      setMensaje('Este monstruo ya atacó.');
      return;
    }

    let lpJugador = vidaJugador;
    let lpCPU = vidaCPU;

    let monstruoJugador = campoJugador;
    let monstruoCPU = campoCPU;

    const atkJugador = obtenerATK(monstruoJugador);

    if (monstruoCPU !== null) {

      const atkCPU = obtenerATK(monstruoCPU);

      if (atkJugador > atkCPU) {

        lpCPU -= atkJugador - atkCPU;
        monstruoCPU = null;

        setMensaje(
          `${monstruoCPU === null ? campoCPU.name : ''} ha sido destruido.`
        );

      } else if (atkJugador < atkCPU) {

        lpJugador -= atkCPU - atkJugador;
        monstruoJugador = null;

        setMensaje('¡Tu monstruo ha sido destruido!');

      } else {

        monstruoJugador = null;
        monstruoCPU = null;

        setMensaje('¡Empate! Ambos monstruos fueron destruidos.');

      }

    } else {

      // ATAQUE DIRECTO
      lpCPU -= atkJugador;

      setMensaje(
        `¡Ataque directo! ${atkJugador} puntos de daño.`
      );

    }

    setCampoJugador(monstruoJugador);
    setCampoCPU(monstruoCPU);

    setVidaJugador(Math.max(0, lpJugador));
    setVidaCPU(Math.max(0, lpCPU));

    setAtaco(true);

    if (lpCPU <= 0) {
      setMensaje('¡VICTORIA! Has ganado el duelo.');
      setGameOver(true);
    } else if (lpJugador <= 0) {
      setMensaje('¡DERROTA! La computadora ha ganado.');
      setGameOver(true);
    }

  };

  // TURNO DE LA COMPUTADORA
  const turnoComputadora = () => {

    setTurno('cpu');
    setMensaje('La computadora está jugando...');

    setTimeout(() => {

      let mano = [...manoCPU];
      let mazo = [...mazoCPU];

      let lpJugador = vidaJugador;
      let lpCPU = vidaCPU;

      let monstruoJugador = campoJugador;
      let monstruoCPU = campoCPU;

      // ROBAR CARTA
      if (mazo.length > 0) {
        mano.push(mazo.shift());
      }

      // INVOCAR EL MONSTRUO CON MAYOR ATK
      if (monstruoCPU === null && mano.length > 0) {

        let mejorCarta = mano.reduce((mejor, actual) => {

          return obtenerATK(actual) > obtenerATK(mejor)
            ? actual
            : mejor;

        });

        monstruoCPU = mejorCarta;

        mano = mano.filter(
          carta => carta.id !== mejorCarta.id
        );

        setMensaje(
          `La computadora invocó ${mejorCarta.name}.`
        );

      }

      // ATAQUE DE LA COMPUTADORA
      if (monstruoCPU !== null) {

        const atkCPU = obtenerATK(monstruoCPU);

        if (monstruoJugador !== null) {

          const atkJugador = obtenerATK(monstruoJugador);

          if (atkCPU > atkJugador) {

            lpJugador -= atkCPU - atkJugador;
            monstruoJugador = null;

          } else if (atkCPU < atkJugador) {

            lpCPU -= atkJugador - atkCPU;
            monstruoCPU = null;

          } else {

            monstruoJugador = null;
            monstruoCPU = null;

          }

        } else {

          lpJugador -= atkCPU;

        }

      }

      // ACTUALIZAR ESTADOS
      setManoCPU(mano);
      setMazoCPU(mazo);

      setCampoJugador(monstruoJugador);
      setCampoCPU(monstruoCPU);

      setVidaJugador(Math.max(0, lpJugador));
      setVidaCPU(Math.max(0, lpCPU));

      // COMPROBAR RESULTADO
      if (lpJugador <= 0) {

        setMensaje('¡DERROTA! La computadora ha ganado.');
        setGameOver(true);
        return;

      }

      if (lpCPU <= 0) {

        setMensaje('¡VICTORIA! Has ganado el duelo.');
        setGameOver(true);
        return;

      }

      // ROBAR CARTA PARA EL JUGADOR
      setMazoJugador(mazoJugador.slice(1));

      if (mazoJugador.length > 0) {

        setManoJugador([
          ...manoJugador,
          mazoJugador[0]
        ]);

      }

      // DEVOLVER EL TURNO
      setTurno('jugador');
      setInvoco(false);
      setAtaco(false);

      setMensaje('¡Tu turno! Roba, invoca y ataca.');

    }, 1000);

  };

  // FINALIZAR TURNO
  const finalizarTurno = () => {

    if (turno !== 'jugador' || gameOver) return;

    setSeleccionada(null);

    turnoComputadora();

  };

  // SELECCIONAR CARTA
  const seleccionarCarta = (carta) => {

    if (turno !== 'jugador' || gameOver) return;

    setSeleccionada(
      seleccionada === carta.id ? null : carta.id
    );

  };

  // PANTALLA DE CARGA
  if (cargando) {

    return (

      <View style={styles.cargando}>

        <ActivityIndicator size="large" color="#f4c542" />

        <Text style={styles.textoCarga}>
          Cargando cartas de Yu-Gi-Oh...
        </Text>

      </View>

    );

  }

  // INTERFAZ DEL DUELO
  return (

    <SafeAreaView style={styles.contenedor}>

      <Text style={styles.titulo}>
        YU-GI-OH! DUEL
      </Text>

      {/* PUNTOS DE VIDA DE LA CPU */}

      <View style={styles.panelCPU}>

        <Text style={styles.nombre}>
          COMPUTADORA
        </Text>

        <Text style={styles.vida}>
          ❤️ {vidaCPU} LP
        </Text>

        <Text style={styles.cartasRestantes}>
          Cartas en mano: {manoCPU.length}
        </Text>

      </View>

      {/* CAMPO DE LA COMPUTADORA */}

      <View style={styles.campo}>

        <Text style={styles.etiqueta}>
          CAMPO RIVAL
        </Text>

        {campoCPU ? (

          <View style={styles.cartaCampo}>

            <Image
              source={obtenerImagen(campoCPU)}
              style={styles.imagenCampo}
              resizeMode="contain"
            />

            <Text style={styles.nombreCarta}>
              {campoCPU.name}
            </Text>

            <Text style={styles.atk}>
              ATK: {obtenerATK(campoCPU)}
            </Text>

          </View>

        ) : (

          <Text style={styles.vacio}>
            Campo vacío
          </Text>

        )}

      </View>

      {/* MENSAJE DEL DUELO */}

      <View style={styles.mensajeBox}>

        <Text style={styles.mensaje}>
          {mensaje}
        </Text>

      </View>

      {/* CAMPO DEL JUGADOR */}

      <View style={styles.campo}>

        <Text style={styles.etiqueta}>
          TU CAMPO
        </Text>

        {campoJugador ? (

          <View style={styles.cartaCampo}>

            <Image
              source={obtenerImagen(campoJugador)}
              style={styles.imagenCampo}
              resizeMode="contain"
            />

            <Text style={styles.nombreCarta}>
              {campoJugador.name}
            </Text>

            <Text style={styles.atk}>
              ATK: {obtenerATK(campoJugador)}
            </Text>

          </View>

        ) : (

          <Text style={styles.vacio}>
            Campo vacío
          </Text>

        )}

      </View>

      {/* PUNTOS DE VIDA DEL JUGADOR */}

      <View style={styles.panelJugador}>

        <Text style={styles.nombre}>
          JUGADOR
        </Text>

        <Text style={styles.vida}>
          ❤️ {vidaJugador} LP
        </Text>

        <Text style={styles.cartasRestantes}>
          Cartas en mano: {manoJugador.length}
        </Text>

      </View>

      {/* MANO DEL JUGADOR */}

      <Text style={styles.tituloMano}>
        TUS CARTAS
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mano}
      >

        {manoJugador.map((carta) => (

          <TouchableOpacity
            key={carta.id}
            onPress={() => seleccionarCarta(carta)}
            style={[
              styles.cartaMano,
              seleccionada === carta.id && styles.cartaSeleccionada
            ]}
          >

            <Image
              source={obtenerImagen(carta)}
              style={styles.imagenMano}
              resizeMode="contain"
            />

            <Text style={styles.nombreMano} numberOfLines={2}>
              {carta.name}
            </Text>

            <Text style={styles.atkMano}>
              ATK {obtenerATK(carta)}
            </Text>

          </TouchableOpacity>

        ))}

      </ScrollView>

      {/* BOTONES DE ACCIÓN */}

      {!gameOver ? (

        <View style={styles.botones}>

          <TouchableOpacity
            style={styles.botonInvocar}
            onPress={invocarMonstruo}
            disabled={turno !== 'jugador'}
          >

            <Text style={styles.textoBoton}>
              INVOCAR
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonAtacar}
            onPress={atacar}
            disabled={turno !== 'jugador'}
          >

            <Text style={styles.textoBoton}>
              ATACAR
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonTurno}
            onPress={finalizarTurno}
            disabled={turno !== 'jugador'}
          >

            <Text style={styles.textoBoton}>
              FIN TURNO
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        <TouchableOpacity
          style={styles.botonReiniciar}
          onPress={iniciarDuelo}
        >

          <Text style={styles.textoBoton}>
            NUEVO DUELO
          </Text>

        </TouchableOpacity>

      )}

    </SafeAreaView>

  );

}

// ESTILOS
const styles = StyleSheet.create({

  contenedor: {
    flex: 1,
    backgroundColor: '#171b2b',
    padding: 10,
  },

  cargando: {
    flex: 1,
    backgroundColor: '#171b2b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCarga: {
    color: 'white',
    marginTop: 15,
    fontSize: 16,
  },

  titulo: {
    color: '#f4c542',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },

  panelCPU: {
    backgroundColor: '#292f46',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  panelJugador: {
    backgroundColor: '#292f46',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  nombre: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  vida: {
    color: '#ff5555',
    fontSize: 23,
    fontWeight: 'bold',
  },

  cartasRestantes: {
    color: '#bfc6d9',
    fontSize: 12,
  },

  campo: {
    backgroundColor: '#344b43',
    borderWidth: 1,
    borderColor: '#839b70',
    borderRadius: 10,
    marginVertical: 5,
    minHeight: 130,
    padding: 8,
    alignItems: 'center',
  },

  etiqueta: {
    color: '#f4d77b',
    fontWeight: 'bold',
    fontSize: 12,
  },

  vacio: {
    color: '#c4d3c7',
    marginTop: 30,
  },

  cartaCampo: {
    alignItems: 'center',
  },

  imagenCampo: {
    width: 75,
    height: 95,
  },

  nombreCarta: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  atk: {
    color: '#ffd45a',
    fontWeight: 'bold',
  },

  mensajeBox: {
    backgroundColor: '#20263a',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },

  mensaje: {
    color: '#f4c542',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  tituloMano: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },

  mano: {
    maxHeight: 165,
    marginVertical: 5,
  },

  cartaMano: {
    backgroundColor: '#292f46',
    borderWidth: 2,
    borderColor: '#6d7182',
    borderRadius: 8,
    padding: 4,
    marginRight: 7,
    width: 100,
    alignItems: 'center',
  },

  cartaSeleccionada: {
    borderColor: '#f4c542',
    borderWidth: 3,
    backgroundColor: '#45405a',
  },

  imagenMano: {
    width: 85,
    height: 100,
  },

  nombreMano: {
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
    height: 25,
  },

  atkMano: {
    color: '#f4c542',
    fontSize: 10,
    fontWeight: 'bold',
  },

  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },

  botonInvocar: {
    backgroundColor: '#286cba',
    padding: 12,
    borderRadius: 8,
  },

  botonAtacar: {
    backgroundColor: '#b83a3a',
    padding: 12,
    borderRadius: 8,
  },

  botonTurno: {
    backgroundColor: '#9b751c',
    padding: 12,
    borderRadius: 8,
  },

  botonReiniciar: {
    backgroundColor: '#286cba',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },

  textoBoton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },

});
