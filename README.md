# VetFlow — Sistema SaaS de Gestão para Clínicas Veterinárias

MVP multi-tenant com NestJS + Prisma + PostgreSQL + JWT.

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente (porta 5432)
- npm ou yarn

---

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# 3. Criar banco e rodar migrations
npm run prisma:migrate

# 4. Gerar Prisma Client
npm run prisma:generate

# 5. Popular com dados iniciais
npm run prisma:seed

# 6. Iniciar servidor
npm run start:dev
```

API disponível em: `http://localhost:3000/api/v1`

---

## Credenciais do Seed

| Role  | Email               | Senha    |
|-------|---------------------|----------|
| Admin | admin@vetflow.com   | admin123 |
| Vet   | vet@vetflow.com     | vet123   |

---

## Endpoints REST

### Auth
```
POST   /api/v1/auth/login          Login (retorna JWT)
GET    /api/v1/auth/profile        Perfil do usuário autenticado
```

**Body do login:**
```json
{
  "email": "admin@vetflow.com",
  "password": "admin123",
  "clinicId": "<uuid-da-clinica>"
}
```

**Todas as rotas protegidas requerem:**
```
Authorization: Bearer <token>
```

---

### Clinics
```
POST   /api/v1/clinics             Criar clínica (público, usado no onboarding)
GET    /api/v1/clinics             Listar clínicas [ADMIN]
GET    /api/v1/clinics/:id         Detalhar clínica
PUT    /api/v1/clinics/:id         Atualizar clínica [ADMIN]
```

### Users
```
POST   /api/v1/users               Criar usuário [ADMIN]
GET    /api/v1/users               Listar usuários [ADMIN]
GET    /api/v1/users/:id           Detalhar usuário [ADMIN]
PUT    /api/v1/users/:id           Atualizar usuário [ADMIN]
DELETE /api/v1/users/:id           Desativar usuário [ADMIN]
```

### Owners (Donos)
```
POST   /api/v1/owners              Cadastrar dono
GET    /api/v1/owners              Listar donos (?search=nome)
GET    /api/v1/owners/:id          Detalhar dono (com pets)
PUT    /api/v1/owners/:id          Atualizar dono
DELETE /api/v1/owners/:id          Remover dono
```

### Pets
```
POST   /api/v1/pets                Cadastrar pet
GET    /api/v1/pets                Listar pets (?ownerId=uuid)
GET    /api/v1/pets/:id            Detalhar pet (com histórico)
PUT    /api/v1/pets/:id            Atualizar pet
DELETE /api/v1/pets/:id            Remover pet
```

### Appointments (Agenda)
```
POST   /api/v1/appointments        Criar consulta
GET    /api/v1/appointments        Listar consultas (?status=SCHEDULED&vetId=uuid&date=2024-01-15)
GET    /api/v1/appointments/:id    Detalhar consulta
PUT    /api/v1/appointments/:id    Atualizar consulta
DELETE /api/v1/appointments/:id    Cancelar consulta
```

**Status disponíveis:** `SCHEDULED` | `COMPLETED` | `CANCELLED`

### Medical Records (Prontuários)
```
POST   /api/v1/medical-records           Criar prontuário [ADMIN, VET]
GET    /api/v1/medical-records/pet/:id   Histórico do pet
GET    /api/v1/medical-records/:id       Detalhar prontuário
PUT    /api/v1/medical-records/:id       Atualizar prontuário [ADMIN, VET]
```

### Financial (Financeiro)
```
POST   /api/v1/financial/          Registrar transação [ADMIN]
GET    /api/v1/financial/          Listar transações [ADMIN] (?type=INCOME&startDate=2024-01-01)
GET    /api/v1/financial/summary   Resumo financeiro [ADMIN] (?startDate=...&endDate=...)
GET    /api/v1/financial/:id       Detalhar transação [ADMIN]
DELETE /api/v1/financial/:id       Remover transação [ADMIN]
```

**Tipos:** `INCOME` (entrada) | `EXPENSE` (saída)

---

## Arquitetura Multi-Tenant

O isolamento entre clínicas é garantido por:

1. **JWT payload** inclui `clinicId` do usuário autenticado
2. **`@ClinicId()` decorator** extrai o `clinicId` do token em cada request
3. **Todas as queries Prisma** filtram por `clinicId` — nenhum dado vaza entre clínicas
4. **Validação no service** verifica que recursos referenciados (pet, vet, owner) pertencem à mesma clínica

---

## Estrutura de Pastas

```
vetflow/
├── prisma/
│   ├── schema.prisma          # Modelos do banco (8 entidades)
│   └── seed.ts                # Dados iniciais para desenvolvimento
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── clinic.decorator.ts    # @ClinicId(), @CurrentUser()
│   │   │   └── roles.decorator.ts     # @Roles(...)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts      # Proteção JWT
│   │   │   └── roles.guard.ts         # Controle de acesso por role
│   │   └── interceptors/
│   │       └── logging.interceptor.ts # Logs de requisições
│   ├── prisma/
│   │   ├── prisma.service.ts  # PrismaClient singleton
│   │   └── prisma.module.ts   # Módulo global
│   ├── modules/
│   │   ├── auth/              # Login + JWT Strategy
│   │   ├── users/             # Gestão de usuários
│   │   ├── clinics/           # Gestão de clínicas (tenants)
│   │   ├── owners/            # Donos de pets
│   │   ├── pets/              # Cadastro de pets
│   │   ├── appointments/      # Agenda de consultas
│   │   ├── medical-records/   # Prontuários
│   │   └── financial/         # Financeiro
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

---

## Roles e Permissões

| Recurso          | ADMIN | VET | RECEPTIONIST |
|------------------|-------|-----|--------------|
| Clínicas         | CRUD  | R   | R            |
| Usuários         | CRUD  | -   | -            |
| Donos            | CRUD  | CRUD| CRUD         |
| Pets             | CRUD  | CRUD| CRUD         |
| Consultas        | CRUD  | CRUD| CRUD         |
| Prontuários      | CRUD  | CRUD| R            |
| Financeiro       | CRUD  | -   | -            |
