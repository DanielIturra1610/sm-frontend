# Datos de Prueba - Suceso Tolerancia Cero

## Caso de Prueba 1: Violación de Bloqueo/Etiquetado (LOTO)

### Antecedentes Generales
| Campo | Valor |
|-------|-------|
| Suceso / Título | Trabajador ingresa a zona energizada sin bloqueo LOTO |
| Fecha y Hora | 2024-12-26 08:30 |
| Lugar | Sala de compresores - Planta Norte |
| Área/Zona | Área de Mantenimiento Industrial |
| Empresa | Contratista ABC Servicios Ltda. |
| Supervisor CGE | Carlos Muñoz Pérez |
| N° Prodity | PRD-2024-001234 |

### Clasificación
| Campo | Valor |
|-------|-------|
| Categoría | Tolerancia Cero |
| Tipo de Suceso | Violación LOTO |
| Severidad | Alta |

### Personas Involucradas
| Nombre | Cargo | Empresa |
|--------|-------|---------|
| Juan Pérez González | Técnico Eléctrico | Contratista ABC Servicios Ltda. |
| María López Silva | Supervisor de Turno | CGE |

### Descripción del Evento
```
El día 26 de diciembre a las 08:30 hrs, durante trabajos de mantenimiento preventivo en la sala de compresores, se detectó que el trabajador Juan Pérez González ingresó al área de trabajo sin verificar el bloqueo LOTO correspondiente.

El equipo (compresor C-102) se encontraba en proceso de aislamiento por parte del equipo de operaciones, pero aún no se había completado el procedimiento de bloqueo. El trabajador asumió erróneamente que el equipo ya estaba aislado y comenzó a realizar trabajos en las conexiones eléctricas.

La situación fue detectada por la Supervisora de Turno María López, quien detuvo inmediatamente los trabajos y procedió a evacuar al personal del área.

No se registraron lesiones ni daños a equipos.
```

### Acciones Tomadas
```
1. Detención inmediata de los trabajos
2. Evacuación del personal del área afectada
3. Verificación del estado de aislamiento del equipo
4. Completar procedimiento LOTO según estándar
5. Reunión de seguridad con todo el personal involucrado
6. Suspensión temporal del trabajador hasta investigación
7. Notificación a Gerencia de Seguridad y Salud Ocupacional
```

---

## Caso de Prueba 2: Trabajo en Altura sin Protección

### Antecedentes Generales
| Campo | Valor |
|-------|-------|
| Suceso / Título | Operador trabaja en altura sin arnés de seguridad |
| Fecha y Hora | 2024-12-26 14:15 |
| Lugar | Torre de enfriamiento - Sector B |
| Área/Zona | Área de Servicios Industriales |
| Empresa | Mantenciones XYZ SpA |
| Supervisor CGE | Roberto Sánchez Mora |
| N° Prodity | PRD-2024-001235 |

### Clasificación
| Campo | Valor |
|-------|-------|
| Categoría | Tolerancia Cero |
| Tipo de Suceso | Trabajo en altura sin protección |
| Severidad | Alta |

### Personas Involucradas
| Nombre | Cargo | Empresa |
|--------|-------|---------|
| Pedro Rojas Díaz | Operador de Mantención | Mantenciones XYZ SpA |

### Descripción del Evento
```
Durante inspección rutinaria de seguridad a las 14:15 hrs, se detectó al trabajador Pedro Rojas realizando trabajos de limpieza en la torre de enfriamiento a una altura aproximada de 6 metros, sin utilizar el arnés de seguridad requerido.

El trabajador indicó que había olvidado colocarse el arnés después de su descanso de almuerzo. Se verificó que el arnés se encontraba en el área de trabajo pero no estaba siendo utilizado.

El trabajador fue descendido de manera segura y se procedió a la paralización de las actividades.
```

### Acciones Tomadas
```
1. Paralización inmediata del trabajo
2. Descenso controlado del trabajador
3. Verificación de estado de salud del trabajador
4. Confiscación temporal de credencial de acceso
5. Charla de reforzamiento sobre trabajo en altura
6. Comunicación a empresa contratista
7. Inicio de proceso disciplinario según contrato
```

---

## Caso de Prueba 3: Consumo de Alcohol/Drogas

### Antecedentes Generales
| Campo | Valor |
|-------|-------|
| Suceso / Título | Trabajador detectado bajo influencia de alcohol |
| Fecha y Hora | 2024-12-26 07:00 |
| Lugar | Control de acceso - Portería Principal |
| Área/Zona | Acceso Principal Planta |
| Empresa | Transportes del Sur S.A. |
| Supervisor CGE | Ana María Contreras |
| N° Prodity | PRD-2024-001236 |

### Clasificación
| Campo | Valor |
|-------|-------|
| Categoría | Tolerancia Cero |
| Tipo de Suceso | Consumo de alcohol o drogas |
| Severidad | Alta |

### Personas Involucradas
| Nombre | Cargo | Empresa |
|--------|-------|---------|
| Miguel Ángel Torres | Conductor de Camión | Transportes del Sur S.A. |

### Descripción del Evento
```
El día 26 de diciembre a las 07:00 hrs, durante el control de acceso rutinario en portería principal, el guardia de seguridad detectó signos de aliento alcohólico en el conductor Miguel Ángel Torres, quien pretendía ingresar a las instalaciones para realizar transporte de materiales.

Se procedió a realizar test de alcoholemia con resultado positivo (0.42 g/l). El trabajador reconoció haber consumido alcohol la noche anterior en una celebración familiar.

Se impidió el ingreso a las instalaciones y se notificó inmediatamente a su empresa empleadora.
```

### Acciones Tomadas
```
1. Denegación de acceso a instalaciones
2. Retiro de licencia de conducir temporal
3. Test de alcoholemia documentado con testigos
4. Notificación formal a empresa Transportes del Sur S.A.
5. Inhabilitación de credencial de acceso
6. Coordinación de transporte seguro para el trabajador
7. Solicitud de reemplazo de conductor a empresa contratista
8. Registro en sistema de control de contratistas
```

---

## Notas para Testing

### Validaciones a Verificar
- [ ] La categoría "Tolerancia Cero" muestra alerta visual amarilla
- [ ] El campo "Zonal" NO aparece para Tolerancia Cero
- [ ] Los checkboxes de IL/PLGF NO aparecen para Tolerancia Cero
- [ ] El campo "Tipo de Lesión" NO aparece en personas involucradas
- [ ] El botón muestra "Crear Suceso y Reporte Tolerancia Cero"
- [ ] El header indica que se creará Reporte Tolerancia Cero
- [ ] Se crea correctamente el Suceso con type="zero_tolerance"
- [ ] Se crea automáticamente el Reporte de Tolerancia Cero asociado
- [ ] El campo "Acciones Inmediatas" se muestra como "Acciones Tomadas"

### Tipos de Suceso Tolerancia Cero Disponibles
1. Violación LOTO
2. Trabajo en altura sin protección
3. Espacios confinados sin autorización
4. Consumo de alcohol o drogas
5. Agresión física
6. Manipulación de dispositivos de seguridad
7. Exceso de velocidad
8. No uso de cinturón de seguridad
9. Uso de celular conduciendo
10. Otros (Tolerancia Cero)

### Severidades Disponibles
- Baja (low)
- Media (medium)
- Alta (high)
