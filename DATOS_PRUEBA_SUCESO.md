# Datos de Prueba - Mapeados a Formularios

Este documento contiene datos de prueba mapeados exactamente a los campos de los formularios de la aplicación.

---

## 1. CREAR SUCESO (+ Flash Report Automático)

**Ruta:** `/incidents/create`

### Antecedentes Generales

| Campo | Valor |
|-------|-------|
| **title** (Suceso/Título) | Caída de trabajador desde andamio en área de mantención |
| **date_time** (Fecha y Hora) | 2024-12-15T10:30 |
| **zonal** | O'Higgins |
| **numero_prodity** | PRO-2024-0087 |
| **location** (Lugar, Comuna, Región) | Planta Norte, San Fco de Mostazal, O'Higgins |
| **area_zona** (Área) | Mantención |
| **empresa** | Servicios Industriales del Norte SpA |
| **supervisor** (Jefatura que Reporta) | Roberto Díaz Campos |

### Clasificación del Suceso

| Campo | Valor |
|-------|-------|
| **categoria** | `accidente` |
| **tipoSuceso** | `acc_con_baja` |
| **severity** | `high` |

### Checkboxes Tipo Incidente

| Campo | Valor |
|-------|-------|
| **con_baja_il** | `true` |
| **sin_baja_il** | `false` |
| **incidente_industrial** | `false` |
| **incidente_laboral** | `false` |

### PLGF

| Campo | Valor |
|-------|-------|
| **es_plgf** | `true` |
| **nivel_plgf** | `potencial` |
| **justificacion_plgf** | Caída desde altura de 4.5 metros con potencial de lesiones graves o fatales. El trabajador pudo haber impactado con mayor fuerza causando trauma craneoencefálico. |

### Descripción y Acciones

| Campo | Valor |
|-------|-------|
| **description** | Durante labores de mantención preventiva de estructura metálica en el Galpón de Mantención, el trabajador Juan Pérez González se encontraba realizando trabajos de pintura anticorrosiva a una altura de 4.5 metros utilizando un andamio tubular. Aproximadamente a las 10:30 horas, al intentar alcanzar una zona de difícil acceso, el trabajador perdió el equilibrio y cayó desde el andamio, impactando contra el suelo de concreto. El trabajador fue asistido inmediatamente por sus compañeros y trasladado al centro médico de la empresa. |
| **controles_inmediatos** | 1. Acordonamiento del área del accidente. 2. Suspensión temporal de trabajos en altura en el sector. 3. Retiro del andamio dañado. 4. Inspección de andamios restantes. |
| **acciones_inmediatas** | 1. Primeros auxilios al trabajador. 2. Traslado a centro médico. 3. Derivación a Hospital Regional. 4. Notificación a Gerencia y Prevención de Riesgos. 5. Inicio de investigación preliminar. |
| **factores_riesgo** | 1. Trabajo en altura sin supervisión directa. 2. Andamio sin rodapié completo. 3. Punto de anclaje a distancia inadecuada. 4. Exceso de confianza del trabajador. |

---

## 2. FLASH REPORT (Creación Separada)

**Ruta:** `/reports/flash/create`

> Nota: Este reporte se crea automáticamente al crear el suceso. Solo usar este formulario si se necesita crear manualmente.

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso creado) |
| **suceso** | Caída de trabajador desde andamio en área de mantención |
| **tipo** | Accidente con baja IL |
| **fecha** | 2024-12-15 |
| **hora** | 10:30 |
| **lugar** | Planta Norte, San Fco de Mostazal, O'Higgins |
| **area_zona** | Mantención |
| **empresa** | Servicios Industriales del Norte SpA |
| **supervisor** | Roberto Díaz Campos |
| **descripcion** | (Mismo que description del suceso) |
| **zonal** | O'Higgins |
| **numero_prodity** | PRO-2024-0087 |
| **acciones_inmediatas** | 1. Primeros auxilios al trabajador. 2. Traslado a centro médico. 3. Derivación a Hospital Regional. 4. Notificación a Gerencia. |
| **controles_inmediatos** | 1. Acordonamiento del área. 2. Suspensión de trabajos en altura. 3. Retiro de andamio dañado. |
| **factores_riesgo** | 1. Trabajo en altura sin supervisión. 2. Andamio incompleto. 3. Exceso de confianza. |

---

## 3. ACCIONES INMEDIATAS

**Ruta:** `/reports/immediate-actions/create`

### Período del Reporte

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso) |
| **fecha_inicio** | 2024-12-15 |
| **fecha_termino** | 2024-12-16 |

### Items (Tabla de Acciones)

| # | tarea | inicio | fin | responsable | cliente | avance_real | avance_programado | comentario |
|---|-------|--------|-----|-------------|---------|-------------|-------------------|------------|
| 1 | Comunicar lo acontecido a Jefatura Directa | 2024-12-15 | 2024-12-15 | Roberto Díaz | CGE | 100 | 100 | Comunicado a las 10:50 hrs |
| 2 | Informar Incidente y su clasificación a la Dirección | 2024-12-15 | 2024-12-15 | Roberto Díaz | CGE | 100 | 100 | Gerencia notificada |
| 3 | Enviar recopilación de antecedentes | 2024-12-15 | 2024-12-15 | María Soto | CGE | 100 | 100 | Documentación enviada |
| 4 | Informar Incidente Ocurrido a Jefatura CGE | 2024-12-15 | 2024-12-15 | Roberto Díaz | CGE | 100 | 100 | Jefatura informada |
| 5 | Generar Reporte Flash vía WhatsApp a Jefe de Área CGE y HSEQ | 2024-12-15 | 2024-12-15 | Roberto Díaz | CGE | 100 | 100 | Flash enviado 11:00 hrs |
| 6 | Iniciar Proceso de Investigación Preliminar de Incidentes | 2024-12-15 | 2024-12-16 | Comité Paritario | CGE | 100 | 100 | Investigación iniciada |
| 7 | Traslado de trabajador a Hospital Regional | 2024-12-15 | 2024-12-15 | Rodrigo Sepúlveda | ACHS | 100 | 100 | Derivado a las 11:15 hrs |
| 8 | Inspección de todos los andamios del área | 2024-12-15 | 2024-12-15 | Prevencionista | Stegmaier | 100 | 100 | 12 andamios inspeccionados |

---

## 4. ANÁLISIS DE CAUSA RAÍZ (5 Por Qués)

**Ruta:** `/root-cause-analysis/five-whys/create`

### Configuración Inicial

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso) |

### Por Qué #1

| Campo | Valor |
|-------|-------|
| **Pregunta** | ¿Por qué ocurrió esto? |
| **Respuesta** | Porque el trabajador perdió el equilibrio al inclinarse excesivamente fuera de la plataforma del andamio para alcanzar una zona de difícil acceso. |
| **Evidencias** | `Documento #INV-001` `Foto de la escena` `Testimonio de operador` |
| **Notas o comentarios** | Según testigos, el trabajador se estiró más de 50cm fuera de la plataforma de trabajo. |

### Por Qué #2

| Campo | Valor |
|-------|-------|
| **Pregunta** | ¿Por qué ocurrió esto? |
| **Respuesta** | Porque el trabajador necesitaba alcanzar una zona que no era accesible desde la posición actual del andamio y decidió no reposicionarlo. |
| **Evidencias** | `Documento #PROC-045` `Foto del andamio` |
| **Notas o comentarios** | El procedimiento de trabajo no especificaba la frecuencia de reposicionamiento del andamio. |

### Por Qué #3

| Campo | Valor |
|-------|-------|
| **Pregunta** | ¿Por qué ocurrió esto? |
| **Respuesta** | Porque el trabajador consideró que era más rápido estirarse que mover el andamio completo, priorizando rapidez sobre seguridad. |
| **Evidencias** | `Testimonio de operador` `Testimonio de compañero` |
| **Notas o comentarios** | Existía presión implícita por cumplir con el plazo de entrega del trabajo de pintura. |

### Por Qué #4

| Campo | Valor |
|-------|-------|
| **Pregunta** | ¿Por qué ocurrió esto? |
| **Respuesta** | Porque no había supervisión directa en ese momento que pudiera corregir la conducta insegura del trabajador. |
| **Evidencias** | `Documento #REG-SUP-12` `Registro de asistencia` |
| **Notas o comentarios** | El supervisor estaba atendiendo otro frente de trabajo a 200 metros de distancia. |

### Por Qué #5 (Causa Raíz)

| Campo | Valor |
|-------|-------|
| **Pregunta** | ¿Por qué ocurrió esto? |
| **Respuesta** | Porque el supervisor atendía múltiples frentes de trabajo simultáneamente debido a un ratio inadecuado de supervisor/trabajadores (1:12 en lugar del recomendado 1:5 para tareas de alto riesgo). |
| **Evidencias** | `Documento #ORG-2024` `Planilla de turnos` `Informe de dotación` |
| **Notas o comentarios** | La empresa no había definido ratios específicos de supervisión para trabajos de alto riesgo.

---

## 5. PLAN DE ACCIÓN

**Ruta:** `/reports/action-plan/create`

### Período de Planificación

| Campo | Valor |
|-------|-------|
| **incident_id** | (Seleccionar el suceso) |
| **fecha_inicio** | 2024-12-16 |
| **duracion_dias** | 45 |
| **fecha_fin_estimada** | 2025-01-30 |

### Items (Tabla de Tareas)

| # | tarea | subtarea | inicio | fin | responsable | cliente | avance_real | avance_programado | estado | comentario |
|---|-------|----------|--------|-----|-------------|---------|-------------|-------------------|--------|------------|
| 1 | Actualizar procedimiento de pintura en altura | Incluir criterios de reposicionamiento cada 1.5m | 2024-12-16 | 2024-12-30 | Jefe Prevención | CGE | 0 | 100 | pending | Prioridad alta |
| 2 | Definir ratio supervisor/trabajadores | Máximo 1:5 en tareas de alto riesgo | 2024-12-16 | 2025-01-15 | Gerencia Ops | CGE | 0 | 100 | pending | Requiere aprobación gerencial |
| 3 | Modificar formato ART | Agregar campo Análisis de Accesibilidad | 2024-12-16 | 2024-12-20 | Jefe Prevención | CGE | 0 | 100 | pending | Formato digital |
| 4 | Capacitación trabajadores altura | Posicionamiento seguro en andamios | 2024-12-20 | 2025-01-10 | Depto Capacitación | Contratistas | 0 | 100 | pending | 25 trabajadores |
| 5 | Inspección y certificación andamios | Todos los andamios de la empresa | 2024-12-16 | 2024-12-31 | Jefe Mantención | Stegmaier | 50 | 100 | in_progress | 6 de 12 completados |
| 6 | Adquisición líneas de vida retráctiles | 10 unidades para trabajos móviles | 2024-12-20 | 2025-01-15 | Jefe Adquisiciones | Stegmaier | 0 | 100 | pending | Cotizaciones en proceso |
| 7 | Sistema verificación puntos anclaje | Checklist digital diario | 2024-12-25 | 2025-01-31 | Jefe Prevención | CGE | 0 | 100 | pending | Desarrollo app móvil |
| 8 | Reunión difusión accidente | Lecciones aprendidas a todo el personal | 2024-12-18 | 2024-12-20 | Comité Paritario | Todos | 0 | 100 | pending | Auditorio planta |

---

## 6. REPORTE FINAL

**Ruta:** `/reports/final/create`

### Tab: Empresa (company_data)

| Campo | Valor |
|-------|-------|
| **nombre** | Servicios Industriales del Norte SpA |
| **rut** | 76.543.210-K |
| **direccion** | Av. Industrial 1234, Antofagasta |
| **telefono** | +56 55 234 5678 |
| **email** | contacto@sinorte.cl |
| **contacto** | Marcelo Fuentes |

### Tab: Accidente (tipo_accidente_tabla)

| Campo | Valor |
|-------|-------|
| **con_baja_il** | `true` |
| **sin_baja_il** | `false` |
| **incidente_industrial** | `false` |
| **incidente_laboral** | `false` |

### Tab: Involucrados

#### personas_involucradas

| nombre | cargo | empresa | tipo_lesion |
|--------|-------|---------|-------------|
| Juan Andrés Pérez González | Maestro Pintor Industrial | Servicios Industriales del Norte SpA | Fractura radio distal muñeca derecha, contusiones múltiples |

#### equipos_danados

| nombre | tipo | marca | tipo_dano |
|--------|------|-------|-----------|
| Andamio Tubular AT-450 | Estructura | Scaff Master | Deformación de crucetas y barandas |
| Arnés de Seguridad | EPP | 3M Protecta | Mosquetón dañado |

#### terceros_identificados

| nombre | empresa | rol | contacto |
|--------|---------|-----|----------|
| Carlos Muñoz Soto | Servicios Industriales del Norte | Testigo/Ayudante | +56 9 8765 4321 |
| Dr. Alejandro Ríos | Hospital Regional Antofagasta | Médico Tratante | +56 55 265 6000 |

### Tab: Análisis

#### analisis_causas_raiz

| problema | causa_raiz | accion_plan | metodologia |
|----------|------------|-------------|-------------|
| Caída desde andamio por pérdida de equilibrio | Deficiencia en sistema de supervisión - ratio inadecuado supervisor/trabajadores | Definir ratio 1:5 para tareas de alto riesgo | 5 Por Qués |
| Procedimiento no especifica frecuencia reposicionamiento | Procedimiento de trabajo incompleto | Actualizar procedimiento con criterios específicos | 5 Por Qués |
| ART no identificó dificultad de acceso como riesgo | Falla en análisis de riesgo de tarea | Modificar formato ART con campo de accesibilidad | 5 Por Qués |

#### Campos de texto

| Campo | Valor |
|-------|-------|
| **detalles_accidente** | El día 15 de diciembre de 2024, a las 10:30 horas, en el Galpón de Mantención de Planta Norte, el trabajador Juan Pérez González sufrió una caída desde un andamio de 4.5 metros de altura. El trabajador realizaba labores de pintura anticorrosiva cuando, al intentar alcanzar una zona de difícil acceso, perdió el equilibrio y cayó impactando el suelo de concreto. |
| **descripcion_detallada** | El trabajador se encontraba utilizando un andamio tubular modelo AT-450 para realizar trabajos de pintura anticorrosiva en estructura metálica. Al momento del accidente, el trabajador estaba conectado a un punto de anclaje fijo mediante arnés de seguridad. Sin embargo, al inclinarse excesivamente para alcanzar una zona fuera de su alcance normal, perdió el equilibrio. La distancia de caída libre superó la capacidad del sistema anticaídas antes de que este pudiera detener la caída. |
| **conclusiones** | El accidente fue consecuencia de una combinación de factores humanos y organizacionales. Si bien el trabajador tomó una decisión insegura al inclinarse excesivamente, las condiciones del sistema de gestión (supervisión, procedimientos, análisis de riesgos) no proporcionaron las barreras necesarias para prevenir esta situación. Las medidas correctivas abordan tanto los factores inmediatos como las causas raíz identificadas. |
| **lecciones_aprendidas** | 1. La experiencia previa no sustituye el cumplimiento estricto de procedimientos. 2. Los trabajos en altura requieren supervisión directa y continua. 3. El análisis de riesgos debe considerar específicamente la accesibilidad. 4. El reposicionamiento de plataformas debe ser parte del procedimiento estándar. 5. Los puntos de anclaje deben evaluarse considerando el factor de caída. |
| **acciones_inmediatas_resumen** | Se ejecutaron 8 acciones inmediatas: primeros auxilios, traslado a centro médico, derivación a hospital, acordonamiento del área, notificación a gerencia, suspensión de trabajos en altura, inspección de andamios y retiro de equipos dañados. Todas completadas dentro de las primeras 24 horas. |
| **plan_accion_resumen** | Plan de acción de 45 días con 8 tareas: actualización de procedimientos, definición de ratios de supervisión, modificación de formato ART, capacitación de trabajadores, inspección de andamios, adquisición de equipos, implementación de sistema de verificación y difusión de lecciones aprendidas. |

### Tab: Costos

#### costos_tabla

| concepto | monto | moneda |
|----------|-------|--------|
| Atención médica y hospitalización | 3200000 | CLP |
| Subsidio por incapacidad laboral | 2800000 | CLP |
| Daño a equipos (andamio y arnés) | 535000 | CLP |
| Horas de investigación | 450000 | CLP |
| Capacitaciones correctivas | 680000 | CLP |
| Adquisición equipos seguridad | 1085000 | CLP |

#### responsables_investigacion

| nombre | cargo | firma |
|--------|-------|-------|
| María Fernanda Soto Contreras | Investigador Principal | M. Soto |
| Carlos Alberto Mendoza Ruiz | Jefe de Prevención de Riesgos | C. Mendoza |
| Ricardo Andrés Vásquez Moreno | Gerente de Operaciones | R. Vásquez |
| Jorge Luis Tapia Herrera | Representante Comité Paritario | J. Tapia |

---

## Resumen de Valores para Copiar/Pegar

### Textos Largos

**description / descripcion:**
```
Durante labores de mantención preventiva de estructura metálica en el Galpón de Mantención, el trabajador Juan Pérez González se encontraba realizando trabajos de pintura anticorrosiva a una altura de 4.5 metros utilizando un andamio tubular. Aproximadamente a las 10:30 horas, al intentar alcanzar una zona de difícil acceso, el trabajador perdió el equilibrio y cayó desde el andamio, impactando contra el suelo de concreto. El trabajador fue asistido inmediatamente por sus compañeros y trasladado al centro médico de la empresa.
```

**acciones_inmediatas:**
```
1. Primeros auxilios al trabajador
2. Traslado a centro médico
3. Derivación a Hospital Regional
4. Notificación a Gerencia y Prevención de Riesgos
5. Inicio de investigación preliminar
```

**controles_inmediatos:**
```
1. Acordonamiento del área del accidente
2. Suspensión temporal de trabajos en altura en el sector
3. Retiro del andamio dañado
4. Inspección de andamios restantes
```

**factores_riesgo:**
```
1. Trabajo en altura sin supervisión directa
2. Andamio sin rodapié completo
3. Punto de anclaje a distancia inadecuada
4. Exceso de confianza del trabajador
```

**justificacion_plgf:**
```
Caída desde altura de 4.5 metros con potencial de lesiones graves o fatales. El trabajador pudo haber impactado con mayor fuerza causando trauma craneoencefálico.
```

**conclusiones:**
```
El accidente fue consecuencia de una combinación de factores humanos y organizacionales. Si bien el trabajador tomó una decisión insegura al inclinarse excesivamente, las condiciones del sistema de gestión (supervisión, procedimientos, análisis de riesgos) no proporcionaron las barreras necesarias para prevenir esta situación. Las medidas correctivas abordan tanto los factores inmediatos como las causas raíz identificadas.
```

**lecciones_aprendidas:**
```
1. La experiencia previa no sustituye el cumplimiento estricto de procedimientos
2. Los trabajos en altura requieren supervisión directa y continua
3. El análisis de riesgos debe considerar específicamente la accesibilidad
4. El reposicionamiento de plataformas debe ser parte del procedimiento estándar
5. Los puntos de anclaje deben evaluarse considerando el factor de caída
```
