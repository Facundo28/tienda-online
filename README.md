# Changelog - Market Online

## Resumen del Desarrollo

Este documento detalla todas las funcionalidades implementadas durante el desarrollo de Market Online, una plataforma de e-commerce con sistema de logistica integrado.

---

## Funcionalidades Principales Implementadas

### Sistema de Autenticacion y Seguridad

- Autenticacion Completa: Sistema de login/registro con bcrypt para hash de contraseñas
- Verificacion de Identidad (KYC):
  - Verificacion por DNI
  - Carga de foto frontal del documento
  - Escaneo y validacion de documentos
  - Bloqueo de funciones criticas para usuarios no verificados
- Autenticacion de Dos Factores (2FA):
  - Soporte para aplicaciones TOTP
  - Codigos OTP por email
  - Codigos OTP por SMS
- Gestion de Sesiones: Sistema robusto de sesiones con tokens

### Sistema de Roles y Permisos

- ADMIN: Control total de la plataforma
- USER: Usuario estandar (comprador/vendedor)
- DRIVER: Repartidor/conductor
- LOGISTICS_ADMIN: Administrador de empresa logistica

### E-Commerce Core

#### Productos

- Publicacion de Productos:
  - Formulario avanzado con vista previa
  - Soporte para hasta 5 imagenes por producto
  - Categorizacion completa
  - Sistema de stock
  - Condicion (Nuevo/Usado)
  - Feature "Boost" para destacar productos
- Gestion de Productos:
  - Pausar/Reactivar publicaciones
  - Edicion completa
  - Eliminacion (soft delete)
  - Grid responsive estilo Mercado Libre (5 columnas)

#### Carrito y Checkout

- Carrito de Compras: Sistema completo con persistencia
- Proceso de Checkout: Flujo optimizado con validacion de usuario verificado
- Gestion de Ordenes: Tracking completo del estado de pedidos

#### Sistema de Favoritos

- Favoritos: Los usuarios pueden marcar productos como favoritos
- Gestion: Ver y administrar lista de favoritos

#### Reviews y Reputacion

- Sistema de Reviews: Calificaciones y comentarios en productos
- Sistema de Reputacion: Niveles de reputacion para vendedores (Naranja, Amarillo, Verde, etc.)

### Sistema de Logistica Avanzado

#### Para Empresas Logisticas (LOGISTICS_ADMIN)

- Dashboard Premium:
  - Estadisticas en tiempo real
  - Grafico de ingresos
  - Mapa de flota en vivo
  - Centro de alertas (ordenes pendientes >30min, en camino >45min)
- Gestion de Flota:
  - Crear/editar/eliminar conductores
  - Asignar vehiculos (tipo, patente, modelo, color)
  - Ver ubicacion en tiempo real
  - Gestion de ordenes sin asignar
- Configuracion de Empresa:
  - Datos de la empresa (CUIT, direccion, contacto)
  - Estado de verificacion

#### Para Conductores (DRIVER)

- Dashboard del Conductor:
  - Estadisticas personales
  - Grafico de ganancias semanales
  - Sistema de gamificacion (niveles y XP)
  - Timeline de entregas del dia
- Gestion de Entregas:
  - Ver ordenes disponibles
  - "Mi Mochila" - ordenes asignadas
  - Actualizar estado de entregas
  - Captura de ubicacion GPS
  - Subida de foto de comprobante
- Perfil del Conductor:
  - Informacion del vehiculo
  - Estadisticas de rendimiento

#### Sistema de Seguridad en Entregas

- Palabras de Seguridad: 3 palabras aleatorias generadas por pedido
- Escaneo QR: Validacion de entrega mediante codigo QR
- Geolocalizacion: Captura de ubicacion en entrega
- Comprobante Fotografico: Evidencia de entrega exitosa
- API de Escaneo Inteligente: /api/scan con logica de redireccion segun rol

### Panel de Administracion (God Mode)

#### Gestion de Usuarios

- Vista Detallada de Usuarios:
  - Edicion completa de perfiles
  - Gestion de roles
  - Reset de 2FA
  - Ver historial de compras/ventas
  - Ver productos publicados
  - Gestion de documentos KYC
  - Control de membresia premium
- Acciones Administrativas:
  - Banear/Desbanear usuarios
  - Forzar verificacion
  - Editar cualquier campo

#### Gestion de Productos

- Vista God Mode de Productos:
  - Ver TODOS los productos (sin filtro de propietario)
  - Edicion completa
  - Eliminacion sin restricciones
  - Vista de 3 columnas: Edicion | Estadisticas | Ordenes

#### Gestion de Ordenes

- Vista Premium de Ordenes:
  - Tabla con informacion completa
  - Filtros avanzados
  - Forzar cambio de estado
  - Vista detallada con 3 columnas: Items | Partes | Acciones
  - Links directos a God Mode de usuarios involucrados

#### Gestion de Empresas Logisticas

- Control Total de Empresas:
  - Ver/editar informacion de empresa
  - Gestionar propietario
  - Gestionar trabajadores
  - Ver estadisticas
  - Verificar/Desverificar empresas

#### Audit Log

- Registro de Auditoria: Todas las acciones administrativas quedan registradas con:
  - Ejecutor de la accion
  - Tipo de accion
  - Entidad afectada
  - Metadata (antes/despues)
  - IP y User Agent

### Sistema de Membresia Premium

#### Ads Manager (Solo Admin)

- Gestion de Banners Publicitarios:
  - CRUD completo de banners
  - Control de posicion (HOME_MAIN, etc.)
  - Estado activo/inactivo
  - Carrusel responsive en homepage

#### Perfil Premium de Vendedor

- Personalizacion de Perfil:
  - Banner personalizado (con cropper 4:1)
  - Links a redes sociales (Instagram, Facebook, Website)
  - Indicador visual de membresia premium
- Control de Membresia:
  - Administradores pueden otorgar/extender membresias
  - Fecha de expiracion
  - Pagina /account/premium para gestion

### Funcionalidades de UI/UX

#### Componentes Avanzados

- Image Cropper: Recorte de imagenes con zoom para:
  - Fotos de perfil (circular)
  - Banners (4:1)
  - Documentos
- QR Code Generator: Generacion de codigos QR para ordenes
- QR Scanner: Escaner de codigos QR para validacion
- Mapas Interactivos: Leaflet para visualizacion de ubicaciones
- Graficos: Recharts para estadisticas y analytics

#### Diseño y Estetica

- Estetica Mercado Libre: Grid de 5 columnas, tarjetas blancas limpias
- Tema Verde: Paleta de colores verde (#12753e) como color principal
- Responsive Design: Breakpoints optimizados para movil/tablet/desktop
- Glassmorphism: Efectos modernos en dashboards
- Animaciones: Framer Motion para transiciones suaves

#### Header y Navegacion

- Header Rediseñado: Estilo Mercado Libre
- UserMenu Mejorado:
  - Indicadores de rol
  - Badge de verificacion
  - Links contextuales segun rol
  - Acceso rapido a funciones premium
- Sistema de Notificaciones: Campana interactiva con contador

#### Footer y Paginas Legales

- Footer Completo:
  - Links de contacto
  - Redes sociales
  - Copyright
  - Links legales
- Paginas Implementadas:
  - /terms - Terminos y Condiciones
  - /privacy - Politica de Privacidad
  - /contact - Contacto
  - /faq - Preguntas Frecuentes
  - /partner-request - Solicitud de Partner Logistico

### Paginas de Usuario

- Perfil Publico (/users/[id]):
  - Vista compacta y profesional
  - Banner premium (si aplica)
  - Redes sociales (si aplica)
  - Productos del vendedor
  - Indicador de verificacion
- Mi Cuenta (/account):
  - Datos personales
  - Seguridad (2FA, cambio de contraseña)
  - Documentos KYC
  - Direcciones
  - Perfil premium (si aplica)
- Mis Compras (/orders):
  - Historial de ordenes
  - Tracking de estado
  - Detalles de entrega
- Vender (/vender):
  - Mis publicaciones
  - Crear nuevo producto
  - Pausar/Eliminar productos

---

## Tecnologias y Librerias Utilizadas

### Core Framework

- Next.js 16.1.1: Framework React con Turbopack
- React 19.2.3: Biblioteca de UI
- TypeScript 5: Tipado estatico

### Base de Datos

- Prisma 7.2.0: ORM
- Better SQLite3 12.5.0: Base de datos SQLite
- @prisma/adapter-better-sqlite3 7.2.0: Adaptador Prisma-SQLite

### Autenticacion y Seguridad

- bcryptjs 3.0.3: Hash de contraseñas
- otplib 12.0.1: Generacion de codigos TOTP/OTP

### UI y Componentes

- Tailwind CSS 4: Framework de estilos
- Lucide React 0.562.0: Iconos
- Framer Motion 12.23.26: Animaciones
- clsx 2.1.1: Utilidad para clases CSS
- tailwind-merge 3.4.0: Merge de clases Tailwind
- sonner 2.0.7: Notificaciones toast

### Funcionalidades Especificas

- react-easy-crop 5.5.6: Recorte de imagenes
- qrcode 1.5.4: Generacion de codigos QR
- react-qr-code 2.0.18: Componente QR para React
- react-qr-reader 3.0.0-beta-1: Escaner de QR
- leaflet 1.9.4: Mapas interactivos
- react-leaflet 5.0.0: Wrapper de Leaflet para React
- recharts 3.6.0: Graficos y charts
- @react-pdf/renderer 4.3.1: Generacion de PDFs
- date-fns 4.1.0: Manipulacion de fechas

### DevDependencies

- @tailwindcss/postcss 4: PostCSS para Tailwind
- @types/\* : Tipos TypeScript para librerias
- dotenv 16.4.7: Variables de entorno
- eslint 9: Linter
- eslint-config-next 16.1.1: Configuracion ESLint para Next.js

---

## Instalacion de Dependencias

Para instalar todas las librerias utilizadas en el proyecto, ejecuta:

```bash
npm install --legacy-peer-deps
```

### Instalacion Individual (si es necesario)

```bash
# Core
npm install --legacy-peer-deps next@16.1.1 react@19.2.3 react-dom@19.2.3 typescript@5

# Database
npm install --legacy-peer-deps prisma@7.2.0 @prisma/client@7.2.0 @prisma/adapter-better-sqlite3@7.2.0 better-sqlite3@12.5.0

# Auth & Security
npm install --legacy-peer-deps bcryptjs@3.0.3 otplib@12.0.1 @types/bcryptjs@2.4.6

# UI & Styling
npm install --legacy-peer-deps tailwindcss@4 @tailwindcss/postcss@4 lucide-react@0.562.0 framer-motion@12.23.26 clsx@2.1.1 tailwind-merge@3.4.0 sonner@2.0.7

# Features
npm install --legacy-peer-deps react-easy-crop@5.5.6 qrcode@1.5.4 react-qr-code@2.0.18 react-qr-reader@3.0.0-beta-1 leaflet@1.9.4 react-leaflet@5.0.0 recharts@3.6.0 @react-pdf/renderer@4.3.1 date-fns@4.1.0

# Types
npm install --legacy-peer-deps --save-dev @types/node@20 @types/react@19 @types/react-dom@19 @types/better-sqlite3@7.6.13 @types/leaflet@1.9.21 @types/qrcode@1.5.6 @types/react-qr-reader@2.1.7

# Dev Tools
npm install --legacy-peer-deps --save-dev dotenv@16.4.7 eslint@9 eslint-config-next@16.1.1
```

---

## Cuentas de Prueba

El sistema incluye 4 cuentas de demostracion con diferentes roles:

### 1. Super Administrador

- Email: admin@market.com
- Contraseña: admin
- Rol: ADMIN
- Permisos: Control total de la plataforma
- Caracteristicas:
  - Acceso a God Mode
  - Gestion de usuarios, productos, ordenes
  - Control de empresas logisticas
  - Gestion de banners publicitarios
  - Membresia premium permanente

### 2. Usuario Normal

- Email: user@market.com
- Contraseña: admin
- Rol: USER
- Permisos: Comprar y vender productos
- Caracteristicas:
  - Publicar productos
  - Realizar compras
  - Gestionar favoritos
  - Dejar reviews

### 3. Conductor/Repartidor

- Email: driver@market.com
- Contraseña: admin
- Rol: DRIVER
- Permisos: Gestionar entregas
- Caracteristicas:
  - Dashboard de conductor
  - Ver ordenes disponibles
  - Gestionar entregas asignadas
  - Actualizar estados
  - Vinculado a "Logistica Veloz S.A."

### 4. Empresa Logistica

- Email: empresa@market.com
- Contraseña: admin
- Rol: LOGISTICS_ADMIN
- Permisos: Administrar empresa de logistica
- Caracteristicas:
  - Dashboard de empresa
  - Gestionar conductores
  - Asignar ordenes
  - Ver estadisticas
  - Mapa de flota
  - Membresia premium permanente
  - Empresa: "Logistica Veloz S.A."

---

## Como Iniciar el Proyecto

1. Instalar dependencias:

   ```bash
   npm install --legacy-peer-deps
   ```

2. Configurar base de datos:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. Poblar base de datos (opcional):

   - Inicia el servidor: npm run dev
   - Visita: http://localhost:3000/api/seed
   - Esto creara las 4 cuentas de prueba

4. Iniciar servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Acceder a la aplicacion:
   - Abre tu navegador en http://localhost:3000
   - Inicia sesion con cualquiera de las cuentas de prueba

---

## Bugs Conocidos y Pendientes

- Algunos ajustes menores de responsive en moviles
- Optimizacion de carga de imagenes
- Implementacion de storage en la nube para produccion (actualmente local)
- Completar sistema de notificaciones en tiempo real
- Mejorar sistema de busqueda y filtros

---

## Notas Adicionales

- Verificacion KYC: Los usuarios deben estar verificados para realizar compras o gestionar logistica
- Membresia Premium: Solo administradores pueden otorgar membresias premium
- Seguridad: Todas las contraseñas estan hasheadas con bcrypt (12 rounds)
- Base de Datos: SQLite para desarrollo, facilmente migrable a PostgreSQL/MySQL para produccion
- Responsive: Toda la interfaz esta optimizada para movil, tablet y desktop

---

Desarrollado con Next.js, Prisma y Tailwind CSS

---

# Agregados y Mejoras Recientes

## Seguridad

- Se integro Middleware de seguridad.
- Se agrego 2FA real por Email y SMS.
- Se implemento bloqueo en el Login.

## Experiencia (UX)

- Se habilito la edicion de email.
- Se repararon enlaces del footer.
- Se limpio el codigo de textos simulados.

## Nuevas Librerias

- nodemailer
- twilio
- otplib
