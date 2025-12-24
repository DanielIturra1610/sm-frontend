# Datos de Prueba - Árbol Causal

Este documento contiene datos de prueba para un incidente específico ideal para análisis mediante **Árbol Causal**. Esta metodología es especialmente útil cuando hay múltiples cadenas de eventos que convergen en un accidente.

---

## CASO: Electrocución en Subestación Eléctrica

**Descripción del caso:** Un técnico electricista sufrió una descarga eléctrica mientras realizaba trabajos de mantenimiento en un transformador de subestación. El accidente involucra múltiples factores: procedimentales, técnicos, organizacionales y humanos.

---

## 1. CREAR SUCESO (+ Flash Report Automático)

**Ruta:** `/incidents/create`

### Antecedentes Generales

| Campo | Valor |
|-------|-------|
| **title** (Suceso/Título) | Electrocución de técnico en subestación eléctrica por contacto con circuito energizado |
| **date_time** (Fecha y Hora) | 2024-12-18T14:45 |
| **zonal** | Metropolitana |
| **numero_prodity** | PRO-2024-0112 |
| **location** (Lugar, Comuna, Región) | Subestación Norte SE-015, Quilicura, Metropolitana |
| **area_zona** (Área) | Subestaciones - Alta Tensión |
| **empresa** | Ingeniería Eléctrica del Pacífico Ltda. |
| **supervisor** (Jefatura que Reporta) | Fernando Muñoz Sepúlveda |

### Clasificación del Suceso

| Campo | Valor |
|-------|-------|
| **categoria** | `accidente` |
| **tipoSuceso** | `acc_con_baja` |
| **severity** | `critical` |

### Checkboxes Tipo Incidente

| Campo | Valor |
|-------|-------|
| **con_baja_il** | `true` |
| **sin_baja_il** | `false` |
| **incidente_industrial** | `true` |
| **incidente_laboral** | `false` |

### PLGF

| Campo | Valor |
|-------|-------|
| **es_plgf** | `true` |
| **nivel_plgf** | `fatal` |
| **justificacion_plgf** | Descarga eléctrica de 13.2 kV con potencial de electrocución fatal. El trabajador sobrevivió debido a la rápida actuación del equipo de emergencia y la distancia parcial del arco eléctrico. Sin las protecciones personales, el desenlace habría sido fatal. |

### Descripción y Acciones

| Campo | Valor |
|-------|-------|
| **description** | El día 18 de diciembre de 2025 a las 14:45 horas, en la Subestación Norte SE-015, el técnico electricista Miguel Ángel Contreras Rojas (35 años, 8 años de experiencia) sufrió una descarga eléctrica mientras realizaba trabajos de mantenimiento preventivo en el transformador TR-02. El trabajador se encontraba verificando conexiones en el lado de baja tensión cuando, al extender su herramienta hacia un punto de medición, hizo contacto accidental con un bus de 13.2 kV que debía estar desenergizado. Se produjo un arco eléctrico que causó quemaduras de segundo y tercer grado en mano y brazo derecho del trabajador. El equipo de emergencia de la subestación actuó inmediatamente, desenergizando el circuito y aplicando primeros auxilios antes del traslado al Hospital del Trabajador. |
| **controles_inmediatos** | 1. Desenergización total del transformador TR-02. 2. Acordonamiento de área de subestación. 3. Activación de protocolo de emergencia eléctrica. 4. Verificación de bloqueo/etiquetado en toda la subestación. 5. Suspensión de todos los trabajos eléctricos en la instalación. |
| **acciones_inmediatas** | 1. Primeros auxilios al trabajador (no tocar, verificar desenergización). 2. Llamada a emergencias y ambulancia. 3. Traslado a Hospital del Trabajador ACHS. 4. Notificación a Gerencia, SEREMI de Salud y SEC. 5. Preservación de la escena para investigación. 6. Retiro de herramientas y equipos del área. |
| **factores_riesgo** | 1. Circuito no desenergizado correctamente (falla de seccionador). 2. Verificación de ausencia de tensión insuficiente. 3. Procedimiento de bloqueo/etiquetado incompleto. 4. Distancia de seguridad inadecuada al trabajar cerca de circuitos de alta tensión. 5. Detector de tensión con batería agotada. 6. Presión por cumplir cronograma de mantenimiento. |

### Personas Involucradas

| nombre | cargo | empresa | tipo_lesion |
|--------|-------|---------|-------------|
| Miguel Ángel Contreras Rojas | Técnico Electricista Senior | Ingeniería Eléctrica del Pacífico Ltda. | Quemaduras eléctricas de 2do y 3er grado en mano y brazo derecho |
| Fernando Muñoz Sepúlveda | Supervisor de Subestaciones | Ingeniería Eléctrica del Pacífico Ltda. | Sin lesiones |
| Carlos Andrés Vega Pinto | Técnico Electricista Ayudante | Ingeniería Eléctrica del Pacífico Ltda. | Sin lesiones |

---

## 2. FLASH REPORT (Creación Separada)

**Ruta:** `/reports/flash/create`

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso creado) |
| **suceso** | Electrocución de técnico en subestación eléctrica por contacto con circuito energizado |
| **tipo** | Accidente con baja IL - Incidente Industrial |
| **fecha** | 2024-12-18 |
| **hora** | 14:45 |
| **lugar** | Subestación Norte SE-015, Quilicura, Metropolitana |
| **area_zona** | Subestaciones - Alta Tensión |
| **empresa** | Ingeniería Eléctrica del Pacífico Ltda. |
| **supervisor** | Fernando Muñoz Sepúlveda |
| **descripcion** | (Mismo que description del suceso) |
| **zonal** | Metropolitana |
| **numero_prodity** | PRO-2024-0112 |

### Personas Involucradas (Flash Report)

> **Nota:** Estos datos se propagan automáticamente desde el Suceso al Flash Report, y luego al Reporte Final en modo Express.

| nombre | cargo | empresa | tipo_lesion |
|--------|-------|---------|-------------|
| Miguel Ángel Contreras Rojas | Técnico Electricista Senior | Ingeniería Eléctrica del Pacífico Ltda. | Quemaduras eléctricas de 2do y 3er grado en mano y brazo derecho |
| Fernando Muñoz Sepúlveda | Supervisor de Subestaciones | Ingeniería Eléctrica del Pacífico Ltda. | Sin lesiones |
| Carlos Andrés Vega Pinto | Técnico Electricista Ayudante | Ingeniería Eléctrica del Pacífico Ltda. | Sin lesiones |

---

## 3. ACCIONES INMEDIATAS

**Ruta:** `/reports/immediate-actions/create`

### Período del Reporte

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso) |
| **fecha_inicio** | 2024-12-18 |
| **fecha_termino** | 2024-12-19 |

### Items (Tabla de Acciones)

| # | tarea | inicio | fin | responsable | cliente | avance_real | avance_programado | comentario |
|---|-------|--------|-----|-------------|---------|-------------|-------------------|------------|
| 1 | Comunicar lo acontecido a Jefatura Directa | 2024-12-18 | 2024-12-18 | Fernando Muñoz | CGE | 100 | 100 | Comunicado 15:00 hrs |
| 2 | Informar Incidente y su clasificación a la Dirección | 2024-12-18 | 2024-12-18 | Fernando Muñoz | CGE | 100 | 100 | Gerencia y Directorio notificados |
| 3 | Enviar recopilación de antecedentes | 2024-12-18 | 2024-12-18 | Jefe HSEQ | CGE | 100 | 100 | Registro fotográfico y documentos |
| 4 | Informar Incidente Ocurrido a Jefatura CGE | 2024-12-18 | 2024-12-18 | Fernando Muñoz | CGE | 100 | 100 | Informado a las 15:15 hrs |
| 5 | Generar Reporte Flash vía WhatsApp a Jefe de Área CGE y HSEQ | 2024-12-18 | 2024-12-18 | Fernando Muñoz | CGE | 100 | 100 | Flash enviado 15:30 hrs |
| 6 | Iniciar Proceso de Investigación Preliminar de Incidentes | 2024-12-18 | 2024-12-19 | Comité Investigación | CGE | 100 | 100 | Equipo conformado |
| 7 | Notificación a SEC y SEREMI de Salud | 2024-12-18 | 2024-12-18 | Jefe Legal | Entidades | 100 | 100 | Notificaciones realizadas |
| 8 | Verificación estado equipos de protección | 2024-12-18 | 2024-12-18 | Jefe HSEQ | Interno | 100 | 100 | Detectores de tensión revisados |
| 9 | Inspección de seccionadores subestación | 2024-12-18 | 2024-12-19 | Jefe Mantención | CGE | 100 | 100 | Falla identificada en SEC-02 |

---

## 4. ANÁLISIS DE ÁRBOL CAUSAL

**Ruta:** `/causal-tree/create`

### PASO 1: Crear el Análisis

| Campo | Valor |
|-------|-------|
| **Suceso Asociado** | Electrocución de técnico en subestación eléctrica por contacto con circuito energizado |
| **Título del Análisis** | Análisis Árbol Causal - Electrocución en Subestación SE-015 |
| **Evento Final (Lesión/Daño)** | Quemaduras de segundo y tercer grado en mano y brazo derecho por descarga eléctrica de 13.2 kV |
| **Descripción (Opcional)** | Análisis causal del accidente por contacto eléctrico durante mantenimiento de transformador TR-02 |

---

### PASO 2: Agregar Nodos (Hechos)

El árbol se construye **hacia atrás**: desde el evento final hacia las causas.
Cada nodo representa un **HECHO OBJETIVO** (sin juicios de valor).

**Instrucciones:**
1. El nodo #1 (Evento Final) ya está creado automáticamente
2. Agregar cada hecho nuevo seleccionando su **consecuencia** (el nodo que resulta de este hecho)
3. Usar "Cambio" para algo que varió, "Condición" para algo que ya existía

**Tipos de relación (líneas):**
- **Línea gris →** Relación en cadena (una causa → un efecto)
- **Línea azul con ∧** Relación conjuntiva (este nodo causa AMBOS efectos conectados - Y lógico)
- **Línea ámbar con ∨** Relación disyuntiva (causa alternativa - O lógico)

> **Tip:** Si conectas un nodo a múltiples consecuencias (#4, #5), verás líneas azules con ∧ indicando que ese hecho contribuyó a AMBOS efectos.

---

### NODOS A AGREGAR (en orden sugerido)

#### Nivel 1: Causas Inmediatas del Evento Final

| # | Hecho (copiar/pegar) | Tipo | Consecuencia |
|---|----------------------|------|--------------|
| 2 | El trabajador extendió su herramienta hacia el bus de 13.2 kV | 🔵 Cambio | #1 (Evento Final) |
| 3 | El circuito de 13.2 kV estaba energizado | 🟦 Condición | #1 (Evento Final) |

---

#### Nivel 2: Causas de las Causas Inmediatas

| # | Hecho (copiar/pegar) | Tipo | Consecuencia |
|---|----------------------|------|--------------|
| 4 | El trabajador no verificó ausencia de tensión antes de aproximarse al bus | 🔵 Cambio | #2 |
| 5 | El trabajador no mantuvo la distancia de seguridad de 90 cm | 🔵 Cambio | #2 |
| 6 | El seccionador SEC-02 no operó correctamente al comando de apertura | 🔵 Cambio | #3 |
| 7 | El procedimiento de bloqueo/etiquetado (LOTO) no incluía verificación física redundante | 🟦 Condición | #3 |

---

#### Nivel 3: Causas Básicas

| # | Hecho (copiar/pegar) | Tipo | Consecuencia |
|---|----------------------|------|--------------|
| 8 | El detector de tensión del trabajador tenía la batería agotada | 🟦 Condición | #4 |
| 9 | El trabajador tenía 8 años de experiencia sin incidentes previos | 🟦 Condición | #4, #5 |
| 10 | El cronograma de mantenimiento tenía penalización contractual por retrasos | 🟦 Condición | #4, #5 |
| 11 | El seccionador SEC-02 no recibió mantenimiento preventivo en 18 meses | 🟦 Condición | #6 |
| 12 | El supervisor verificó desenergización solo por sistema SCADA sin inspección física | 🔵 Cambio | #6 |
| 13 | El procedimiento LOTO era versión 2019 sin actualización | 🟦 Condición | #7 |

---

#### Nivel 4: Fallas del Sistema de Gestión (CAUSAS RAÍZ)

| # | Hecho (copiar/pegar) | Tipo | Consecuencia | ⚑ Causa Raíz |
|---|----------------------|------|--------------|--------------|
| 14 | No existía sistema de alertas para mantenciones vencidas de equipos críticos | 🟦 Condición | #11 | ✅ Marcar |
| 15 | No existía protocolo de verificación de equipos de medición antes de trabajos en AT | 🟦 Condición | #8 | ✅ Marcar |
| 16 | No existía requisito de doble verificación física para trabajos en alta tensión | 🟦 Condición | #12 | ✅ Marcar |
| 17 | Los procedimientos críticos no tenían fecha de revisión obligatoria | 🟦 Condición | #13 | ✅ Marcar |
| 18 | La planificación de trabajos no incluía tiempo adicional para verificaciones de seguridad | 🟦 Condición | #10 | ✅ Marcar |

> **Nota:** Los nodos del Nivel 4 son las **Causas Raíz** del accidente. Después de crearlos, usa el menú (⋮) → "Marcar Causa Raíz" en cada uno. Estos representan las fallas sistémicas de gestión que deben abordarse con el Plan de Acción.

---

### DIAGRAMA DEL ÁRBOL CAUSAL

```
                          ┌─────────────────────────────────────┐
                          │ #1 EVENTO FINAL                     │
                          │ Quemaduras 2do y 3er grado en       │
                          │ mano y brazo derecho                │
                          └─────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
        ┌─────────────────────┐                   ┌─────────────────────┐
        │ #2 CAMBIO           │                   │ #3 CONDICIÓN        │
        │ Trabajador extendió │                   │ Circuito de 13.2 kV │
        │ herramienta al bus  │                   │ estaba energizado   │
        └─────────────────────┘                   └─────────────────────┘
                    │                                           │
          ┌────────┴────────┐                         ┌────────┴────────┐
          ▼                 ▼                         ▼                 ▼
    ┌───────────┐    ┌───────────┐            ┌───────────┐    ┌───────────┐
    │ #4 CAMBIO │    │ #5 CAMBIO │            │ #6 CAMBIO │    │ #7 COND.  │
    │ No verificó│   │ No mantuvo│            │ Seccionador│   │ LOTO sin  │
    │ tensión   │    │ distancia │            │ no operó  │    │ verific.  │
    └───────────┘    └───────────┘            └───────────┘    └───────────┘
          │               │                         │               │
    ┌─────┴─────┐   ┌─────┴─────┐           ┌─────┴─────┐   ┌─────┴─────┐
    ▼           ▼   ▼           ▼           ▼           ▼           ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│#8 COND│ │#9 COND│ │#9     │ │#10COND│ │#11COND│ │#12 CAM│ │#13COND│
│Detector│ │8 años │ │(mismo)│ │Presión│ │Sin mant│ │Superv.│ │LOTO   │
│sin bat.│ │exp.   │ │       │ │plazo  │ │18 meses│ │SCADA  │ │v.2019 │
└───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
    │                   │           │           │           │
    ▼                   ▼           ▼           ▼           ▼
┌───────┐         ┌───────┐   ┌───────┐   ┌───────┐   ┌───────┐
│#15COND│         │#18COND│   │#14COND│   │#16COND│   │#17COND│
│Sin prot│        │Sin tpo│   │Sin    │   │Sin doble│  │Sin    │
│verific.│        │segur. │   │alertas│   │verific. │  │revisión│
└───────┘         └───────┘   └───────┘   └───────┘   └───────┘
```

**Leyenda:**
- 🔵 CAMBIO = Algo que varió/anomalía (círculo en metodología original)
- 🟦 CONDICIÓN = Ya existía antes del accidente (cuadrado en metodología original)

---

## 5. PLAN DE ACCIÓN (Derivado del Árbol Causal)

**Ruta:** `/reports/action-plan/create`

### Período de Planificación

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso) |
| **fecha_inicio** | 2024-12-19 |
| **duracion_dias** | 60 |
| **fecha_fin_estimada** | 2025-02-17 |

### Items (Tabla de Tareas) - Basados en Causas Identificadas

| # | tarea | subtarea | inicio | fin | responsable | causa_que_aborda | estado |
|---|-------|----------|--------|-----|-------------|------------------|--------|
| 1 | Implementar sistema de alertas de mantención | Configurar alertas automáticas para equipos críticos vencidos | 2024-12-19 | 2025-01-15 | Jefe Mantención | FSG-01 | pending |
| 2 | Actualizar procedimiento LOTO | Incluir verificación física redundante y protocolo de fallas | 2024-12-19 | 2025-01-05 | Jefe HSEQ | CB-06, FSG-02 | pending |
| 3 | Crear checklist pre-trabajo AT | Verificación obligatoria de equipos de medición y EPP | 2024-12-20 | 2024-12-30 | Jefe HSEQ | CB-01, FSG-03 | pending |
| 4 | Reparar seccionador SEC-02 | Mantenimiento correctivo y certificación de operatividad | 2024-12-19 | 2024-12-22 | Jefe Mantención | CI-05, CB-04 | in_progress |
| 5 | Inspección de todos los seccionadores | Verificar estado de 45 seccionadores de la red | 2024-12-22 | 2025-01-20 | Jefe Mantención | CB-04, CB-05 | pending |
| 6 | Capacitación refuerzo LOTO | Incluir escenarios de falla y verificación redundante | 2025-01-10 | 2025-01-30 | Depto Capacitación | CB-07, FSG-05 | pending |
| 7 | Revisar política de plazos | Incluir tiempo de seguridad en cronogramas de AT | 2024-12-26 | 2025-01-15 | Gerencia Ops | CB-03, FSG-06 | pending |
| 8 | Implementar doble verificación | Requisito de 2 personas para confirmar desenergización en AT | 2025-01-05 | 2025-02-01 | Jefe HSEQ | CB-05, FSG-04 | pending |
| 9 | Adquisición detectores de tensión | 20 unidades nuevas con verificador de batería integrado | 2024-12-20 | 2025-01-10 | Jefe Adquisiciones | CB-01, CB-08 | pending |
| 10 | Difusión lecciones aprendidas | Charla a todos los técnicos electricistas de la empresa | 2025-01-15 | 2025-01-20 | Comité Paritario | CB-02 | pending |

---

## 6. REPORTE FINAL

**Ruta:** `/reports/final/create`

### Tab: Empresa (company_data)

| Campo | Valor |
|-------|-------|
| **nombre** | Ingeniería Eléctrica del Pacífico Ltda. |
| **rut** | 76.890.123-4 |
| **direccion** | Av. Los Libertadores 5670, Quilicura |
| **telefono** | +56 2 2345 6789 |
| **email** | contacto@iepacific.cl |
| **contacto** | Rodrigo Espinoza Tapia |

### Tab: Accidente (tipo_accidente_tabla)

| Campo | Valor |
|-------|-------|
| **con_baja_il** | `true` |
| **sin_baja_il** | `false` |
| **incidente_industrial** | `true` |
| **incidente_laboral** | `false` |
| **es_plgf** | `true` |
| **nivel_plgf** | `fatal` |

### Tab: Involucrados

> **Flujo de datos:** En modo Express, las personas involucradas se pre-cargan desde el Flash Report. Los campos básicos (`nombre`, `cargo`, `empresa`, `tipo_lesion`) vienen del Flash, y el usuario puede agregar detalles adicionales en el Reporte Final.

#### personas_involucradas

| nombre | cargo | empresa | tipo_lesion |
|--------|-------|---------|-------------|
| Miguel Ángel Contreras Rojas | Técnico Electricista Senior | Ingeniería Eléctrica del Pacífico Ltda. | Quemaduras eléctricas de 2do y 3er grado en mano y brazo derecho |
| Fernando Muñoz Sepúlveda | Supervisor de Subestaciones | Ingeniería Eléctrica del Pacífico Ltda. | Sin lesiones |
| Carlos Andrés Vega Pinto | Técnico Electricista Ayudante | Ingeniería Eléctrica del Pacífico Ltda. | Sin lesiones |

#### equipos_danados

| nombre | tipo | marca | tipo_dano | descripcion |
|--------|------|-------|-----------|-------------|
| Seccionador SEC-02 | Equipamiento AT | ABB | Falla mecánica | Mecanismo de apertura no operó correctamente |
| Detector de Tensión DT-15 | Instrumento de medición | Fluke | Batería agotada | Equipo sin capacidad de detección |
| Herramienta aislada HA-22 | Herramienta manual | Klein Tools | Daño por arco | Mango derretido por arco eléctrico |

#### terceros_identificados

| nombre | empresa | rol | contacto |
|--------|---------|-----|----------|
| Dr. Carmen Vega Soto | Hospital del Trabajador ACHS | Médico Tratante | +56 2 2685 3000 |
| Inspector Juan Pablo Morales | SEC - Superintendencia de Electricidad | Fiscalizador | sec.fiscalizacion@sec.cl |
| Andrés Figueroa Mena | Mutual de Seguridad | Prevencionista Asesor | +56 9 9876 5432 |

### Tab: Análisis (analisis_causas_raiz)

| problema | causa_raiz | accion_plan | metodologia |
|----------|------------|-------------|-------------|
| Contacto con circuito energizado | Falla en seccionador SEC-02 por mantenimiento preventivo vencido (18 meses sin revisión) | Implementar sistema de alertas para mantenciones vencidas de equipos críticos | Árbol Causal |
| No verificación de ausencia de tensión | Detector de tensión con batería agotada + exceso de confianza | Crear checklist obligatorio de verificación de equipos antes de trabajos AT | Árbol Causal |
| Procedimiento LOTO incompleto | Procedimiento versión 2019 sin actualización ni verificación redundante | Actualizar procedimiento LOTO e implementar doble verificación para AT | Árbol Causal |
| Presión por cumplir cronograma | Cultura organizacional prioriza plazos sobre verificaciones de seguridad | Revisar política de plazos para incluir tiempos de seguridad en trabajos AT | Árbol Causal |

#### Campos de texto

| Campo | Valor |
|-------|-------|
| **detalles_accidente** | El día 18 de diciembre de 2024, a las 14:45 horas, en la Subestación Norte SE-015, el técnico electricista Miguel Ángel Contreras Rojas sufrió una descarga eléctrica de 13.2 kV mientras realizaba mantenimiento preventivo en el transformador TR-02. El trabajador, con 8 años de experiencia, se encontraba verificando conexiones cuando hizo contacto accidental con un bus que debía estar desenergizado. |
| **descripcion_detallada** | El trabajador seguía el procedimiento de mantenimiento preventivo establecido. Después de aplicar el procedimiento de bloqueo/etiquetado (LOTO), procedió a realizar verificaciones en el transformador TR-02. Sin embargo, el seccionador SEC-02 presentó una falla mecánica que mantuvo el circuito energizado a pesar de indicar posición "abierto" en el sistema SCADA. El detector de tensión personal del trabajador tenía la batería agotada, lo que impidió detectar la presencia de voltaje. Al extender una herramienta para tomar una medición, el trabajador hizo contacto con el bus energizado, produciéndose un arco eléctrico. |
| **conclusiones** | El accidente fue resultado de una cadena de fallas que incluye: (1) falla mecánica en seccionador por mantenimiento preventivo vencido, (2) equipo de detección de tensión inoperativo, (3) procedimiento LOTO sin verificación redundante, (4) supervisión que confió únicamente en indicación de sistema SCADA, y (5) presión organizacional por cumplimiento de plazos. El análisis de árbol causal identificó fallas sistémicas en la gestión de mantenimiento, actualización de procedimientos y cultura de seguridad. |
| **lecciones_aprendidas** | 1. La indicación de sistemas SCADA debe siempre verificarse físicamente en terreno. 2. Los equipos de protección personal deben verificarse antes de cada trabajo crítico. 3. El mantenimiento de equipos de maniobra es tan crítico como el de los equipos principales. 4. Los procedimientos deben incluir verificaciones redundantes para tareas de alto riesgo. 5. La presión por plazos nunca debe comprometer las verificaciones de seguridad. 6. La experiencia previa no sustituye el cumplimiento riguroso de procedimientos. |

### Tab: Costos

#### costos_tabla

| concepto | monto | moneda | descripcion |
|----------|-------|--------|-------------|
| Atención médica y hospitalización | 8500000 | CLP | Hospital del Trabajador - tratamiento quemaduras |
| Subsidio por incapacidad laboral | 4200000 | CLP | Estimado 90 días de licencia |
| Reparación seccionador SEC-02 | 12000000 | CLP | Recambio mecanismo de apertura ABB |
| Inspección de seccionadores red | 3500000 | CLP | 45 equipos a verificar |
| Adquisición detectores de tensión | 4800000 | CLP | 20 unidades Fluke con verificador batería |
| Capacitaciones correctivas | 2100000 | CLP | Curso LOTO actualizado - 35 técnicos |
| Horas de investigación | 890000 | CLP | Equipo investigador 5 personas x 40 horas |
| Multa potencial SEC | 15000000 | CLP | Estimación multa regulatoria |

#### responsables_investigacion

| nombre | cargo | firma |
|--------|-------|-------|
| Patricia González Valenzuela | Jefe de Prevención de Riesgos | P. González |
| Fernando Muñoz Sepúlveda | Supervisor de Subestaciones | F. Muñoz |
| Rodrigo Espinoza Tapia | Gerente de Operaciones | R. Espinoza |
| Carmen Luz Pérez Saavedra | Representante Comité Paritario | C. Pérez |
| Inspector Juan Pablo Morales | Fiscalizador SEC | J.P. Morales |

---

## Resumen - Características del Caso para Árbol Causal

Este caso es ideal para **Árbol Causal** porque presenta:

1. **Múltiples cadenas causales convergentes:**
   - Cadena de actos inseguros (factor humano)
   - Cadena de condiciones inseguras (factor técnico)
   - Ambas convergen en el accidente

2. **Diferentes niveles de causalidad:**
   - Causas inmediatas (actos y condiciones)
   - Causas básicas (factores personales y de trabajo)
   - Fallas del sistema de gestión (organizacionales)

3. **Relaciones lógicas claras:**
   - Cada causa se conecta lógicamente con sus efectos
   - Se pueden trazar rutas desde el accidente hasta las fallas raíz

4. **Acciones correctivas trazables:**
   - Cada acción del plan de acción puede vincularse a una causa específica identificada en el árbol

---

## Textos Largos para Copiar/Pegar

**description:**
```
El día 18 de diciembre de 2024 a las 14:45 horas, en la Subestación Norte SE-015, el técnico electricista Miguel Ángel Contreras Rojas (35 años, 8 años de experiencia) sufrió una descarga eléctrica mientras realizaba trabajos de mantenimiento preventivo en el transformador TR-02. El trabajador se encontraba verificando conexiones en el lado de baja tensión cuando, al extender su herramienta hacia un punto de medición, hizo contacto accidental con un bus de 13.2 kV que debía estar desenergizado. Se produjo un arco eléctrico que causó quemaduras de segundo y tercer grado en mano y brazo derecho del trabajador.
```

**justificacion_plgf:**
```
Descarga eléctrica de 13.2 kV con potencial de electrocución fatal. El trabajador sobrevivió debido a la rápida actuación del equipo de emergencia y la distancia parcial del arco eléctrico. Sin las protecciones personales, el desenlace habría sido fatal.
```

**conclusiones:**
```
El accidente fue resultado de una cadena de fallas que incluye: (1) falla mecánica en seccionador por mantenimiento preventivo vencido, (2) equipo de detección de tensión inoperativo, (3) procedimiento LOTO sin verificación redundante, (4) supervisión que confió únicamente en indicación de sistema SCADA, y (5) presión organizacional por cumplimiento de plazos. El análisis de árbol causal identificó fallas sistémicas en la gestión de mantenimiento, actualización de procedimientos y cultura de seguridad.
```

**lecciones_aprendidas:**
```
1. La indicación de sistemas SCADA debe siempre verificarse físicamente en terreno
2. Los equipos de protección personal deben verificarse antes de cada trabajo crítico
3. El mantenimiento de equipos de maniobra es tan crítico como el de los equipos principales
4. Los procedimientos deben incluir verificaciones redundantes para tareas de alto riesgo
5. La presión por plazos nunca debe comprometer las verificaciones de seguridad
6. La experiencia previa no sustituye el cumplimiento riguroso de procedimientos
```

---

## JSON para Pruebas de API

### personas_involucradas (formato JSON)

```json
{
  "personas_involucradas": [
    {
      "nombre": "Miguel Ángel Contreras Rojas",
      "cargo": "Técnico Electricista Senior",
      "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
      "tipo_lesion": "Quemaduras eléctricas de 2do y 3er grado en mano y brazo derecho"
    },
    {
      "nombre": "Fernando Muñoz Sepúlveda",
      "cargo": "Supervisor de Subestaciones",
      "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
      "tipo_lesion": "Sin lesiones"
    },
    {
      "nombre": "Carlos Andrés Vega Pinto",
      "cargo": "Técnico Electricista Ayudante",
      "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
      "tipo_lesion": "Sin lesiones"
    }
  ]
}
```

### Ejemplo de payload completo para Flash Report

```json
{
  "incident_id": "<UUID_DEL_SUCESO>",
  "suceso": "Electrocución de técnico en subestación eléctrica por contacto con circuito energizado",
  "tipo": "Accidente con baja IL - Incidente Industrial",
  "fecha": "2024-12-18",
  "hora": "14:45",
  "lugar": "Subestación Norte SE-015, Quilicura, Metropolitana",
  "area_zona": "Subestaciones - Alta Tensión",
  "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
  "supervisor": "Fernando Muñoz Sepúlveda",
  "descripcion": "El día 18 de diciembre de 2024 a las 14:45 horas...",
  "zonal": "Metropolitana",
  "numero_prodity": "PRO-2024-0112",
  "con_baja_il": true,
  "sin_baja_il": false,
  "incidente_industrial": true,
  "incidente_laboral": false,
  "es_plgf": true,
  "nivel_plgf": "fatal",
  "justificacion_plgf": "Descarga eléctrica de 13.2 kV con potencial de electrocución fatal...",
  "personas_involucradas": [
    {
      "nombre": "Miguel Ángel Contreras Rojas",
      "cargo": "Técnico Electricista Senior",
      "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
      "tipo_lesion": "Quemaduras eléctricas de 2do y 3er grado en mano y brazo derecho"
    },
    {
      "nombre": "Fernando Muñoz Sepúlveda",
      "cargo": "Supervisor de Subestaciones",
      "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
      "tipo_lesion": "Sin lesiones"
    },
    {
      "nombre": "Carlos Andrés Vega Pinto",
      "cargo": "Técnico Electricista Ayudante",
      "empresa": "Ingeniería Eléctrica del Pacífico Ltda.",
      "tipo_lesion": "Sin lesiones"
    }
  ]
}
```
