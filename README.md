# Sisben & Nueva EPS API

Welcome to the Sisben and Nueva EPS Data Fetcher API. This service allows you to quickly query and retrieve affiliation and status data from both Sisben and Nueva EPS using a person's identification document. 

---

## 🚀 Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check. Returns a "Hello World" message to verify the API is alive. |
| `GET` | `/:full/:document/:type` | Retrieves data from **both** Sisben and Nueva EPS in a single call. |
| `GET` | `/:full/nuevaeps/:document/:type` | Retrieves data **only** from Nueva EPS. |
| `GET` | `/:full/sisben/:document/:type` | Retrieves data **only** from Sisben. |

---

## 🛠 Path Parameters

All main endpoints require the following three parameters in the URL:

* **`full`** *(boolean/string)*: Defines the verbosity of the response. 
    * Set to `true` (or your defined flag) to get the raw, unfiltered data directly from the source.
    * Set to `false` to get a cleaner, parsed version containing only the most useful data.
* **`document`** *(string)*: The identification number of the person. **Must not contain spaces or dots.**
* **`type`** *(string)*: The document type. 

### Supported Document Types

To ensure compatibility across **both** Sisben and Nueva EPS, please use one of the following formats:

* `RC` (Registro Civil)
* `TI` (Tarjeta de Identidad)
* `CC` (Cédula de Ciudadanía)
* `CE` (Cédula de Extranjería)
* `DNIPaisOrigen` (Documento Nacional de Identidad del País de Origen)
* `DNIPasaporte` (Pasaporte)
* `SC` (Salvoconducto)
* `PE` (Permiso Especial de Permanencia)
* `PT` (Permiso por Protección Temporal)

> **Note on Nueva EPS document types:** Nueva EPS supports additional document types that are *not* supported by Sisben. If you are exclusively querying the `/nuevaeps/` endpoint, you can use these extra types. Please check `/src/libs/constants.js` for the complete list.

---

## 📦 Response Data

Below are the exact JSON structures returned by the API depending on the endpoint and the `full` parameter. 

### Sisben Data

#### Using `full=true`

**When a record is found:**
```json
{
  "estadoRegistro": "Registro válido",
  "fechaConsulta": "YYYY-MM-DD",
  "ficha": "1234567890",
  "categoria": {
    "sisbenGrade": "C4",
    "descripcion": "Vulnerable"
  },
  "datosPersonales": {
    "nombres": "Sample Names",
    "apellidos": "Sample Lastnames",
    "tipoDocumento": "Cédula de Ciudadanía",
    "numeroDocumento": "123456789",
    "municipio": "Sample Municipality",
    "departamento": "Sample Department"
  },
  "informacionAdministrativa": {
    "encuestaVigente": "YYYY-MM-DD",
    "ultimaActualizacionCiudadano": "MM/DD/YYYY",
    "ultimaActualizacionRegistros": "YYYY-MM-DD"
  }
}
```

**When no record is found:**
```json
{
  "estadoRegistro": "No se encuentra en la base del Sisbén IV",
  "fechaConsulta": "N/A",
  "ficha": "N/A",
  "categoria": {
    "sisbenGrade": "Sin Categoría",
    "descripcion": "El ciudadano no registra encuesta vigente"
  },
  "datosPersonales": {
    "nombres": "No encontrado",
    "apellidos": "No encontrado",
    "tipoDocumento": "Cédula de Ciudadanía",
    "numeroDocumento": "10072067412",
    "municipio": "N/A",
    "departamento": "N/A"
  },
  "informacionAdministrativa": {
    "encuestaVigente": "No",
    "ultimaActualizacionCiudadano": "N/A",
    "ultimaActualizacionRegistros": "N/A"
  }
}
```

#### Using `full=false`

**When a record is found:**
```json
{
  "sisbenGrade": "C4",
  "descripcion": "Vulnerable"
}
```

**When no record is found:**
```json
{
  "sisbenGrade": "Sin Categoría",
  "descripcion": "El ciudadano no registra encuesta vigente"
}
```

---

### Nueva EPS Data

#### Using `full=true`

> **Note:** Currently, using the `full=true` parameter for Nueva EPS returns the exact same structure as `full=false` due to a known bug. This will be updated in a future release.

#### Using `full=false`

**When a record is found:**
```json
{
  "portalNuevaeps": {
    "estadoAfiDescripcion": "Activo",
    "tipoCotizanteDescp": "Cotizante",
    "nombreEPS": "NUEVA EPS",
    "nuevaeps": true
  }
}
```

**When no record is found:**
```json
{
  "portalNuevaeps": {
    "nuevaeps": false
  }
}
```