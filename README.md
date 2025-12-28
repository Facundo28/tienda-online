# Market Online - Plataforma E-commerce 🛒

Plataforma de comercio electrónico moderna, segura y escalable construida con Next.js 15, Prisma y Tailwind CSS.

> **Estado del Proyecto**: 🚀 Versión 1.0 "Rebranding & Security Update"

## � Resumen de Cambios Recientes

Hemos realizado una transformación completa de la plataforma enfocada en 3 pilares: **Identidad**, **Seguridad** y **Administración**.

### 1. Rebranding Visual (Adiós "Tienda Genérica")

- **Nueva Identidad**: Nombre oficial "Market Online" con estética verde profesional (`#12753e`).
- **Home Page**: Banner principal inmersivo y eliminación de botones redundantes.
- **UI de Usuario**: Insignias de verificación en menús y perfiles.

### 2. Seguridad Robusta 🛡️

- **Verificación en 2 Pasos (2FA)**:
  - Soporte para **Authenticator App** (Google/Microsoft Auth).
  - Soporte para **Email OTP** y **SMS** (simulado para dev).
  - Panel de seguridad para configurar estos métodos en `/account/security`.
- **Gestión de Sesiones**: Hash seguro de contraseñas y validación estricta de roles.

### 3. Panel de Administración 👑

- Ubicación: `/admin/users`
- **Poderes de Admin**:
  - **Editar Perfiles Completos**: Cambiar nombre, email, rol y teléfono de cualquier usuario.
  - **Control Policial**: Activar o desactivar la **Insignia de Verificado** o banear usuarios (`isActive`).
  - **Rescate de Cuentas**: Resetear contraseñas manualmente y desactivar 2FA si el usuario pierde acceso.

### 4. Panel de Vendedor y Logística 📦

- **Dashboard Separado**: `/vender` ahora es exclusivo para vendedores, separado del admin del sitio.
- **Logística QR**: Nuevo escáner en `/scan` (público/autenticado) para transportistas, con soporte para entrada manual de códigos.

---

## 🛠️ Instalación y Puesta en Marcha

### Prerrequisitos

- **Node.js**: Versión 18 o superior.
- **Git**: Para control de versiones.

### Pasos

1.  **Instalar dependencias**:

    ```bash
    npm install
    ```

2.  **Configurar Base de Datos**:

    ```bash
    # Genera el cliente de Prisma
    npx prisma generate

    # Sincroniza la base de datos (SQLite por defecto)
    npx prisma db push
    ```

3.  **Iniciar Servidor**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## 🔑 Credenciales por Defecto (Desarrollo)

Si usas la base de datos de prueba, puedes crear un usuario y promoverlo a ADMIN editando la base de datos con `npx prisma studio` o usando el flujo de registro.

## Solución de Problemas Comunes

- **Error de 2FA**: Si te quedas bloqueado con el 2FA, entra como otro Admin y desactívalo desde el panel de usuarios.
- **Error de Permisos Git**: Si no puedes subir cambios (`403 Forbidden`), verifica que tu usuario de git tenga permisos de escritura en el repositorio remoto.

---

Desarrollado para **Market Online**.
