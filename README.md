# Tienda Online (Next.js + Prisma + SQLite)

## Requisitos

- Node.js (recomendado LTS)
- npm

## Instalación

```bash
npm install
```

## Configuración de la base de datos (SQLite)

1) Copiá el archivo de ejemplo y creá tu `.env`:

```bash
copy .env.example .env
```

2) Generá el cliente de Prisma:

```bash
npx prisma generate
```

3) Creá la base de datos y aplicá migraciones:

```bash
npx prisma migrate dev
```

Opcional: abrir Prisma Studio

```bash
npx prisma studio
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abrí http://localhost:3000

## Ejecutar en producción

```bash
npm run build
npm start
```

## Notas

- La DB local es `dev.db` (no se sube a GitHub).
- Las imágenes subidas se guardan en `public/uploads` (tampoco se suben a GitHub).
