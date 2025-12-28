import crypto from "node:crypto";

const PALABRAS_SEGURAS = [
  "ROJO", "AZUL", "VERDE", "MESA", "SILLA", "AGUA", "SOL", "LUNA", "GATO", "PERRO",
  "PATO", "RISA", "FLOR", "RÍO", "MAR", "LUZ", "TIGRE", "LEÓN", "OSO", "PAN",
  "QUESO", "UVA", "MANZANA", "PERA", "AUTO", "TREN", "AVIÓN", "BICI", "LIBRO", "LÁPIZ",
  "PAPEL", "CASA", "TECHO", "PISO", "PUERTA", "LLAVE", "RELOJ", "MANO", "PIE", "OJO"
];

export function generarPalabrasClave(): string {
  const indices = new Set<number>();
  while (indices.size < 3) {
    // Generar índice aleatorio criptográficamente seguro
    const randomBuffer = crypto.randomBytes(4);
    const randomNumber = randomBuffer.readUInt32BE(0);
    indices.add(randomNumber % PALABRAS_SEGURAS.length);
  }

  const palabras = Array.from(indices).map(i => PALABRAS_SEGURAS[i]);
  return palabras.join("-");
}
