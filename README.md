# Sisben & Nueva EPS API

Welcome to the Sisben and Nueva EPS Data Fetcher API. This service allows you to quickly query and retrieve affiliation and status data from both Sisben and Nueva EPS using a person's identification document. 

---

## Microsoft Excel Macro and Ready-to-Use File

This Excel workbook is already configured to process and transform raw data downloaded from the portal.  
Inside the `macros` directory, there are three VBA macros that work together to automate the workflow:

### Available macros

- **`FormatoTabla.bas`**  
  Applies the required structure and formatting to the raw Excel data downloaded from the portal, adapting it to the format used in the personalized workbook.

- **`Módulo1.bas`**  
  Reads the `documento` and `tipo_documento` values from a column in the spreadsheet and writes the corresponding results into other columns, such as:
  - `sisben`
  - `sisben_description`
  - `nuevaeps_state`

- **`JsonConverter.bas`**  
  A helper module used by `Módulo1.bas` to handle JSON data.  
  **Important:** this module requires enabling **Microsoft Scripting Runtime** in VBA references for it to work correctly.

  *A tutorial for enabling this dependency should be added in the future.*

---

## How to use the Excel file

1. **Download the Excel file**  
   Open the ready-to-use workbook provided for the process.

2. **Load the raw data**  
   Paste the CSV data into the `RAWDATA` sheet.

3. **Apply the table format**  
   Run the `FormatoTabla` macro to convert the raw data into the required structure.

4. **Filter the raw data before transferring it**  
   Before moving anything to the other sheet, apply the necessary filters in the `RAWDATA` sheet.  
   Only transfer the records that you actually need.

5. **Move the selected data to the other sheet**  
   Copy and paste only the filtered data into the destination sheet.  
   Use `Ctrl + Shift + V` to paste it into the other sheet.

6. **Run the main processing macro**  
   Execute the `Módulo1` / `JsonAPI` module after enabling **Microsoft Scripting Runtime**.

7. **Done**  
   The workbook will automatically populate the corresponding fields and complete the process.

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
    "numeroDocumento": "numero ejemplo",
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
    "numeroDocumento": "numero ejemplo",
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
    "estadoAfiDescripcion": "descripcion",
    "tipoCotizanteDescp": "tipo",
    "nombreEPS": "eps",
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