import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
  SafeAreaView, ActivityIndicator, Modal, Alert,
} from 'react-native';

const API = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
const ZONAS = 5;

export default function Original() {
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('Preparando duelo...');
  const [gameOver, setGameOver] = useState(false);
  const [vidaJugador, setVidaJugador] = useState(8000);
  const [vidaCPU, setVidaCPU] = useState(8000);
  const [manoJugador, setManoJugador] = useState([]);
  const [manoCPU, setManoCPU] = useState([]);
  const [mazoJugador, setMazoJugador] = useState([]);
  const [mazoCPU, setMazoCPU] = useState([]);
  const [monstruosJugador, setMonstruosJugador] = useState(Array(ZONAS).fill(null));
  const [monstruosCPU, setMonstruosCPU] = useState(Array(ZONAS).fill(null));
  const [magiasJugador, setMagiasJugador] = useState(Array(ZONAS).fill(null));
  const [magiasCPU, setMagiasCPU] = useState(Array(ZONAS).fill(null));
  const [seleccionada, setSeleccionada] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [turno, setTurno] = useState('jugador');
  const [invoco, setInvoco] = useState(false);
  const [atacaron, setAtacaron] = useState([]);
  const [primerTurno, setPrimerTurno] = useState(true);
  const [modalInvocacion, setModalInvocacion] = useState(false);

  const mezclar = (cartas) => {
    const resultado = [...cartas];
    for (let i = resultado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }
    return resultado;
  };

  const esMonstruo = (c) => c && (c.type || '').toLowerCase().includes('monster');
  const esMagiaTrampa = (c) => c && (
    (c.type || '').toLowerCase().includes('spell') ||
    (c.type || '').toLowerCase().includes('trap')
  );
  const atk = (c) => Number(c?.atk) || 0;
  const def = (c) => Number(c?.def) || 0;
  const imagen = (c) => ({ uri: c?.card_images?.[0]?.image_url_small || c?.card_images?.[0]?.image_url });

  const iniciarDuelo = async () => {
    setCargando(true);
    setGameOver(false);
    try {
      // La API entrega monstruos, cartas mágicas y cartas de trampa.
      const respuesta = await fetch(`${API}?type=Effect%20Monster,Flip%20Effect%20Monster,Flip%20Tuner%20Effect%20Monster,Gemini%20Monster,Normal%20Monster,Normal%20Tuner%20Monster,Pendulum%20Effect%20Monster,Pendulum%20Effect%20Ritual%20Monster,Pendulum%20Flip%20Effect%20Monster,Pendulum%20Normal%20Monster,Pendulum%20Tuner%20Effect%20Monster,Ritual%20Effect%20Monster,Ritual%20Monster,Spirit%20Monster,Toon%20Monster,Tuner%20Monster,Union%20Effect%20Monster,Fusion%20Monster,Link%20Monster,Pendulum%20Effect%20Fusion%20Monster,Synchro%20Monster,Synchro%20Pendulum%20Effect%20Monster,Synchro%20Tuner%20Monster,XYZ%20Monster,XYZ%20Pendulum%20Effect%20Monster,Spell%20Card,Trap%20Card&num=1000&offset=0`);
      if (!respuesta.ok) throw new Error('No se pudo conectar con YGOPRODeck');
      const json = await respuesta.json();
      const cartas = (json.data || []).filter(c =>
        c.card_images?.length &&
        (esMonstruo(c) || esMagiaTrampa(c))
      );
      const unicas = [...new Map(cartas.map(c => [c.id, c])).values()];
      const monstruos = unicas.filter(esMonstruo);
      const otras = unicas.filter(esMagiaTrampa);
      if (monstruos.length < 40) throw new Error('La API no devolvió suficientes monstruos.');
      // Cada mazo contiene principalmente monstruos y algunas magias/trampas.
      const pool = mezclar([...monstruos, ...otras.slice(0, 100)]);
      const mazo1 = mezclar(pool).slice(0, 45);
      const mazo2 = mezclar(pool.filter(c => !mazo1.some(x => x.id === c.id))).slice(0, 45);
      const preparar = (deck) => {
        const mano = deck.slice(0, 5);
        const resto = deck.slice(5);
        // Garantizar al menos un monstruo en la mano inicial.
        if (!mano.some(esMonstruo)) {
          const indice = resto.findIndex(esMonstruo);
          if (indice >= 0) {
            const reemplazo = resto.splice(indice, 1)[0];
            resto.push(mano[0]);
            mano[0] = reemplazo;
          }
        }
        return { mano, resto };
      };
      const p = preparar(mazo1);
      const cpu = preparar(mazo2);
      setManoJugador(p.mano); setMazoJugador(p.resto);
      setManoCPU(cpu.mano); setMazoCPU(cpu.resto);
      setVidaJugador(8000); setVidaCPU(8000);
      setMonstruosJugador(Array(ZONAS).fill(null));
      setMonstruosCPU(Array(ZONAS).fill(null));
      setMagiasJugador(Array(ZONAS).fill(null));
      setMagiasCPU(Array(ZONAS).fill(null));
      setSeleccionada(null); setDetalle(null);
      setTurno('jugador'); setInvoco(false); setAtacaron([]);
      setPrimerTurno(true); setModalInvocacion(false);
      setMensaje('¡Tu primer turno! Puedes invocar, colocar cartas o finalizar. No puedes atacar.');
    } catch (e) {
      console.log(e);
      setMensaje('No se pudieron cargar las cartas. Comprueba tu conexión e inténtalo de nuevo.');
    } finally { setCargando(false); }
  };

  useEffect(() => { iniciarDuelo(); }, []);

  const seleccionarCarta = (carta) => {
    if (turno !== 'jugador' || gameOver) return;
    setSeleccionada(seleccionada === carta.id ? null : carta.id);
    setDetalle(carta);
  };

  const invocarMonstruo = (posicion) => {
    if (!seleccionada) { setMensaje('Selecciona un monstruo de tu mano.'); return; }
    const carta = manoJugador.find(c => c.id === seleccionada);
    if (!carta || !esMonstruo(carta)) { setMensaje('Esta carta no es un monstruo.'); return; }
    if (invoco) { setMensaje('Ya realizaste tu invocación normal este turno.'); return; }
    if (monstruosJugador.every(Boolean)) { setMensaje('No tienes zonas de monstruo disponibles.'); return; }
    const nuevo = [...monstruosJugador];
    nuevo[posicion] = { ...carta, posicion: 'ataque', yaAtaco: false };
    setMonstruosJugador(nuevo);
    setManoJugador(manoJugador.filter(c => c.id !== carta.id));
    setSeleccionada(null); setDetalle(null); setInvoco(true); setModalInvocacion(false);
    setMensaje(`${carta.name} fue invocado en posición de ataque.`);
  };

  const colocarEnDefensa = () => {
    if (!seleccionada) { setMensaje('Selecciona un monstruo de tu mano.'); return; }
    const carta = manoJugador.find(c => c.id === seleccionada);
    if (!carta || !esMonstruo(carta)) { setMensaje('Selecciona un monstruo para colocarlo.'); return; }
    if (invoco) { setMensaje('Ya realizaste tu invocación normal este turno.'); return; }
    const zona = monstruosJugador.findIndex(x => !x);
    if (zona < 0) { setMensaje('No tienes zonas de monstruo disponibles.'); return; }
    const nuevo = [...monstruosJugador];
    nuevo[zona] = { ...carta, posicion: 'defensa', yaAtaco: true };
    setMonstruosJugador(nuevo);
    setManoJugador(manoJugador.filter(c => c.id !== carta.id));
    setSeleccionada(null); setDetalle(null); setInvoco(true); setModalInvocacion(false);
    setMensaje(`${carta.name} fue colocado en posición de defensa.`);
  };

  const colocarMagiaTrampa = () => {
    if (!seleccionada) { setMensaje('Selecciona una magia o trampa de tu mano.'); return; }
    const carta = manoJugador.find(c => c.id === seleccionada);
    if (!esMagiaTrampa(carta)) { setMensaje('Esta carta no es una magia ni una trampa.'); return; }
    const zona = magiasJugador.findIndex(x => !x);
    if (zona < 0) { setMensaje('No tienes zonas de magia/trampa disponibles.'); return; }
    const nuevo = [...magiasJugador]; nuevo[zona] = carta;
    setMagiasJugador(nuevo);
    setManoJugador(manoJugador.filter(c => c.id !== carta.id));
    setSeleccionada(null); setDetalle(null);
    setMensaje(`${carta.name} fue colocada en tu zona de magia/trampa. (Efecto no automatizado).`);
  };

  const comprobarVictoria = (lpJ, lpC) => {
    if (lpC <= 0) { setMensaje('¡VICTORIA! Has ganado el duelo.'); setGameOver(true); return true; }
    if (lpJ <= 0) { setMensaje('¡DERROTA! La computadora ha ganado.'); setGameOver(true); return true; }
    return false;
  };

  const atacar = (indice) => {
    if (turno !== 'jugador' || gameOver) return;
    if (primerTurno) { setMensaje('En el primer turno no se puede atacar. ¡Invoca o coloca cartas!'); return; }
    const atacante = monstruosJugador[indice];
    if (!atacante) { setMensaje('No hay monstruo en esa zona.'); return; }
    if (atacante.posicion !== 'ataque') { setMensaje('Un monstruo en defensa no puede atacar.'); return; }
    if (atacaron.includes(atacante.id)) { setMensaje('Este monstruo ya atacó este turno.'); return; }
    const nuevoCPU = [...monstruosCPU];
    const objetivoIndex = nuevoCPU.findIndex(Boolean);
    let lpC = vidaCPU, lpJ = vidaJugador;
    if (objetivoIndex < 0) {
      lpC -= atk(atacante);
      setMensaje(`¡Ataque directo! ${atk(atacante)} puntos de daño.`);
    } else {
      const objetivo = nuevoCPU[objetivoIndex];
      if (objetivo.posicion === 'defensa') {
        if (atk(atacante) > def(objetivo)) {
          nuevoCPU[objetivoIndex] = null;
          setMensaje(`${objetivo.name} fue destruido. No hay daño de batalla.`);
        } else if (atk(atacante) < def(objetivo)) {
          setMensaje(`¡${objetivo.name} resistió el ataque! No recibes daño de batalla.`);
        } else setMensaje('El ataque no supera la defensa del rival.');
      } else {
        if (atk(atacante) > atk(objetivo)) {
          lpC -= atk(atacante) - atk(objetivo); nuevoCPU[objetivoIndex] = null;
          setMensaje(`${objetivo.name} fue destruido. La computadora pierde ${atk(atacante) - atk(objetivo)} LP.`);
        } else if (atk(atacante) < atk(objetivo)) {
          lpJ -= atk(objetivo) - atk(atacante);
          const nuevoJ = [...monstruosJugador]; nuevoJ[indice] = null; setMonstruosJugador(nuevoJ);
          setMensaje('¡Tu monstruo fue destruido!');
        } else {
          nuevoCPU[objetivoIndex] = null;
          const nuevoJ = [...monstruosJugador]; nuevoJ[indice] = null; setMonstruosJugador(nuevoJ);
          setMensaje('¡Empate! Ambos monstruos fueron destruidos.');
        }
      }
    }
    setMonstruosCPU(nuevoCPU); setVidaCPU(Math.max(0, lpC)); setVidaJugador(Math.max(0, lpJ));
    setAtacaron([...atacaron, atacante.id]);
    comprobarVictoria(lpJ, lpC);
  };

  const turnoComputadora = () => {
    setTurno('cpu'); setMensaje('La computadora está jugando...');
    setTimeout(() => {
      let mano = [...manoCPU], mazo = [...mazoCPU];
      let lpJ = vidaJugador, lpC = vidaCPU;
      let cpu = [...monstruosCPU], jugador = [...monstruosJugador];
      if (mazo.length) mano.push(mazo.shift());
      if (!cpu.some(Boolean)) {
        const candidatos = mano.filter(esMonstruo);
        if (candidatos.length) {
          candidatos.sort((a, b) => atk(b) - atk(a));
          const carta = candidatos[0], zona = cpu.findIndex(x => !x);
          cpu[zona] = { ...carta, posicion: 'ataque', yaAtaco: false };
          mano = mano.filter(c => c.id !== carta.id);
        }
      }
      // La CPU ataca con sus monstruos en posición de ataque.
      cpu.forEach((atacante, i) => {
        if (!atacante || atacante.posicion !== 'ataque') return;
        const objetivoIndex = jugador.findIndex(Boolean);
        if (objetivoIndex < 0) { lpJ -= atk(atacante); return; }
        const objetivo = jugador[objetivoIndex];
        if (objetivo.posicion === 'defensa') {
          if (atk(atacante) > def(objetivo)) jugador[objetivoIndex] = null;
          // Si el ATK no supera la DEF, no hay daño de batalla (salvo efectos especiales).
        } else if (atk(atacante) > atk(objetivo)) {
          lpJ -= atk(atacante) - atk(objetivo); jugador[objetivoIndex] = null;
        } else if (atk(atacante) < atk(objetivo)) {
          lpC -= atk(objetivo) - atk(atacante); cpu[i] = null;
        } else { jugador[objetivoIndex] = null; cpu[i] = null; }
      });
      setManoCPU(mano); setMazoCPU(mazo);
      setMonstruosCPU(cpu); setMonstruosJugador(jugador);
      setVidaJugador(Math.max(0, lpJ)); setVidaCPU(Math.max(0, lpC));
      if (lpJ <= 0 || lpC <= 0) { comprobarVictoria(lpJ, lpC); return; }
      let manoJ = [...manoJugador], mazoJ = [...mazoJugador];
      if (mazoJ.length) manoJ.push(mazoJ.shift());
      setManoJugador(manoJ); setMazoJugador(mazoJ);
      setTurno('jugador'); setInvoco(false); setAtacaron([]);
      setPrimerTurno(false);
      setMensaje('¡Tu turno! Roba una carta, invoca y ataca.');
    }, 1000);
  };

  const finalizarTurno = () => {
    if (turno !== 'jugador' || gameOver) return;
    setSeleccionada(null); setDetalle(null);
    if (primerTurno) setPrimerTurno(false);
    turnoComputadora();
  };

  const renderZonasMonstruo = (cartas, esJugador) => (
    <View style={styles.zonas}>
      {cartas.map((carta, i) => (
        <TouchableOpacity key={i} style={[styles.zona, carta && styles.zonaOcupada]}
          onPress={() => carta && esJugador && setDetalle(carta)}>
          {carta ? <>
            <Image source={imagen(carta)} style={styles.imagenZona} resizeMode="contain" />
            <Text style={styles.textoZona} numberOfLines={1}>{carta.name}</Text>
            <Text style={styles.statsZona}>{carta.posicion === 'ataque' ? `ATK ${atk(carta)}` : `DEF ${def(carta)}`}</Text>
            <Text style={styles.posicion}>{carta.posicion === 'ataque' ? '⚔ ATK' : '🛡 DEF'}</Text>
            {esJugador && carta.posicion === 'ataque' && <TouchableOpacity style={styles.miniBoton} onPress={() => atacar(i)}><Text style={styles.miniTexto}>ATACAR</Text></TouchableOpacity>}
          </> : <Text style={styles.zonaVacia}>M{i + 1}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderZonasMagia = (cartas) => (
    <View style={styles.zonas}>
      {cartas.map((carta, i) => (
        <View key={i} style={[styles.zonaMagia, carta && styles.zonaOcupada]}>
          {carta ? <>
            <Image source={imagen(carta)} style={styles.imagenZona} resizeMode="contain" />
            <Text style={styles.textoZona} numberOfLines={1}>{carta.name}</Text>
            <Text style={styles.posicion}>{(carta.type || '').toLowerCase().includes('trap') ? 'TRAMPA' : 'MAGIA'}</Text>
          </> : <Text style={styles.zonaVacia}>M/T {i + 1}</Text>}
        </View>
      ))}
    </View>
  );

  if (cargando) return <View style={styles.cargando}><ActivityIndicator size="large" color="#f4c542" /><Text style={styles.textoCarga}>Cargando cartas de Yu-Gi-Oh...</Text></View>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <Text style={styles.titulo}>YU-GI-OH! DUEL</Text>
        <View style={styles.panelCPU}>
          <Text style={styles.nombre}>COMPUTADORA</Text>
          <Text style={styles.vida}>❤️ {vidaCPU} LP</Text>
          <Text style={styles.cartasRestantes}>Mano: {manoCPU.length} · Mazo: {mazoCPU.length}</Text>
        </View>
        <Text style={styles.etiquetaCampo}>CAMPO RIVAL · MONSTRUOS</Text>
        {renderZonasMonstruo(monstruosCPU, false)}
        <Text style={styles.etiquetaCampo}>CAMPO RIVAL · MAGIA / TRAMPA</Text>
        {renderZonasMagia(magiasCPU)}
        <View style={styles.mensajeBox}><Text style={styles.mensaje}>{mensaje}</Text></View>
        <Text style={styles.etiquetaCampo}>TU CAMPO · MONSTRUOS</Text>
        {renderZonasMonstruo(monstruosJugador, true)}
        <Text style={styles.etiquetaCampo}>TU CAMPO · MAGIA / TRAMPA</Text>
        {renderZonasMagia(magiasJugador)}
        <View style={styles.panelJugador}>
          <Text style={styles.nombre}>JUGADOR</Text>
          <Text style={styles.vida}>❤️ {vidaJugador} LP</Text>
          <Text style={styles.cartasRestantes}>Mano: {manoJugador.length} · Mazo: {mazoJugador.length}</Text>
        </View>

        {detalle && <View style={styles.detalle}>
          <View style={styles.detalleCabecera}>
            <Text style={styles.detalleTitulo}>DETALLE DE CARTA</Text>
            <TouchableOpacity onPress={() => setDetalle(null)}><Text style={styles.cerrar}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.detalleContenido}>
            <Image source={imagen(detalle)} style={styles.imagenDetalle} resizeMode="contain" />
            <View style={styles.datosDetalle}>
              <Text style={styles.nombreDetalle}>{detalle.name}</Text>
              <Text style={styles.dato}>Tipo: {detalle.type}</Text>
              {esMonstruo(detalle) ? <>
                <Text style={styles.statGrande}>⚔ ATK: {atk(detalle)}</Text>
                <Text style={styles.statGrande}>🛡 DEF: {def(detalle)}</Text>
                <Text style={styles.dato}>Nivel: {detalle.level ?? '—'}</Text>
                <Text style={styles.dato}>Atributo: {detalle.attribute || '—'}</Text>
                <Text style={styles.dato}>Raza: {detalle.race || '—'}</Text>
              </> : null}
            </View>
          </View>
          <Text style={styles.descripcion} numberOfLines={4}>{detalle.desc}</Text>
          {turno === 'jugador' && manoJugador.some(c => c.id === detalle.id) && !gameOver && (
            esMonstruo(detalle) ?
              <View style={styles.filaAcciones}>
                <TouchableOpacity style={styles.botonInvocar} onPress={() => { setModalInvocacion(true); }}>
                  <Text style={styles.textoBoton}>INVOCAR MONSTRUO</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonDefensa} onPress={colocarEnDefensa}>
                  <Text style={styles.textoBoton}>COLOCAR DEFENSA</Text>
                </TouchableOpacity>
              </View>
              : <TouchableOpacity style={styles.botonMagia} onPress={colocarMagiaTrampa}><Text style={styles.textoBoton}>COLOCAR MAGIA / TRAMPA</Text></TouchableOpacity>
          )}
        </View>}

        <Text style={styles.tituloMano}>TUS CARTAS · {manoJugador.length}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mano}>
          {manoJugador.map(carta => (
            <TouchableOpacity key={carta.id} onPress={() => seleccionarCarta(carta)}
              style={[styles.cartaMano, seleccionada === carta.id && styles.cartaSeleccionada]}>
              <Image source={imagen(carta)} style={styles.imagenMano} resizeMode="contain" />
              <Text style={styles.nombreMano} numberOfLines={2}>{carta.name}</Text>
              <Text style={styles.atkMano}>{esMonstruo(carta) ? `ATK ${atk(carta)} / DEF ${def(carta)}` : (carta.type || '').toUpperCase()}</Text>
              <Text style={styles.verDetalle}>VER DETALLE</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {!gameOver ? <View style={styles.botones}>
          <TouchableOpacity style={styles.botonTurno} onPress={finalizarTurno} disabled={turno !== 'jugador'}>
            <Text style={styles.textoBoton}>FIN TURNO</Text>
          </TouchableOpacity>
          <Text style={styles.turnoTexto}>{turno === 'jugador' ? 'TU TURNO' : 'TURNO CPU'}</Text>
        </View> : <TouchableOpacity style={styles.botonReiniciar} onPress={iniciarDuelo}><Text style={styles.textoBoton}>NUEVO DUELO</Text></TouchableOpacity>}
        <Modal visible={modalInvocacion} transparent animationType="fade" onRequestClose={() => setModalInvocacion(false)}>
          <View style={styles.fondoModal}><View style={styles.modal}>
            <Text style={styles.modalTitulo}>¿Cómo deseas invocar?</Text>
            <TouchableOpacity style={styles.botonInvocar} onPress={() => {
              const zona = monstruosJugador.findIndex(x => !x);
              if (zona >= 0) invocarMonstruo(zona);
              else setMensaje('No tienes zonas de monstruo disponibles.');
            }}><Text style={styles.textoBoton}>⚔ POSICIÓN DE ATAQUE</Text></TouchableOpacity>
            <TouchableOpacity style={styles.botonDefensa} onPress={colocarEnDefensa}><Text style={styles.textoBoton}>🛡 POSICIÓN DE DEFENSA (BOCA ARRIBA)</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setModalInvocacion(false)}><Text style={styles.cancelar}>CANCELAR</Text></TouchableOpacity>
          </View></View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#111827' },
  contenido: { padding: 10, paddingBottom: 30 },
  cargando: { flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center' },
  textoCarga: { color: 'white', marginTop: 15, fontSize: 16 },
  titulo: { color: '#f4c542', fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  panelCPU: { backgroundColor: '#292f46', padding: 10, borderRadius: 10, alignItems: 'center' },
  panelJugador: { backgroundColor: '#292f46', padding: 10, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  nombre: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  vida: { color: '#ff5555', fontSize: 23, fontWeight: 'bold' },
  cartasRestantes: { color: '#bfc6d9', fontSize: 12 },
  etiquetaCampo: { color: '#f4d77b', fontWeight: 'bold', fontSize: 12, marginTop: 9, marginBottom: 4 },
  zonas: { flexDirection: 'row', justifyContent: 'space-between', gap: 3 },
  zona: { flex: 1, minHeight: 112, backgroundColor: '#1c433d', borderWidth: 1, borderColor: '#8ba98b', borderRadius: 5, alignItems: 'center', justifyContent: 'center', padding: 2 },
  zonaMagia: { flex: 1, minHeight: 82, backgroundColor: '#293b50', borderWidth: 1, borderColor: '#7797ad', borderRadius: 5, alignItems: 'center', justifyContent: 'center', padding: 2 },
  zonaOcupada: { backgroundColor: '#354b46', borderColor: '#f4c542' },
  imagenZona: { width: '100%', height: 62 },
  textoZona: { color: 'white', fontSize: 8, textAlign: 'center' },
  statsZona: { color: '#ffdc75', fontSize: 9, fontWeight: 'bold' },
  posicion: { color: '#b9d5ff', fontSize: 8, fontWeight: 'bold' },
  zonaVacia: { color: '#a6c2b5', fontSize: 9 },
  miniBoton: { backgroundColor: '#a83232', paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, marginTop: 2 },
  miniTexto: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  mensajeBox: { backgroundColor: '#20263a', borderRadius: 8, padding: 10, marginVertical: 8 },
  mensaje: { color: '#f4c542', textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  detalle: { backgroundColor: '#222d43', borderColor: '#e2b93b', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 },
  detalleCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detalleTitulo: { color: '#f4c542', fontWeight: 'bold' },
  cerrar: { color: 'white', fontSize: 20, paddingHorizontal: 5 },
  detalleContenido: { flexDirection: 'row', marginTop: 8 },
  imagenDetalle: { width: 115, height: 160 },
  datosDetalle: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  nombreDetalle: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  dato: { color: '#d3d9e8', fontSize: 11, marginVertical: 1 },
  statGrande: { color: '#ffda68', fontWeight: 'bold', fontSize: 15, marginVertical: 2 },
  descripcion: { color: '#c5cee0', fontSize: 10, marginTop: 6 },
  filaAcciones: { flexDirection: 'row', gap: 7, marginTop: 10 },
  tituloMano: { color: 'white', fontWeight: 'bold', marginTop: 12 },
  mano: { maxHeight: 180, marginVertical: 5 },
  cartaMano: { backgroundColor: '#292f46', borderWidth: 2, borderColor: '#6d7182', borderRadius: 8, padding: 4, marginRight: 7, width: 112, alignItems: 'center' },
  cartaSeleccionada: { borderColor: '#f4c542', borderWidth: 3, backgroundColor: '#45405a' },
  imagenMano: { width: 95, height: 105 },
  nombreMano: { color: 'white', fontSize: 9, textAlign: 'center', height: 25 },
  atkMano: { color: '#f4c542', fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  verDetalle: { color: '#9ec8ff', fontSize: 8, marginTop: 3 },
  botones: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  botonInvocar: { backgroundColor: '#286cba', padding: 11, borderRadius: 8, alignItems: 'center', flex: 1 },
  botonDefensa: { backgroundColor: '#287d66', padding: 11, borderRadius: 8, alignItems: 'center', flex: 1, marginTop: 7 },
  botonMagia: { backgroundColor: '#7952a8', padding: 11, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonTurno: { backgroundColor: '#9b751c', padding: 12, borderRadius: 8 },
  textoBoton: { color: 'white', fontWeight: 'bold', fontSize: 10, textAlign: 'center' },
  turnoTexto: { color: '#f4c542', fontWeight: 'bold', fontSize: 11 },
  botonReiniciar: { backgroundColor: '#286cba', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: '#202a40', borderRadius: 12, padding: 18, width: '100%', borderWidth: 1, borderColor: '#f4c542' },
  modalTitulo: { color: 'white', fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  cancelar: { color: '#bfc6d9', textAlign: 'center', marginTop: 15, fontWeight: 'bold' },
});