# Herramio — guía de lanzamiento de la beta privada

Este documento existe para que abrir la beta sea una decisión informada y
para que, si algo sale mal, la vuelta atrás esté escrita antes de necesitarla.

## Qué está en vivo

- **129 herramientas** de productividad. Funcionan sin cuenta.
- **Cuentas**: registro, inicio de sesión, recuperación de contraseña, workspace.
- **Originalidad**: subida de PDF, DOCX y TXT; extracción, chunking, detección de
  citas y referencias, verificación bibliográfica contra Crossref, y comparación
  léxica contra los documentos anteriores del propio usuario.
- **Canal de feedback**: botón «Comentar» en el workspace y en los informes,
  y un centro de gestión en `/admin`.
- **Planes**: Gratis, Pro y Equipo con límites reales aplicados en servidor.
  **El cobro está desactivado.** Nadie puede pagar todavía.

## Qué está en beta y qué significa

Herramio lleva una marca «BETA» junto al logotipo. No es decorativa: el producto
es joven y conviene decirlo antes de que alguien lo descubra por su cuenta.

Concretamente, durante la beta:

- Los informes de originalidad pueden contener errores de interpretación.
- La cobertura de fuentes es limitada (ver abajo).
- Puede haber cambios de comportamiento entre semanas.

## Limitaciones que hay que contar a los usuarios

Estas no son advertencias legales de relleno. Son los límites reales del motor y
callarlos sería vender algo que no existe.

**El corpus de comparación es interno.** Un documento se compara contra los
documentos anteriores del propio usuario (y los de su equipo, si aplica).
**No se compara contra internet ni contra bases de datos académicas.** Una
similitud del 0 % significa «no coincide con lo que hemos podido comparar», no
«es original».

**El análisis semántico está desactivado en producción.** El motor existe, está
medido y funciona en Preview, pero producción corre solo el motor léxico. Por eso
el informe dice «Similitud semántica: No disponible» en vez de «0 %». La
consecuencia práctica: **una paráfrasis bien hecha no se detecta hoy.**

**La verificación de referencias es conservadora.** Crossref indexa bien los
artículos de revista y mal los libros, tesis y literatura gris. Que una
referencia aparezca como «No encontrada» **no significa que sea falsa**, y el
informe lo dice explícitamente.

**No hay detección de texto generado por IA.** No se afirma porque no es una
afirmación demostrable.

**El índice de similitud no es un veredicto.** Incluye citas correctamente
atribuidas, frases hechas y coincidencias accidentales. Requiere lectura humana.

## Lo que NUNCA debe afirmarse

- «100 % de precisión»
- «Detecta todo el plagio»
- «Mejor que Turnitin»
- «Detecta con certeza si lo escribió una IA»
- Que un documento «es plagio»

El producto mide **similitud** y presenta **evidencia**. Quien concluye es una
persona.

## Guion de prueba para el grupo beta (5–15 personas)

1. Entrar en herramio.com y usar una herramienta sin registrarse.
2. Crear una cuenta.
3. Iniciar sesión.
4. Usar una herramienta y marcarla como favorita.
5. Ir a Originalidad y subir un documento propio (PDF, DOCX o TXT).
6. Esperar el informe y leerlo entero.
7. Enviar un comentario con el botón «Comentar», sobre todo si algo no se
   entiende.
8. Volver al día siguiente y comprobar que el informe sigue ahí.

Lo que más interesa aprender: **qué no se entiende**. Un informe que se lee mal
es un problema mayor que un informe que tarda.

## Soporte

El botón «Comentar» es el canal. Llega a `/admin` → «Feedback de la beta», con la
página desde la que se escribió. No se envía el contenido de los documentos.

## Dependencias externas

| Servicio | Uso | Si se cae |
|---|---|---|
| Supabase | base de datos, auth, storage | el producto no funciona |
| Vercel | hosting | el producto no funciona |
| Crossref | verificación de referencias | las referencias quedan «sin verificar»; el resto del informe se genera |
| OpenAI | embeddings | **no configurado en producción** |
| OpenAlex | fuentes académicas | **opt-in, desactivado** |

Las tres primeras son duras. Las dos últimas están diseñadas para degradar: si
fallan, el informe se genera igual y dice que esa parte no estuvo disponible.

## Vuelta atrás de emergencia

**Revertir un despliegue.** El repositorio despliega desde `master`. Para volver
a la versión anterior:

```bash
vercel rollback
```

O `git revert <commit>` y push, que es más lento pero deja rastro.

**Apagar el análisis semántico** (si se activa y da problemas): eliminar
`EMBEDDING_PROVIDER` del entorno de producción y redesplegar. El motor léxico
sigue funcionando y el informe dirá «No disponible».

**Apagar la búsqueda académica**: eliminar `ORIGINALITY_ACADEMIC_SEARCH`.

**Cerrar el acceso a `/admin`**: eliminar `ADMIN_EMAILS`. La ruta pasa a
devolver 404 para todos.

Ninguna de estas tres apaga el producto: están construidas para que quitarlas
degrade la funcionalidad, no la rompa.

## Variables de entorno en producción

| Variable | Estado |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | configurada |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | configurada |
| `SUPABASE_SERVICE_ROLE_KEY` | configurada |
| `NEXT_PUBLIC_SITE_URL` | configurada |
| `ADMIN_EMAILS` | configurada |
| `OPENAI_API_KEY` | **no configurada** (semántico apagado) |
| `EMBEDDING_PROVIDER` | **no configurada** |
| `ORIGINALITY_ACADEMIC_SEARCH` | **no configurada** (OpenAlex apagado) |
| Mercado Pago | **fuera de alcance** hasta después de la beta |

Cualquier variable nueva necesita un redespliegue para entrar: Vercel las inyecta
en build, no en caliente.

## Antes de abrir

- [x] `/admin` accesible para el propietario, verificado en producción
- [x] Canal de feedback verificado extremo a extremo en producción
- [x] Originalidad verificada en producción con PDF, DOCX y TXT
- [x] Aislamiento entre usuarios verificado contra la base de datos real
- [ ] **Backups de Supabase verificados** — Settings → Database → Backups / PITR.
      Requiere acción manual; no es consultable por API.
