A autenticação com OAuth (como a do Google) é um padrão da indústria, e essas variáveis de ambiente são as chaves que permitem que o seu site "converse" com o Google de forma segura para confirmar a identidade do usuário.

Aqui está uma explicação simples de cada uma delas:

### 1. `AUTH_GOOGLE_ID` (também conhecido como Client ID)
*   **O que é:** É o "nome de usuário" do seu projeto no mundo Google.
*   **Para que serve:** Quando o usuário clica no botão "Entrar com Google", o seu site envia esse ID para o Google. Ele diz ao Google: *"Ei, sou o site [seu site] e estou pedindo autorização para verificar quem é este usuário."*
*   **É sensível?** Não é um segredo total, mas deve ser mantido privado apenas por segurança.

### 2. `AUTH_GOOGLE_SECRET` (também conhecido como Client Secret)
*   **O que é:** É a "senha" secreta do seu projeto junto ao Google.
*   **Para que serve:** Esta é a parte mais crítica da segurança. Quando o Google responde dizendo *"Sim, este usuário é o João Silva"*, o seu site usa esse *Secret* para confirmar para o Google: *"Recebi a resposta, e eu sou realmente o dono do site [seu site] que fez a pergunta original"*. Isso evita que outras pessoas finjam ser o seu site.
*   **É sensível?** **SIM, CRITICAMENTE.** Nunca compartilhe esse valor, não coloque em arquivos de código que vão para o GitHub, e nunca exponha no navegador. Ele deve ser tratado como uma senha real.

### 3. `AUTH_SECRET`
*   **O que é:** Uma chave secreta própria do seu projeto (gerada por você).
*   **Para que serve:** O `Auth.js` usa essa chave para "assinar" (criptografar) os *cookies* de sessão que o seu site cria no navegador do usuário.
*   **Por que é necessário?** Quando o usuário faz login, o seu site guarda um *cookie* no navegador dele para "lembrar" que ele está logado. Sem essa chave, um usuário mal-intencionado poderia tentar alterar esse *cookie* para fingir ser outra pessoa. O `AUTH_SECRET` garante que, se o *cookie* for alterado, o seu site saberá que ele não é autêntico e invalidará o acesso.
*   **É sensível?** **SIM.** Deve ser mantido em segredo absoluto.

---

### Resumo do fluxo:
1.  **Usuário clica em Login.**
2.  Seu site usa o `AUTH_GOOGLE_ID` para pedir permissão ao Google.
3.  Google valida, e o site usa o `AUTH_GOOGLE_SECRET` para confirmar a identidade com o Google.
4.  O `Auth.js` gera uma sessão, usa o `AUTH_SECRET` para criar um cookie seguro, e o usuário está logado.

**Dica de segurança:** Como você está desenvolvendo localmente, certifique-se de que o arquivo `.env` (onde essas variáveis vivem) esteja listado no seu `.gitignore` para que ele **nunca** seja enviado para o servidor de código (GitHub/GitLab).



