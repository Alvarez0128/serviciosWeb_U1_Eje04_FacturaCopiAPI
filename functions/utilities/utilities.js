/*Fuente REGEXs:
   https://portalsat.plataforma.sat.gob.mx/ConsultaRFC/ 

   Existe un mejor algoritmo en:
   https://goo.su/prQv

   Para fines practicos se usará la primera fuente
*/

// patron del RFC, persona moral
_rfc_pattern_pm = "^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
  "(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
  "(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
  "(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";
// patron del RFC, persona fisica
_rfc_pattern_pf = "^(([A-ZÑ&]{4})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
  "(([A-ZÑ&]{4})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
  "(([A-ZÑ&]{4})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
  "(([A-ZÑ&]{4})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";

function RFC(rfc) {
  if (rfc.match(_rfc_pattern_pm)) {
    //persona moral
    return "pmoral";
  } else if (rfc.match(_rfc_pattern_pf)) {
    //persona fisica
    return "pfisica";
  } else {
    return "invalid";
  }
}



/*Catalogo de regimenes fiscales consultado en:
  http://omawww.sat.gob.mx/tramitesyservicios/Paginas/anexo_20.htm

  CFDI 4.0(xls)-hoja "c_RegimenFiscal"
*/

//objeto que contiene los códigos fiscales asociados a cada tipo de régimen fiscal
const tax_systems = {
  "pmoral": ["601", "603", "610", "620", "622", "623", "624", "626"], // Códigos fiscales para personas morales
  "pfisica": ["605", "606", "607", "608", "610", "611", "612", "614", "615", "616", "621", "625", "626"] // Códigos fiscales para personas físicas
};

// Función para verificar si un código fiscal pertenece a un tipo de régimen fiscal específico
function RegimenFiscal(tipo, rf) {
  // Verifica si el tipo de régimen fiscal proporcionado es válido
  if (!tax_systems[tipo]) {
    return "invalid"; 
  }
  
  // Verifica si el código fiscal está presente en el arreglo correspondiente al tipo de régimen fiscal
  if (tax_systems[tipo].includes(rf)) {
    return "ok"; 
  } else {
    return "invalid";
  }
}

module.exports = {RFC, RegimenFiscal}