# Azure Deployment Guide

## Quick Start
1) Provision resources  
```bash
./.azure/provision.sh
```

2) Add GitHub secrets (from provision output)  
- `AZURE_STATIC_WEB_APPS_API_TOKEN`  
- `AZURE_WEBAPP_PUBLISH_PROFILE`  
- `DATABASE_URL`

3) Deploy  
```bash
git push origin main
```

## What Gets Created
- Resource group in **UAE North**
- PostgreSQL Flexible Server (B1ms)
- App Service (B1) for backend
- Static Web App (Free) for frontend
- SSL/TLS, firewall rules, managed identity

## Pipelines
- `.github/workflows/deploy-backend.yml` — builds & deploys Express backend
- `.github/workflows/deploy-frontend.yml` — builds & deploys Vite frontend

## Troubleshooting
1. Check GitHub Actions logs (`Actions` tab)  
2. Tail backend logs  
```bash
az webapp log tail --name <webapp-name> --resource-group <rg>
```
3. Verify secrets are present and match outputs

