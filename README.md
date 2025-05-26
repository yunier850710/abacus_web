# Jasmin SMS Gateway Management

A web UI interface for managing the Jasmin SMS Gateway CLI. This application allows you to manage all CLI commands and connect to your Jasmin installation.

## Features

- User authentication and management
- Dashboard with system statistics
- User and group management
- SMPP connector management
- Route management (MT and MO)
- Filter management
- Statistics viewing
- Configuration persistence
- Dark/light mode support
- Responsive design

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Jasmin SMS Gateway installation

## Getting Started

1. Clone the repository
2. Copy the `.env.example` file to `.env` and update the values:

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jasmin_management"

# Next Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Jasmin CLI
JASMIN_HOST="127.0.0.1"
JASMIN_PORT="8990"
JASMIN_USERNAME="jcliadmin"
JASMIN_PASSWORD="jclipwd"
```

3. Install dependencies:

```bash
npm install
```

4. Set up the database:

```bash
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

To build the application for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## License

This project is licensed under the MIT License.