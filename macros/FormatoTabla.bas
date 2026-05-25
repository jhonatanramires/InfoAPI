Attribute VB_Name = "Module1"
Sub FormatoTabla()
    Dim ws As Worksheet
    Dim columnasDeseadas As Variant
    Dim col As Variant
    Dim headerRow As Long
    Dim lastCol As Long
    Dim i As Long, j As Long
    Dim colIndex As Long
    Dim keepCols() As Boolean
    Dim ordenFinal() As Long
    Dim tempRange As Range
    
    ' Configurar la hoja de trabajo (cambia "Hoja1" por el nombre real si es necesario)
    Set ws = ActiveSheet
    headerRow = 1 ' Suponemos que los encabezados están en la fila 1
    
    ' Definir las columnas que queremos conservar (EN EL ORDEN DESEADO)
    columnasDeseadas = Array("NOMBRE IPS", "TIPO DOCUMENTO", "NRO IDENTIFICACION", _
                             "PRIMER APELLIDO", "SEGUNDO APELLIDO", "PRIMER NOMBRE", _
                             "SEGUNDO NOMBRE", "EDAD", "REGIMEN", "DIRECCION", _
                             "TELEFONO MAS USADO")
    
    ' Encontrar la última columna con datos en la fila de encabezados
    lastCol = ws.Cells(headerRow, ws.Columns.Count).End(xlToLeft).Column
    
    ' Arreglo para marcar qué columnas conservar (False por defecto)
    ReDim keepCols(1 To lastCol)
    
    ' Buscar coincidencias de cada columna deseada
    For Each col In columnasDeseadas
        For i = 1 To lastCol
            If StrComp(Trim(ws.Cells(headerRow, i).Value), Trim(col), vbTextCompare) = 0 Then
                keepCols(i) = True
                Exit For
            End If
        Next i
    Next col
    
    ' Eliminar columnas no deseadas (de derecha a izquierda)
    Application.ScreenUpdating = False
    For i = lastCol To 1 Step -1
        If Not keepCols(i) Then
            ws.Columns(i).Delete Shift:=xlToLeft
        End If
    Next i
    
    ' Ahora las columnas conservadas están en el mismo orden que originalmente aparecían.
    ' Pero tú quieres un orden específico (el de columnasDeseadas).
    ' Para reordenarlas, las moveremos una por una a la izquierda en el orden deseado.
    
    ' Primero, actualizar lastCol después de las eliminaciones
    lastCol = ws.Cells(headerRow, ws.Columns.Count).End(xlToLeft).Column
    
    ' Crear un arreglo con las posiciones actuales de las columnas deseadas
    ReDim ordenFinal(1 To UBound(columnasDeseadas) + 1)
    For i = 1 To lastCol
        For j = LBound(columnasDeseadas) To UBound(columnasDeseadas)
            If StrComp(Trim(ws.Cells(headerRow, i).Value), Trim(columnasDeseadas(j)), vbTextCompare) = 0 Then
                ordenFinal(j + 1) = i  ' j+1 porque el arreglo base 0
                Exit For
            End If
        Next j
    Next i
    
    ' Mover las columnas a la izquierda en el orden deseado
    Dim currentCol As Long
    Dim targetCol As Long
    For j = LBound(columnasDeseadas) To UBound(columnasDeseadas)
        currentCol = ordenFinal(j + 1)
        targetCol = j + 1
        If currentCol <> targetCol Then
            ws.Columns(currentCol).Cut
            ws.Columns(targetCol).Insert Shift:=xlToRight
            ' Actualizar las referencias de las columnas que se han movido
            For k = j + 1 To UBound(ordenFinal)
                If ordenFinal(k) > currentCol Then
                    ordenFinal(k) = ordenFinal(k) - 1
                ElseIf ordenFinal(k) < currentCol And ordenFinal(k) >= targetCol Then
                    ordenFinal(k) = ordenFinal(k) + 1
                End If
            Next k
            ordenFinal(j + 1) = targetCol
        End If
    Next j
    
    ' Opcional: autoajustar el ancho de las columnas resultantes
    ws.UsedRange.Columns.AutoFit
    
    Application.ScreenUpdating = True
    
    MsgBox "Columnas innecesarias eliminadas y reordenadas correctamente.", vbInformation
End Sub

