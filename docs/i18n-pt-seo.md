# Guía de Internacionalización (i18n) y SEO para Ruralpop (Portugal)

## Arquitectura (Opción B: Middleware Translation Rewrites)

Ruralpop utiliza un enfoque de internacionalización basado en un **Middleware Rewrite** para minimizar el impacto estructural en la base de código.

1.  **Español (Idioma por defecto):** Servido desde la raíz `/`. Mantiene todas las URLs y SEO actual intacto. No requiere prefijo `/es/`.
2.  **Portugués (pt-PT):** Servido bajo el prefijo `/pt/`.

El Middleware en `src/middleware.ts` intercepta todas las peticiones a `/pt/*`, elimina el prefijo, traduce el slug (usando `src/i18n/config.ts`) a su equivalente en español, e inyecta los *headers* `x-locale` y `x-original-pathname`.
A continuación, realiza un **rewrite interno** (no una redirección 301) hacia el Server Component existente (ej. `src/app/[slug]/page.tsx`).

Los Server Components (como `RootLayout` y páginas dinámicas) leen estos *headers* para proveer la localización correcta en el HTML, metadatos, y contenido.

---

## Fases Desplegadas y Estado

### ✅ Fase 1: Arquitectura
- `x-locale` inyectado vía Middleware.
- Traductor de rutas en `src/i18n/utils.ts`.

### ✅ Fase 2: Traducciones Base
- Diccionarios `/src/i18n/es.json` y `/src/i18n/pt.json` creados (Tratores, Pecuária, etc.).

### ✅ Fase 3 y 4: Rutas Iniciales y SEO Técnico
- Lista controlada de rutas (`ptIndexableRoutes`).
- Canonical siempre *self-referenced*.
- Etiquetas `hreflang` bidireccionales dinámicas inyectadas desde Next.js `generateMetadata`.
- **Regla Crítica:** Cualquier petición a `/pt/` que no esté en `ptIndexableRoutes` recibe automáticamente `<meta name="robots" content="noindex, follow" />`.

### ✅ Fase 5 y 6: Sitemap
- `/sitemapindex-pt.xml` creado y apuntando a `/sitemap-pt.xml`.
- `/sitemap-pt.xml` extrae de `ptIndexableRoutes` y genera entradas con `hreflang`.

---

## 📋 Checklist de Calidad SEO (No dar por terminada la tarea si falla algo de esto)

- [ ] **Verificar Canonical:** `/pt/tratores-usados` DEBE apuntar a `<link rel="canonical" href="https://www.ruralpop.com/pt/tratores-usados" />`. Nunca debe apuntar a la versión en español.
- [ ] **Verificar Hreflang:** La página española y portuguesa deben tener ambos `<link rel="alternate" hreflang="es-ES" href="..." />` y `<link rel="alternate" hreflang="pt-PT" href="..." />`.
- [ ] **Verificar Sitemap:** Entrar en `/sitemap-pt.xml` y asegurar que sólo hay rutas listadas en la *whitelist*. No debe haber ninguna URL extraña.
- [ ] **Verificar Indexación Segura:** Acceder a una ruta en portugués que NO esté en la lista, por ejemplo `/pt/contacto`. Inspeccionar el `<head>` y verificar que tiene `<meta name="robots" content="noindex, follow" />`.
- [ ] **Verificar Arquitectura de Rutas:** Asegurar que si accedes a `/pt/tratores-usados`, el navegador MANTIENE esa URL y la página carga sin redirecciones visibles hacia `/tractores-usados`.
- [ ] **Verificar Search Console:** Comprobar informes de cobertura asegurando que Google reconoce los `hreflang` sin reportar errores de canonical.

---

## 🛠 Script de Auditoría

Se ha creado un script automatizado para verificar todos estos puntos clave a nivel HTTP y HTML.

### Ejecución
```bash
node scripts/audit-i18n.mjs
```
*Se recomienda ejecutar en local antes de cada subida a producción, o añadirlo como pipeline de CI.*
