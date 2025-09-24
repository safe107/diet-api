# Diet API

API para controle de dieta diária.

### 🚀 Rodando o projeto
```bash
npm install
npm run migrate
npm run dev
```

### 📌 Endpoints principais
- **POST /users** `{ name, email }` → `{ id }`
- **POST /meals** (header `x-session-id: <user-id>`) `{ name, description, datetime, is_diet }`
- **PUT /meals/:id** (header)
- **DELETE /meals/:id** (header)
- **GET /meals** (header)
- **GET /meals/:id** (header)
- **GET /meals/metrics** (header)
