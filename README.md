# 🏦 Bank System - API de Gestión Bancaria

API RESTful para la gestión administrativa de cuentas bancarias, transacciones, tarjetas y control de deudas para la plataforma **Bank System**.

---

## 📝 Descripción

Servicio backend que proporciona endpoints para que los administradores gestionen usuarios, controlen saldos de cuentas, procesen transacciones financieras y administren tarjetas de crédito/débito.

Incluye un sistema de autenticación simplificado para validar accesos administrativos.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+ (ESM)  
- **Framework:** Express 4.x  
- **Base de Datos:** MongoDB 6.0+  
- **ODM:** Mongoose 8.x  
- **Validación:** express-validator  
- **Storage:** Cloudinary (imágenes de tarjetas)  
- **Seguridad:** Helmet, CORS, Rate Limiting  

---

## 🚀 Instalación

```bash
# Desde la raíz del proyecto
pnpm install

# Instalar dependencias específicas
pnpm install express mongoose dotenv cors morgan helmet express-validator cloudinary multer-storage-cloudinary
```

---

## ⚙️ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```env
# Server
NODE_ENV=development
PORT=3001

# MongoDB
URI_MONGODB=mongodb://localhost:27017/bank_system

# Cloudinary (upload de imágenes de tarjetas)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_FOLDER=bank_system/cards
```

---

## 📂 Estructura del Proyecto

```
bank_system/
├── configs/            # Configuración principal (App, DB, CORS)
├── src/                # Código fuente de la API
│   ├── Auth/           # Registro y Login
│   ├── User/           # Gestión de Usuarios
│   ├── Account/        # Cuentas Bancarias
│   ├── Card/           # Tarjetas de Crédito/Débito
│   ├── Transaction/    # Historial de movimientos
│   └── Debt/           # Control de Deudas
├── middlewares/        # Validadores y manejadores de errores
└── index.js            # Punto de entrada de la aplicación
```

---

# 🔌 Endpoints Principales

---

## 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|------------|
| POST | `/bankSystem/v1/auth/register` | Registrar nuevo usuario (Admin/User) |
| POST | `/bankSystem/v1/auth/login` | Iniciar sesión (Simple Auth) |

---

## 👤 Usuarios

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/bankSystem/v1/users` | Listar todos los usuarios |
| GET | `/bankSystem/v1/users/:id` | Obtener detalle de un usuario |
| PUT | `/bankSystem/v1/users/:id` | Actualizar datos de usuario |
| PUT | `/bankSystem/v1/users/:id/status` | Activar o Desactivar usuario |

---

## 🏦 Cuentas Bancarias

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/bankSystem/v1/accounts` | Listar cuentas con datos del dueño |
| POST | `/bankSystem/v1/accounts` | Crear cuenta (Ahorro/Monetaria) |

---

## 💳 Tarjetas

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/bankSystem/v1/cards` | Listar tarjetas activas |
| POST | `/bankSystem/v1/cards` | Crear tarjeta (Imagen o Link) |
| PUT | `/bankSystem/v1/cards/:id` | Actualizar tarjeta |
| PUT | `/bankSystem/v1/cards/:id/activate` | Activar tarjeta |
| PUT | `/bankSystem/v1/cards/:id/desactivate` | Bloquear tarjeta por seguridad |

---

## 💸 Transacciones

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/bankSystem/v1/transactions` | Ver historial de transacciones |
| GET | `/bankSystem/v1/transactions/:id` | Detalle de una transacción |
| POST | `/bankSystem/v1/transactions` | Realizar Transferencia o Depósito |

---

## 📉 Deudas (Control de Créditos)

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/bankSystem/v1/debt` | Listar deudas (Filtros disponibles) |
| POST | `/bankSystem/v1/debt` | Registrar deuda entre usuarios |
| PATCH | `/bankSystem/v1/debt/:id/payment` | Abonar o pagar deuda |

---

## 🧾 Pagos de Servicios

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/bankSystem/v1/payment` | Historial de pagos de servicios |
| POST | `/bankSystem/v1/payment` | Realizar pago desde cuenta |

---

# 📊 Ejemplos de Petición (JSON)

Aquí encontrarás los cuerpos JSON (Body) necesarios para probar cada entidad en Postman.

---

## 🔐 1. Auth (Registro y Login)

### Registrar Nuevo Usuario

**POST**  
`http://localhost:3001/bankSystem/v1/auth/register`

```json
{
  "UserName": "Kevin",
  "UserSurname": "Velasquez",
  "UserDPI": "1000000000001",
  "UserEmail": "kevin@kinal.edu.gt",
  "UserPassword": "password123",
  "UserRol": "ADMIN"
}
```

---

### Iniciar Sesión

**POST**  
`http://localhost:3001/bankSystem/v1/auth/login`

```json
{
  "UserEmail": "kevin@kinal.edu.gt",
  "UserPassword": "password123"
}
```

---

## 👤 2. Usuario (Gestión)

### Actualizar Perfil

**PUT**  
`http://localhost:3001/bankSystem/v1/users/ID_DEL_USUARIO`

```json
{
  "UserName": "Kevin Alejandro",
  "UserSurname": "Velasquez",
  "UserEmail": "nuevo_correo@kinal.edu.gt"
}
```

---

## 🏦 3. Cuenta Bancaria

### Crear Cuenta

**POST**  
`http://localhost:3001/bankSystem/v1/accounts`

```json
{
  "accountNumber": "1112223334",
  "accountType": "AHORRO",
  "balance": 1500.00,
  "user": "ID_DEL_USUARIO_PROPIETARIO"
}
```

---

## 💳 4. Tarjeta

### Crear Tarjeta (Con Link de Imagen)

**POST**  
`http://localhost:3001/bankSystem/v1/cards`

```json
{
  "cardNumber": "4500123412341234",
  "holderName": "KEVIN VELASQUEZ",
  "expirationDate": "12/28",
  "cvv": "999",
  "brand": "VISA",
  "account": "ID_DE_LA_CUENTA_BANCARIA",
  "image": "https://cdn-icons-png.flaticon.com/512/10542/10542523.png"
}
```

---

## 💸 5. Transacción

### Realizar Transferencia

**POST**  
`http://localhost:3001/bankSystem/v1/transactions`

```json
{
  "AccountOriginId": "ID_CUENTA_ORIGEN",
  "AccountDestinyId": "ID_CUENTA_DESTINO",
  "Amount": 250.00,
  "Type": "Transferencia",
  "Description": "Pago de almuerzo"
}
```

---

## 📉 6. Deuda

### Registrar Nueva Deuda

**POST**  
`http://localhost:3001/bankSystem/v1/debt`

```json
{
  "title": "Préstamo Personal",
  "debtorId": "ID_DEL_USUARIO_DEUDOR",
  "creditorId": "ID_DEL_USUARIO_ACREEDOR",
  "totalAmount": 500.00,
  "dueDate": "2026-12-31"
}
```

---

### Abonar a Deuda

**PATCH**  
`http://localhost:3001/bankSystem/v1/debt/ID_DEUDA/payment`

```json
{
  "amount": 100.00
}
```

---

## 🧾 7. Pago de Servicios

### Realizar Pago

**POST**  
`http://localhost:3001/bankSystem/v1/payment`

```json
{
  "amount": 75.50,
  "description": "Pago de Internet Residencial",
  "account": "ID_DE_LA_CUENTA_PAGADORA"
}
```


---

# 🗄️ Modelos de Base de Datos (Esquemas)

---

## 👤 Usuario (User)

Representa a los clientes y administradores del banco.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| UserName | String | ✅ | Nombre del usuario (Máx 100 caracteres) |
| UserSurname | String | ✅ | Apellido del usuario (Máx 100 caracteres) |
| UserDPI | String | ✅ | Documento Personal de Identificación (Único) |
| UserEmail | String | ✅ | Correo electrónico para acceso (Único) |
| UserPassword | String | ✅ | Contraseña en texto plano |
| UserRol | String | ✅ | ROL: ['ADMIN', 'USER'] |
| UserStatus | String | ❌ | Estado de la cuenta (Default: 'ACTIVE') |

---

## 💳 Cuenta Bancaria (Account)

Maneja los fondos y el tipo de cuenta vinculada a un usuario.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| accountNumber | String | ✅ | Número de 10 dígitos (Único) |
| accountType | String | ✅ | Tipo: ['AHORRO', 'MONETARIA'] |
| balance | Number | ❌ | Saldo disponible (Mínimo: 0) |
| user | ObjectId | ✅ | Referencia al modelo User |
| status | Boolean | ❌ | true activa / false desactivada |

---

## 🪪 Tarjeta (Card)

Gestión de plásticos físicos o virtuales asociados a servicios.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| cardNumber | String | ✅ | 16 dígitos únicos |
| holderName | String | ✅ | Nombre que aparece en la tarjeta |
| expirationDate | String | ✅ | Formato MM/YY |
| brand | String | ✅ | Marca: ['VISA', 'MASTERCARD', 'AMEX'] |
| type | String | ❌ | ['DEBIT', 'CREDIT'] |
| image | String | ❌ | URL de imagen gestionada en Cloudinary |

---

## 💸 Transacción (Transaction)

Registro histórico de movimientos financieros.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| AccountOriginId | Number | ✅ | ID de la cuenta que envía |
| AccountDestinyId | Number | ✅ | ID de la cuenta que recibe |
| Amount | Number | ✅ | Monto de la operación (Mín: 0.01) |
| Type | String | ✅ | ['Transferencia', 'Deposito'] |
| Description | String | ✅ | Motivo del movimiento |

---

## 📉 Deuda (Debt)

Control de créditos y pagos pendientes.

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|------------|
| title | String | ✅ | Nombre de la deuda o préstamo |
| debtorId | Number | ✅ | Referencia al usuario deudor |
| totalAmount | Number | ✅ | Monto total de la deuda |
| remainingAmount | Number | ❌ | Saldo pendiente por pagar |
| status | String | ❌ | ['Pendiente', 'Parcial', 'Pagado', 'Vencido'] |

---

# 🛠️ Scripts Disponibles

```bash
# Iniciar el servidor en modo desarrollo con nodemon
pnpm run dev

# Iniciar el servidor de forma normal
pnpm start
```


