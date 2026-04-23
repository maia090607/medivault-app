// src/utils.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Función para generar un código aleatorio de 6 dígitos
export const generarToken = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Función para guardar la receta en Firebase
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