# 🚀 DIDSECPLUS Api

A modern Node.js application built with TypeScript for improved type safety, maintainability, and scalability.

## Features

- Built with TypeScript
- Express.js server
- RESTful API structure
- Middleware support
- Environment-based configuration
- Pino logger for logging
- Modular and scalable folder structure

---

## Project Structure

### 📁 Project Structure

```text
project-root/
├── dist/                   # Compiled JavaScript output
├── node_modules/           # Project dependencies
├── prisma/                 # Prisma ORM schema
│   └── schema.prisma
├── src/                    # Application source code
│   ├── configs/            # Environment and app configuration
│   ├── features/           # Modular features (e.g. auth, users)
│   │   └── authentication/ # Auth-related logic and controllers
│   ├── lib/                # External utilities or shared services
│   ├── middlewares/        # Express middlewares (auth, error, etc.)
│   ├── utils/              # Helper functions and utilities
│   ├── validations/        # Request/response validation schemas
│   ├── appRoute.ts         # Route definitions
│   ├── app.ts              # Express app configuration
│   └── server.ts           # Application entry point
├── .env                    # Local environment configuration
├── .env.example            # Example environment configuration
├── .gitignore              # Git ignored files
├── package.json            # NPM project metadata and scripts
├── package-lock.json       # Exact dependency versions
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Setup

### 1 Clone the repo

git clone https://github.com/Dhalintin/didsecplus.git

live link http://alertme.com.ng:443/api/v1

## Install Dependecies

npm install

## Environment variables

- Create a .env file in the root with your configuration. Example:
  PORT=5000
  NODE_ENV=development
  DB_URI=mongodb://localhost:27017/mydb
  JWT_SECRET=your_jwt_secret

## Run the app

### Development

     npm run dev

### Production

     npm run build
    npm start

## Technologies Used

- Node.js

- TypeScript

- Express

- Prisma (with MongoDB)

## Documentation

This section provides a comprehensive guide to the backend of the project, built with Node.js, Express, and Prisma for MongoDB interactions. It supports a location-based alert and ticket management system, user authentication, and analytics features, designed for integration with mobile and frontend applications via RESTful APIs.

### Authentication

- **Overview**: Handles user registration, login, and role-based access control.
- **Data Models**:
  - **User**: `id`, `email` (unique), `username` (optional), `name` (optional), `password`, `phone` (optional), `role` (enum: `superAdmin`, `admin`, `citizen`), `location` (optional), `device` (enum: `Android`, `iOS`, `Web`, `Unknown`, optional), `created_at`, `updatedAt`, `tickets`, `alerts` (relations).
- **Services**:
  - **AuthService**: `getExistingUser(email, phone)`, `getUserByEmail(email)`, `getUserUsers()`, `getUserById(id)`, `registerUser(data)`.
- **Controllers**:
  - **LoginController**: `login` (validates email/password, returns JWT token), `logout` (currently returns all users).
  - **RegisterUserController**: `register` (validates input, hashes password, returns token), `logout` (currently returns all users).
- **Endpoints**:

  - `POST /api/auth/register`
    Registers a regular user (default role: `citizen`).

    **Request Body**

    ```json
    {
      "email": "user@example.com",
      "phone": "+2348012345678",
      "password": "yourStrongPassword123",
      "username": "johndoe",
      "name": "John Doe",
      "role": "citizen"
    }
    ```

  - `POST /auth/login`: Login (`{email, password}`) → `{access_token, user}` (200).

- **Validation**: `loginSchema` (email, password), `userSchema` (email, username, name, phone, role, device, location, password).
- **Integration**: Use `Authorization: Bearer <token>` for protected endpoints; validate inputs client-side.
- **Best Practices**: Enforce password complexity client-side; handle duplicate email/phone conflicts.
- **Pitfalls**: Invalid email/password returns 400; duplicates return 500.

### Alert

- **Overview**: Manages creation, retrieval, updating, and deletion of alerts with geospatial data.
- **Data Models**:
  - **Alert**: `id`, `userId` (optional), `user` (relation), `title`, `description` (optional), `status` (enum: `active`, `investigating`, `resolved`, default: `active`), `source` (enum: `phone`, `app`, `web`), `latitude`, `longitude`, `state`, `lga`, `assigned_unit` (optional), `created_at`, `updated_at`, `tickets` (relation).
  - **Indexes**: `userId`, `status`, `state`.
- **Services**:
  - **AlertService**: `createAlert(userId, data)` (creates alert and ticket), `getAlerts(data)` (paginated with filters), `getAlertById(id)`, `updateAlert(data)`, `deleteAlert(id)`.
- **Controllers**:
  - **AlertController**: `createAlert` (validates, infers location if missing), `getAlerts` (pagination/filters), `getAlertById`, `updateAlert`, `deleteAlert` (admin-only).
- **Endpoints**:
  - `POST /alerts`: Create (`{title, description?, status?, source, latitude, longitude, state?, lga?}`) → `{id, title, ...}` (201).
  - `GET /alerts`: Fetch all (`?page, ?page_size, ?status, ?state, ?lga, ?from, ?to`) → `{data: Alert[], meta}` (201).
  - `GET /alerts/:id`: Fetch by ID → `{id, title, ...}` (201).
  - `PATCH /alerts/:id`: Update → Updated `{id, title, ...}` (200).
  - `DELETE /alerts/:id`: Delete → `{message}` (200, admin-only).
- **Validation**: `alertSchema` (title, description, status, source, latitude, longitude, state, lga).
- **Integration**: Provide geospatial data; use query params for filters; handle pagination.
- **Best Practices**: Validate coordinates client-side; use `/locations` for state/lga.
- **Pitfalls**: Missing state/lga triggers inference (may fail); unauthorized deletion returns custom 200.

### Ticket

- **Overview**: Manages creation, retrieval, updating, and deletion of tickets linked to alerts.
- **Data Models**:
  - **Ticket**: `id`, `alert_Id` (unique), `alert` (relation), `created_by` (optional), `user` (relation), `title`, `description` (optional), `status` (enum: `open`, `in_progress`, `resolved`, default: `open`), `priority` (enum: `high`, `mid`, `low`, default: `low`), `assigned_to` (optional), `created_at`, `updated_at`, `note` (optional).
  - **Indexes**: `created_at`, `created_by`.
- **Services**:
  - **TicketService**: `createTicket(data)`, `getTicket(id)`, `getTickets(query)` (paginated with filters), `updateTicket(id, data)`, `deleteTicket(id)`.
- **Controllers**:
  - **TicketController**: `createTicket` (validates input), `getTicket`, `getTickets` (pagination/filters), `updateTicket`, `deleteTicket`.
- **Endpoints**:
  - `GET /tickets`: Fetch all (`?page, ?page_size, ?status, ?assigned_to, ?created_by, ?alert_id`) → `{data: Ticket[], meta}` (200).
  - `GET /tickets/:id`: Fetch by ID → `{id, title, ...}` (200).
  - `POST /tickets`: Create (`{alert_Id, title, description?, status?, priority?, assigned_to?, note?}`) → `{id, title, ...}` (201).
  - `PATCH /tickets/:id`: Update → Updated `{id, title, ...}` (200).
  - `DELETE /tickets/:id`: Delete → `{message}` (200, admin-only).
- **Validation**: `ticketSchema` (alert_Id, title, description, status, priority, assigned_to, note).
- **Integration**: Validate `alert_Id` client-side; use query params for filters.
- **Best Practices**: Track `assigned_to` in UI; display status/priority updates.
- **Pitfalls**: Invalid `alert_Id` returns 409; unauthorized deletion returns 500.

### Location

- **Overview**: Provides state and LGA data, including GeoJSON geometries for mapping.
- **Data Models**:
  - **State**: `id`, `name` (unique), `capital`, `centroid` (Json), `lgas` (relation).
  - **Lga**: `id`, `name`, `stateId`, `state` (relation), `geometry` (Json).
  - **Index**: `stateId`.
- **Services**:
  - **LocationService**: `getStates()` (aggregation), `getLGAsByState(stateId)`, `filterLGAGeojson(state, bboxCoords)`.
- **Controllers**:
  - **LocationController**: `getStates`, `getLGAs(stateId)`, `filterLGAGeojson(bbox?, state?)`, `updateStateDB` (seeds data).
- **Endpoints**:
  - `GET /locations/states`: Fetch all → `[{id, name, centroid}]` (201).
  - `POST /locations/states/update`: Update DB → `{message}` (201).
  - `GET /locations/states/:stateId/lgas`: Fetch LGAs → `[{id, name, stateId, geometry}]` (200).
  - `GET /locations/lgas`: Fetch with filter (`?bbox, ?state`) → GeoJSON `FeatureCollection` (200).
- **Validation**: `getStatesSchema` (none), `getLgasByStateSchema` (stateId), `getLgasSchema` (bbox, state).
- **Integration**: Use `centroid`/`geometry` for mapping; validate `bbox` as `[minLng, minLat, maxLng, maxLat]`.
- **Best Practices**: Cache responses; validate `stateId` client-side.
- **Pitfalls**: Invalid `stateId` returns empty array; malformed `bbox` returns 400.

### Analytics

- **Overview**: Provides aggregated data on user activities and alert distributions.
- **Data Models**: Relies on `User`, `Alert`, `State`, `Lga`.
- **Services**:
  - **AnalyticsService**: `getUserAnalytics(roleFilter, startDate, endDate)` (signups, active users, device breakdown, top locations), `getAlertAnalytics(data)` (daily counts, polygon counts).
- **Controllers**:
  - **AnalyticsController**: `getUserAnalytics` (parses `from`, `to`, `role`), `getAlertAnalytics` (parses `from`, `to`, `state`, `lga`).
- **Endpoints**:
  - `GET /analytics/users`: Fetch user analytics (`?from, ?to, ?role`) → `{signups, activeUsers, deviceBreakdown, topLocations}` (200).
  - `GET /analytics/alerts`: Fetch alert analytics (`?from, ?to, ?state, ?lga`) → `{dailyCounts, polygonCounts}` (201).
- **Integration**: Use date data for charts; map `polygonCounts` with GeoJSON.
- **Best Practices**: Handle null values; use date pickers for `yyyy-MM-dd`.
- **Pitfalls**: Missing dates uses full range; invalid `role` returns 400.

### General Integration Guidelines

- **Authentication**: Use `authMiddleware` with `Authorization: Bearer <token>`.
- **Validation**: Adhere to Joi schemas; validate client-side to avoid 400 errors.
- **Error Handling**: Expect 400 (validation), 401 (unauthorized), 500 (server errors); parse messages.
- **Testing**: Use Postman with sample payloads.

### Dependencies

- Node.js (v18+), Express, Prisma, Joi, date-fns.

## License

## Authors

Darlington
[Visit my GitHub](https://github.com/Dhalintin)

```

```
