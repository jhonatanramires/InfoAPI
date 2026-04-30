Attribute VB_Name = "Módulo1"
Option Explicit

' =========================================================
' CONFIGURACIÓN PRINCIPAL
' =========================================================
Private Const BASE_URL As String = "https://infoapi-8cwn.onrender.com"
Private Const AMBIENTE As String = "0"
Private Const HOJA_NOMBRE As String = "NominalAfiliados"
Private Const FILA_INICIO As Long = 2

' --- Posiciones de las Columnas ---
Private Const COL_DOCUMENTO As Long = 3   ' A
Private Const COL_TIPO_DOC As Long = 2    ' B
Private Const COL_SISBEN As Long = 4      ' C
Private Const COL_DESCRIPCION As Long = 5 ' D
Private Const COL_NUEVAEPS As Long = 6    ' E

' =========================================================
' MACRO PRINCIPAL
' =========================================================
Public Sub ActualizarAPI_Sisben()

    Dim ws As Worksheet
    Dim ultimaFila As Long, i As Long
    Dim documento As String, tipoDoc As String, url As String
    Dim respuestaAPI As String
    
    Dim json As Object
    Dim http As Object

    ' 1. Configurar la hoja
    Set ws = ThisWorkbook.Worksheets(HOJA_NOMBRE)
    ultimaFila = ws.Cells(ws.Rows.Count, COL_DOCUMENTO).End(xlUp).Row

    ' 2. Optimizar Excel para que la macro sea rápida
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    ' 3. Crear el objeto para hacer peticiones HTTP UNA SOLA VEZ
    Set http = CreateObject("MSXML2.XMLHTTP.6.0")

    ' 4. Recorrer cada fila de la tabla
    For i = FILA_INICIO To ultimaFila
        
        ' Si ocurre un error inesperado, saltamos a la sección "ManejoError"
        On Error GoTo ManejoError

        documento = Trim(ws.Cells(i, COL_DOCUMENTO).Value)
        tipoDoc = UCase(Trim(ws.Cells(i, COL_TIPO_DOC).Value))

        ' Validar que tengamos los datos necesarios
        If documento <> "" And tipoDoc <> "" Then

            ' Construir la ruta de la API
            url = BASE_URL & "/" & AMBIENTE & "/" & tipoDoc & "/" & documento
            
            ' Realizar la petición
            http.Open "GET", url, False
            http.setRequestHeader "Accept", "application/json"
            http.send
            
            ' Verificar si la respuesta fue exitosa (Códigos 200 al 299)
            If http.Status >= 200 And http.Status < 300 Then
                respuestaAPI = http.responseText
                
                ' Parsear el JSON
                Set json = JsonConverter.ParseJson(respuestaAPI)
                
                ' Extraer y escribir datos
                ws.Cells(i, COL_SISBEN).Value = ExtraerTexto(json, "sisbenGrade")
                ws.Cells(i, COL_DESCRIPCION).Value = ExtraerTexto(json, "descripcion")
                ws.Cells(i, COL_NUEVAEPS).Value = ExtraerNuevaEps(json)
            Else
                ' Si el servidor rechaza la petición
                MarcarCeldas ws, i, "ERROR API: HTTP " & http.Status
            End If

        Else
            ' Si falta el documento o tipo
            MarcarCeldas ws, i, "FALTAN DATOS"
        End If

ContinuarSiguiente:
        On Error GoTo 0 ' Restablecer el control de errores para la siguiente vuelta
    Next i

    ' 5. Restaurar el estado normal de Excel
    Application.Calculation = xlCalculationAutomatic
    Application.ScreenUpdating = True

    MsgBox "¡Actualización finalizada con éxito!", vbInformation
    Exit Sub

' --- GESTIÓN DE ERRORES POR FILA ---
ManejoError:
    MarcarCeldas ws, i, "ERROR: " & Err.Description
    Err.Clear
    Resume ContinuarSiguiente ' Continuar con la siguiente fila sin detener toda la macro

End Sub


' =========================================================
' FUNCIONES AUXILIARES (Para mantener el código principal limpio)
' =========================================================

' Subrutina para escribir el mismo mensaje en las 3 columnas de forma rápida
Private Sub MarcarCeldas(ws As Worksheet, fila As Long, mensaje As String)
    ws.Cells(fila, COL_SISBEN).Value = mensaje
    ws.Cells(fila, COL_DESCRIPCION).Value = mensaje
    ws.Cells(fila, COL_NUEVAEPS).Value = mensaje
End Sub

' Extrae un texto del JSON de forma segura. Si no existe, devuelve vacío.
Private Function ExtraerTexto(jsonObj As Object, clave As String) As String
    On Error Resume Next
    If jsonObj.Exists(clave) Then
        ExtraerTexto = CStr(jsonObj(clave))
    Else
        ExtraerTexto = ""
    End If
    On Error GoTo 0
End Function

' Extrae la propiedad anidada "nuevaeps" y la convierte en "SI" o "NO"
Private Function ExtraerNuevaEps(jsonObj As Object) As String
    On Error Resume Next ' Si falla la navegación (ej. falta el nodo "portalNuevaeps"), no detiene la macro
    
    Dim valor As Variant
    ' Navegación directa al nodo anidado
    valor = jsonObj("portalNuevaeps")("nuevaeps")
    
    If VarType(valor) = vbBoolean Then
        If valor = True Then ExtraerNuevaEps = "SI" Else ExtraerNuevaEps = "NO"
    ElseIf Not IsEmpty(valor) Then
        ExtraerNuevaEps = CStr(valor)
    Else
        ExtraerNuevaEps = ""
    End If
    
    On Error GoTo 0
End Function
