// Forma canonica del telefono. Es el mismo criterio que ya usaba
// whatsappLink() en js/services/card.service.js: solo digitos y, si
// son diez, con el 57 de Colombia delante.
//
// Antes se conservaba el '+' del texto original, asi que el mismo
// numero escrito de dos formas daba dos claves distintas:
//
//   "300 111 2233"      -> 3001112233
//   "+57 300 111 2233"  -> +573001112233
//
// Y como la clave unica del RSVP es el telefono, la misma persona
// podia confirmar dos veces sin que saltara el 409. Ahora las dos
// formas caen en 573001112233.
//
// La funcion es idempotente: aplicarla a un valor ya canonico lo
// deja igual. De eso depende que pueda usarse tambien sobre lo que
// hay guardado de antes, sin reescribir ningun registro.
function canonicalPhone(value) {
  if (value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? '57' + digits : digits;
}

module.exports = { canonicalPhone };
