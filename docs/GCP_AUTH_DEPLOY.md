# Configuração de Deploy Seguro no GCP

Este guia descreve como gerenciar variáveis de ambiente de forma segura para o projeto ao realizar o deploy no Google Cloud Platform (GCP), utilizando o `gcloud CLI` e seguindo as melhores práticas de segurança.

## Visão Geral

Para proteger chaves de API e segredos (`AUTH_GOOGLE_SECRET`, `AUTH_SECRET`), adotaremos a seguinte estratégia:

| Variável | Tipo | Estratégia |
| :--- | :--- | :--- |
| `AUTH_GOOGLE_ID` | Pública/Não Sensível | Variável de Ambiente (`--set-env-vars`) |
| `AUTH_GOOGLE_SECRET` | Sensível | Google Secret Manager (`--set-secrets`) |
| `AUTH_SECRET` | Sensível | Google Secret Manager (`--set-secrets`) |

---

## Passo a Passo

### 1. Variáveis de Ambiente Simples (Não sensíveis)
Definidas diretamente no comando de deploy.

```bash
# Exemplo
gcloud run deploy [NOME_DO_SERVICO] \
  --set-env-vars="AUTH_GOOGLE_ID=seu-id-publico"
```

### 2. Google Secret Manager (Variáveis sensíveis)

#### A. Criar os segredos no GCP
Substitua `[SEU_VALOR_SECRETO]` pelo valor real (sem aspas extras no shell).

```bash
# Criar AUTH_GOOGLE_SECRET
echo -n "[SEU_GOOGLE_SECRET]" | gcloud secrets create AUTH_GOOGLE_SECRET --data-file=-

# Criar AUTH_SECRET
echo -n "[SEU_AUTH_SECRET]" | gcloud secrets create AUTH_SECRET --data-file=-
```

#### B. Conceder permissão ao Cloud Run
O serviço precisa de permissão para acessar os segredos.

```bash
# Obter o e-mail da conta de serviço (Compute Engine default service account)
PROJECT_NUMBER=$(gcloud projects describe $GOOGLE_CLOUD_PROJECT --format="value(projectNumber)")
SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Conceder acesso aos segredos
gcloud secrets add-iam-policy-binding AUTH_GOOGLE_SECRET \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding AUTH_SECRET \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy Referenciando Segredos
No comando de deploy, utilize a flag `--set-secrets`.

```bash
gcloud run deploy [NOME_DO_SERVICO] \
  --set-env-vars="AUTH_GOOGLE_ID=seu-id-publico" \
  --set-secrets="AUTH_GOOGLE_SECRET=AUTH_GOOGLE_SECRET:latest,AUTH_SECRET=AUTH_SECRET:latest"
```

---

## Verificação

Para verificar se os segredos foram aplicados corretamente, você pode inspecionar a configuração do serviço rodando:

```bash
gcloud run services describe [NOME_DO_SERVICO] --format="table(spec.template.spec.containers.env)"
```
Certifique-se de que as variáveis apontam para os segredos configurados.

