# Configuração de Ambiente

## Estratégia de Variáveis de Ambiente

### 1. Desenvolvimento Local
Utilizamos arquivos `.env` para gerenciar configurações locais de forma segura e prática.

*   **`.env.local`**: Contém seus valores secretos reais (API keys, segredos do OAuth, URL do banco de dados). **NUNCA** commit este arquivo, pois ele contém dados sensíveis. Ele é ignorado pelo Git (`.gitignore`).
*   **`.env.example`**: Arquivo de template contendo apenas as chaves necessárias, sem os valores reais. **DEVE** ser commitado no repositório para servir de guia para outros desenvolvedores.

**Passos para configurar o ambiente local:**
1.  Copie o exemplo para criar seu arquivo local: `cp .env.example .env.local`
2.  Preencha os valores reais das variáveis em `.env.local`.

### 2. Produção (Google Cloud Platform)
Em ambiente de produção (Cloud Run), **não utilizamos arquivos `.env` físicos**. As configurações são injetadas diretamente pela infraestrutura do GCP para garantir máxima segurança:

*   **Variáveis públicas**: Injetadas via `--set-env-vars` no comando de deploy.
*   **Variáveis sensíveis**: Gerenciadas via **Google Secret Manager** e referenciadas no deploy via `--set-secrets`.

Consulte o documento `docs/GCP_AUTH_DEPLOY.md` para obter os comandos detalhados de deploy em produção.
