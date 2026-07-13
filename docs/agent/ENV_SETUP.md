# Environment Configuration

## Environment Variable Strategy

### 1. Local Development
We use `.env` files to manage local configurations securely and practically.

*   **`.env.local`**: Contains your actual secret values (API keys, OAuth secrets, database URL). **NEVER** commit this file, as it contains sensitive data. It is ignored by Git (`.gitignore`).
*   **`.env.example`**: Template file containing only the necessary keys, without the actual values. **MUST** be committed to the repository to serve as a guide for other developers.

**Steps to set up the local environment:**
1.  Copy the example to create your local file: `cp .env.example .env.local`
2.  Fill in the actual variable values in `.env.local`.

### 2. Production (Google Cloud Platform)
In the production environment (Cloud Run), **we do not use physical `.env` files**. The configurations are injected directly by the GCP infrastructure to ensure maximum security:

*   **Public variables**: Injected via `--set-env-vars` in the deploy command.
*   **Sensitive variables**: Managed via **Google Secret Manager** and referenced in the deploy via `--set-secrets`.

Consult the `docs/GCP_AUTH_DEPLOY.md` document for detailed production deploy commands.
