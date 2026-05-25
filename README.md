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

## 📦 Response Data *(Coming Soon)*

Documentation for the exact JSON structures returned by the API is currently being updated. 

### Sisben Data
* **Using `full`:** *Coming soon*
* **Not using `full`:** *Coming soon*

### Nueva EPS Data
* **Using `full`:** *Coming soon*
* **Not using `full`:** *Coming soon*