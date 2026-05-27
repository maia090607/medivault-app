import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const generarToken = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const guardarReceta = async (datosReceta) => {
  try {
    const docRef = await addDoc(collection(db, "recetas"), {
      ...datosReceta,
      token: generarToken(),
      estado: "activa",
      fecha_creacion: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error al guardar: ", e);
  }
};

export const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
};