/**
 * Reescala los PNG del proyecto al tamaño en que realmente se ven.
 *
 * POR QUÉ
 * Las ilustraciones se subieron a resolución de origen. La corona,
 * por ejemplo, pesa 2,9 MB y mide 1536x1024 para dibujarse a 88x59
 * en pantalla: once veces más grande de lo necesario, descargada
 * en cada visita antes de que se vea nada.
 *
 * CÓMO
 * Sin dependencias: Node ya trae zlib, que es lo único que hace
 * falta para leer y escribir PNG. Solo admite PNG de 8 bits sin
 * entrelazar (tipo de color 2 = RGB y 6 = RGBA), que es lo que usa
 * el proyecto; cualquier otro se salta con un aviso.
 *
 * USO
 *   node tools/optimizar-imagenes.js            (solo informa)
 *   node tools/optimizar-imagenes.js --escribir (genera los -web.png)
 */

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const RAIZ = path.join(__dirname, "..", "assets", "gallery");
const ESCRIBIR = process.argv.includes("--escribir");

/* Lado mayor al que se reduce cada imagen. Se deja margen sobre el
   tamaño en pantalla para que se vea nítida en pantallas de alta
   densidad. */
const OBJETIVOS = {
  "CoronaElegante03.png": 360,
  "quince03.png": 520,
  "hombre.png": 300,
  "mujer.png": 300,
  "Linda02.png": 1200,
  "Linda04.png": 1200
};

/* ---------------------------------------------------------- CRC32 */

const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/* --------------------------------------------------------- LECTURA */

function leerPng(archivo) {
  const buf = fs.readFileSync(archivo);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("no es un PNG");

  let pos = 8;
  const idat = [];
  let info = null;

  while (pos < buf.length) {
    const largo = buf.readUInt32BE(pos);
    const tipo = buf.toString("ascii", pos + 4, pos + 8);
    const datos = buf.subarray(pos + 8, pos + 8 + largo);

    if (tipo === "IHDR") {
      info = {
        ancho: datos.readUInt32BE(0),
        alto: datos.readUInt32BE(4),
        profundidad: datos[8],
        tipoColor: datos[9],
        entrelazado: datos[12]
      };
    } else if (tipo === "IDAT") {
      idat.push(datos);
    } else if (tipo === "IEND") {
      break;
    }
    pos += largo + 12;
  }

  if (!info) throw new Error("sin cabecera IHDR");
  if (info.profundidad !== 8) throw new Error("profundidad " + info.profundidad + " no soportada");
  if (info.entrelazado !== 0) throw new Error("entrelazado no soportado");
  if (info.tipoColor !== 2 && info.tipoColor !== 6) {
    throw new Error("tipo de color " + info.tipoColor + " no soportado");
  }

  info.canales = info.tipoColor === 6 ? 4 : 3;
  info.datos = zlib.inflateSync(Buffer.concat(idat));
  return info;
}

/* Deshace el filtro de cada línea. El PNG guarda cada fila con un
   byte de filtro delante que dice cómo predecir sus píxeles a
   partir de los vecinos de la izquierda y de arriba. */
function desfiltrar({ ancho, alto, canales, datos }) {
  const paso = ancho * canales;
  const salida = Buffer.alloc(alto * paso);

  for (let y = 0; y < alto; y++) {
    const filtro = datos[y * (paso + 1)];
    const origen = y * (paso + 1) + 1;
    const destino = y * paso;

    for (let x = 0; x < paso; x++) {
      const crudo = datos[origen + x];
      const izq = x >= canales ? salida[destino + x - canales] : 0;
      const arr = y > 0 ? salida[destino - paso + x] : 0;
      const diag = y > 0 && x >= canales ? salida[destino - paso + x - canales] : 0;
      let valor;

      switch (filtro) {
        case 0: valor = crudo; break;
        case 1: valor = crudo + izq; break;
        case 2: valor = crudo + arr; break;
        case 3: valor = crudo + ((izq + arr) >> 1); break;
        case 4: {
          const p = izq + arr - diag;
          const pa = Math.abs(p - izq);
          const pb = Math.abs(p - arr);
          const pc = Math.abs(p - diag);
          valor = crudo + (pa <= pb && pa <= pc ? izq : pb <= pc ? arr : diag);
          break;
        }
        default: throw new Error("filtro " + filtro + " desconocido");
      }
      salida[destino + x] = valor & 0xff;
    }
  }
  return salida;
}

/* --------------------------------------------------------- ESCALA */

/* Media de área: cada píxel de salida es el promedio del bloque de
   origen que le corresponde. Da mejor resultado que tomar un solo
   píxel, sobre todo al reducir mucho. */
function reducir(pixeles, ancho, alto, canales, nuevoAncho, nuevoAlto) {
  const salida = Buffer.alloc(nuevoAncho * nuevoAlto * canales);
  const escalaX = ancho / nuevoAncho;
  const escalaY = alto / nuevoAlto;

  for (let y = 0; y < nuevoAlto; y++) {
    const y0 = Math.floor(y * escalaY);
    const y1 = Math.min(alto, Math.ceil((y + 1) * escalaY));

    for (let x = 0; x < nuevoAncho; x++) {
      const x0 = Math.floor(x * escalaX);
      const x1 = Math.min(ancho, Math.ceil((x + 1) * escalaX));
      const total = (y1 - y0) * (x1 - x0);

      for (let c = 0; c < canales; c++) {
        let suma = 0;
        for (let sy = y0; sy < y1; sy++) {
          for (let sx = x0; sx < x1; sx++) {
            suma += pixeles[(sy * ancho + sx) * canales + c];
          }
        }
        salida[(y * nuevoAncho + x) * canales + c] = Math.round(suma / total);
      }
    }
  }
  return salida;
}

/* -------------------------------------------------------- ESCRITURA */

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

/* Predice un byte según el filtro pedido. */
function predecir(filtro, izq, arr, diag) {
  switch (filtro) {
    case 1: return izq;
    case 2: return arr;
    case 3: return (izq + arr) >> 1;
    case 4: {
      const p = izq + arr - diag;
      const pa = Math.abs(p - izq);
      const pb = Math.abs(p - arr);
      const pc = Math.abs(p - diag);
      return pa <= pb && pa <= pc ? izq : pb <= pc ? arr : diag;
    }
    default: return 0;
  }
}

function escribirPng(pixeles, ancho, alto, canales) {
  const paso = ancho * canales;
  const conFiltro = Buffer.alloc(alto * (paso + 1));
  const linea = Buffer.alloc(paso);

  /* Se elige el filtro línea a línea con la heurística estándar:
     gana el que deja la suma de valores absolutos más baja, que
     es la que mejor comprime después. Con un filtro fijo las
     fotografías salían MÁS pesadas que el original. */
  for (let y = 0; y < alto; y++) {
    let mejorFiltro = 0;
    let mejorSuma = Infinity;

    for (let f = 0; f <= 4; f++) {
      let suma = 0;
      for (let x = 0; x < paso; x++) {
        const izq = x >= canales ? pixeles[y * paso + x - canales] : 0;
        const arr = y > 0 ? pixeles[(y - 1) * paso + x] : 0;
        const diag = y > 0 && x >= canales ? pixeles[(y - 1) * paso + x - canales] : 0;
        const v = (pixeles[y * paso + x] - predecir(f, izq, arr, diag)) & 0xff;
        suma += v < 128 ? v : 256 - v;
      }
      if (suma < mejorSuma) {
        mejorSuma = suma;
        mejorFiltro = f;
      }
    }

    for (let x = 0; x < paso; x++) {
      const izq = x >= canales ? pixeles[y * paso + x - canales] : 0;
      const arr = y > 0 ? pixeles[(y - 1) * paso + x] : 0;
      const diag = y > 0 && x >= canales ? pixeles[(y - 1) * paso + x - canales] : 0;
      linea[x] = (pixeles[y * paso + x] - predecir(mejorFiltro, izq, arr, diag)) & 0xff;
    }

    conFiltro[y * (paso + 1)] = mejorFiltro;
    linea.copy(conFiltro, y * (paso + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8;
  ihdr[9] = canales === 4 ? 6 : 2;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(conFiltro, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

/* ------------------------------------------------------------ MAIN */

let ahorroTotal = 0;

for (const [nombre, ladoMax] of Object.entries(OBJETIVOS)) {
  const origen = path.join(RAIZ, nombre);
  if (!fs.existsSync(origen)) {
    console.log(nombre.padEnd(24) + "no existe, se salta");
    continue;
  }

  const pesoAntes = fs.statSync(origen).size;

  try {
    const png = leerPng(origen);
    const pixeles = desfiltrar(png);
    const factor = Math.min(1, ladoMax / Math.max(png.ancho, png.alto));

    if (factor === 1) {
      console.log(nombre.padEnd(24) + "ya está por debajo del objetivo");
      continue;
    }

    const nuevoAncho = Math.max(1, Math.round(png.ancho * factor));
    const nuevoAlto = Math.max(1, Math.round(png.alto * factor));
    const reducidos = reducir(pixeles, png.ancho, png.alto, png.canales, nuevoAncho, nuevoAlto);
    const salida = escribirPng(reducidos, nuevoAncho, nuevoAlto, png.canales);

    /* Seguro: si el resultado no es más ligero, no sirve de nada.
       Pasa con las fotografías, para las que el PNG es mal
       formato — ahí lo que toca es exportarlas a JPEG o WebP. */
    if (salida.length >= pesoAntes) {
      console.log(
        nombre.padEnd(24) +
          `se salta: al reescribirlo quedaría en ${(salida.length / 1024).toFixed(0)} KB, ` +
          `más que los ${(pesoAntes / 1024).toFixed(0)} KB actuales`
      );
      continue;
    }

    const destino = path.join(RAIZ, nombre.replace(/\.png$/i, "-web.png"));
    if (ESCRIBIR) fs.writeFileSync(destino, salida);

    ahorroTotal += pesoAntes - salida.length;

    console.log(
      nombre.padEnd(24) +
        `${png.ancho}x${png.alto} ${(pesoAntes / 1024).toFixed(0)} KB` +
        `  →  ${nuevoAncho}x${nuevoAlto} ${(salida.length / 1024).toFixed(0)} KB` +
        `  (${Math.round((1 - salida.length / pesoAntes) * 100)}% menos)`
    );
  } catch (err) {
    console.log(nombre.padEnd(24) + "se salta: " + err.message);
  }
}

console.log(
  "\nAhorro total: " +
    (ahorroTotal / 1024 / 1024).toFixed(2) +
    " MB" +
    (ESCRIBIR ? "  (archivos -web.png escritos)" : "  (simulación: usa --escribir para generarlos)")
);
