# HR-PASS-FINAL

Digital Pass is an HR recruitment management system built for Baynunah Watergeneration Technologies SP LLC. The system manages the complete recruitment lifecycle through "passes" - trackable recruitment workflows that guide positions from draft through hiring.

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Azure CLI (for cloud deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ismaelloveexcel/HR-PASS-FINAL.git
   cd HR-PASS-FINAL
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp azure-env-template.txt .env
   # Edit .env with your DATABASE_URL and other settings
   ```

4. **Push database schema**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Deployment

This project is configured for deployment to **Azure** using:
- **Azure Static Web Apps** for the frontend
- **Azure App Service** for the backend
- **Azure PostgreSQL Flexible Server** for the database

### Step-by-Step Deployment

1. **Provision Azure Resources**
   ```bash
   ./.azure/provision.sh
   ```
   This creates all required Azure infrastructure in the UAE North region.

2. **Configure GitHub Secrets**
   
   Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` - from Azure Static Web App
   - `AZURE_WEBAPP_PUBLISH_PROFILE` - from Azure App Service
   - `DATABASE_URL` - PostgreSQL connection string from provision output

3. **Deploy**
   ```bash
   git push origin main
   ```
   Or manually trigger workflows from GitHub Actions tab.

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

For a migration checklist, see [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md).

## Project Structure

```
client/           # React frontend application
server/           # Express backend
shared/           # Shared code between client/server
.azure/           # Azure provisioning scripts
.github/workflows # CI/CD deployment pipelines
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run db:push` | Push database schema changes |
| `npm run check` | TypeScript type checking |

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Azure Static Web Apps, Azure App Service

## Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Azure deployment instructions
- [Migration Checklist](./MIGRATION_CHECKLIST.md) - Step-by-step migration checklist
- [Design Guidelines](./design_guidelines.md) - UI/UX design guidelines