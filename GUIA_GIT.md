# Guía Rápida de Git para Market Online 🚀

Aquí tienes los "hechizos" mágicos para guardar y subir tu código.

## 1. Revisar qué cambió 🕵️‍♂️

Antes de nada, mira qué archivos tocaste:

```bash
git status
```

_(Si sale todo en rojo, son cambios sin preparar)._

## 2. Preparar los cambios (ADD) 📦

Mete todos los archivos modificados a la "caja" de envío:

```bash
git add .
```

_(El punto `.` significa "todo")._

## 3. Guardar la versión (COMMIT) 📸

Cierra la caja y ponle una etiqueta con lo que hiciste:

```bash
git commit -m "descripción de lo que hice"
```

_Ejemplo: `git commit -m "feat: agregué subida de fotos"`_

## 4. Subir a GitHub (PUSH) ☁️

Envía la caja a la nube:

```bash
git push -f origin main
```

_(A veces puede pedir tu contraseña o token)._

---

### 🆘 ¿Problemas Comunes?

- **Error "fetch first"**: Alguien (o tú desde otro PC) subió cambios que no tienes.
  Solución: `git pull origin main` (bajar cambios) o `git push -f origin main` (forzar subida "peligroso").
- **Error "Permission denied"**: Tu usuario no tiene permiso en ese repositorio.

---

🚀 **Resumen Ninja:**
`git add .` -> `git commit -m "fix: algo"` -> `git push origin main`
