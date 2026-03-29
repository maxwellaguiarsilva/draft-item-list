# Secure Deploy Configuration on GCP

This guide describes how to manage environment variables securely for the project when deploying to Google Cloud Platform (GCP), using `gcloud CLI` and following security best practices.

## Overview

To protect API keys and secrets (`AUTH_GOOGLE_SECRET`, `AUTH_SECRET`), we will adopt the following strategy:

| Variable | Type | Strategy |
| :--- | :--- | :--- |
| `AUTH_GOOGLE_ID` | Public/Non-Sensitive | Environment Variable (`--set-env-vars`) |
| `AUTH_GOOGLE_SECRET` | Sensitive | Google Secret Manager (`--set-secrets`) |
| `AUTH_SECRET` | Sensitive | Google Secret Manager (`--set-secrets`) |

---

## Step-by-Step

### 1. Simple Environment Variables (Non-sensitive)
Defined directly in the deploy command.

```bash
# Example
gcloud run deploy [SERVICE_NAME] \
  --set-env-vars="AUTH_GOOGLE_ID=your-public-id"
```

### 2. Google Secret Manager (Sensitive variables)

#### A. Create the secrets in GCP
Replace `[YOUR_SECRET_VALUE]` with the actual value (without extra quotes in the shell).

```bash
# Create AUTH_GOOGLE_SECRET
echo -n "[YOUR_GOOGLE_SECRET]" | gcloud secrets create AUTH_GOOGLE_SECRET --data-file=-

# Create AUTH_SECRET
echo -n "[YOUR_AUTH_SECRET]" | gcloud secrets create AUTH_SECRET --data-file=-
```

#### B. Grant permission to Cloud Run
The service needs permission to access the secrets.

```bash
# Get the service account email (Compute Engine default service account)
PROJECT_NUMBER=$(gcloud projects describe $GOOGLE_CLOUD_PROJECT --format="value(projectNumber)")
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Grant access to secrets
gcloud secrets add-iam-policy-binding AUTH_GOOGLE_SECRET \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding AUTH_SECRET \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy Referencing Secrets
In the deploy command, use the `--set-secrets` flag.

```bash
gcloud run deploy [SERVICE_NAME] \
  --set-env-vars="AUTH_GOOGLE_ID=your-public-id" \
  --set-secrets="AUTH_GOOGLE_SECRET=AUTH_GOOGLE_SECRET:latest,AUTH_SECRET=AUTH_SECRET:latest"
```

---

## Verification

To verify if the secrets were applied correctly, you can inspect the service configuration by running:

```bash
gcloud run services describe [SERVICE_NAME] --format="table(spec.template.spec.containers.env)"
```
Ensure that the variables point to the configured secrets.

---

## Future: Automation with IaC

To achieve full automation of GCP infrastructure (avoiding Web Console), we will use **Terraform** (IaC):

- **OAuth:** Provisioning of the consent screen and IDs via `google_iap_*` resources or service APIs.
- **Secrets:** Management of secrets (`secret manager`) via `google_secret_manager_secret`.
- **Pipeline:** Integration with GitHub Actions for automated continuous deployment.
