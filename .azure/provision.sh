#!/usr/bin/env bash
set -euo pipefail

# Simple Azure one-click provisioning for HR PASS platform
# Requirements: Azure CLI logged in and subscription selected

RESOURCE_GROUP=${RESOURCE_GROUP:-hr-pass-rg}
LOCATION=${LOCATION:-uaenorth}
POSTGRES_NAME=${POSTGRES_NAME:-hrpass-pg}
POSTGRES_SKU=${POSTGRES_SKU:-Standard_B1ms}
WEBAPP_PLAN=${WEBAPP_PLAN:-hrpass-plan}
WEBAPP_NAME=${WEBAPP_NAME:-hrpass-backend}
STATIC_APP_NAME=${STATIC_APP_NAME:-hrpass-frontend}
PG_ADMIN_USER=${PG_ADMIN_USER:-azureuser}
PG_ADMIN_PASS=${PG_ADMIN_PASS:-$(openssl rand -base64 16 | tr -d '+/=')}
ALLOWED_IP=${ALLOWED_IP:-}
OUTPUT_FILE=${OUTPUT_FILE:-./provision-output.txt}

echo "Creating resource group ${RESOURCE_GROUP} in ${LOCATION}..."
az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}"

echo "Creating PostgreSQL Flexible Server ${POSTGRES_NAME}..."
az postgres flexible-server create \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${POSTGRES_NAME}" \
  --location "${LOCATION}" \
  --sku-name "${POSTGRES_SKU}" \
  --storage-size 32 \
  --admin-user "${PG_ADMIN_USER}" \
  --admin-password "${PG_ADMIN_PASS}" \
  --yes

if [[ -n "${ALLOWED_IP}" ]]; then
  echo "Adding PostgreSQL firewall rule for ${ALLOWED_IP}..."
  az postgres flexible-server firewall-rule create \
    --resource-group "${RESOURCE_GROUP}" \
    --name "${POSTGRES_NAME}" \
    --rule-name allow-specific-ip \
    --start-ip-address "${ALLOWED_IP}" \
    --end-ip-address "${ALLOWED_IP}"
else
  echo "⚠️  Skipping firewall rule; set ALLOWED_IP to lock down access."
fi

PG_HOST="$(az postgres flexible-server show --resource-group "${RESOURCE_GROUP}" --name "${POSTGRES_NAME}" --query fullyQualifiedDomainName -o tsv)"
DATABASE_URL="postgresql://${PG_ADMIN_USER}:${PG_ADMIN_PASS}@${PG_HOST}:5432/postgres?sslmode=require"

echo "Creating App Service plan ${WEBAPP_PLAN} and Web App ${WEBAPP_NAME}..."
az appservice plan create --resource-group "${RESOURCE_GROUP}" --name "${WEBAPP_PLAN}" --sku B1 --is-linux
az webapp create --resource-group "${RESOURCE_GROUP}" --plan "${WEBAPP_PLAN}" --name "${WEBAPP_NAME}" --runtime "NODE|20-lts"

echo "Creating Static Web App ${STATIC_APP_NAME}..."
az staticwebapp create \
  --resource-group "${RESOURCE_GROUP}" \
  --name "${STATIC_APP_NAME}" \
  --location "${LOCATION}" \
  --source . \
  --branch main \
  --login-with-github false

echo ""
echo "✅ Provisioning complete."
echo "Writing DATABASE_URL to ${OUTPUT_FILE} (chmod 600)..."
umask 077
cat > "${OUTPUT_FILE}" <<EOF
DATABASE_URL=${DATABASE_URL}
EOF
echo "⚠️  Delete ${OUTPUT_FILE} after capturing secrets in GitHub to avoid lingering credentials."

echo "Add these GitHub secrets (retrieve securely, do not paste in logs):"
echo "  AZURE_WEBAPP_PUBLISH_PROFILE: run -> az webapp deployment list-publishing-profiles --name ${WEBAPP_NAME} --resource-group ${RESOURCE_GROUP} --query '[0].publishProfileXml' -o tsv (store securely)"
echo "  AZURE_STATIC_WEB_APPS_API_TOKEN: run -> az staticwebapp secrets list --name ${STATIC_APP_NAME} --query apiKey -o tsv (store securely)"
echo "  DATABASE_URL: stored in ${OUTPUT_FILE}"
