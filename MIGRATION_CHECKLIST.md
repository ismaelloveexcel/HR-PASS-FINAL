# Migration Checklist

- [ ] Run `./.azure/provision.sh` to create Azure resources
- [ ] Capture outputs and set GitHub secrets
  - [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - [ ] `AZURE_WEBAPP_PUBLISH_PROFILE`
  - [ ] `DATABASE_URL`
- [ ] Update environment variables locally using `azure-env-template.txt`
- [ ] Push changes to `main` to trigger deployments
- [ ] Verify frontend URL responds (Static Web App)
- [ ] Verify backend URL responds (App Service)
- [ ] Run database migrations (`npm run db:push`) if schema changes
- [ ] Confirm CORS and HTTPS working end-to-end
