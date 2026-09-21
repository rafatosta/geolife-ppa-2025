# Geolife PPA 2025

Aplicativo web mobile-first para acompanhar compromissos, entregas escolares, evidências e uma meta financeira mensal reduzida por descontos auditáveis. A aplicação separa autenticação por e-mail e senha de autorização: toda conta nasce pendente e só acessa dados depois da aprovação de um administrador.

## Stack e arquitetura

- React 19, TypeScript, Vite e Tailwind CSS;
- Radix UI Primitives para componentes interativos acessíveis;
- React Router com `HashRouter`, compatível com GitHub Pages;
- Supabase Auth com e-mail e senha, PostgreSQL, Storage e RLS;
- `date-fns` com locale `pt-BR`, Lucide e helpers centralizados de moeda/data.

O frontend está separado em `pages`, componentes visuais e de domínio, providers, hooks e `services`. Consultas Supabase não ficam espalhadas pelas páginas. O banco distingue regra, ocorrência e registro; o `ledger` é a fonte auditável dos descontos e a função `current_reward_summary()` calcula o saldo fora do cliente.

## Desenvolvimento

Requisitos: Node.js 22 ou superior e um projeto Supabase.

```bash
npm install
cp .env.example .env
npm run dev
```

Preencha apenas chaves públicas no `.env`:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

Nunca coloque `service_role` ou chaves privadas no frontend ou nos secrets que viram variáveis Vite.

Validação local:

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Problema conhecido — Supabase CLI 2.112.0

### Sintoma

Na versão 2.112.0, o vínculo com o projeto pode falhar:

```bash
npx supabase link --project-ref zmxusmuxorbnsrsizfzl
```

O erro menciona a busca de API keys e a validação do campo `inserted_at`:

```text
failed to get api keys: SchemaError(
  Expected a string matching the RegExp ...
  at [2]["inserted_at"]
)
```

### Causa

Trata-se de uma regressão conhecida da Supabase CLI 2.112.0. A CLI aplica ao timestamp `api-keys.inserted_at` uma validação mais restritiva que o formato retornado pela Management API. Por isso, essa mensagem não significa, por si só, que o login, o access token, a organização ou o `project-ref` estejam incorretos. O problema está acompanhado na issue oficial [supabase/cli#6115](https://github.com/supabase/cli/issues/6115).

### Como confirmar

Confira primeiro a versão e a visibilidade do projeto:

```bash
npx supabase --version
npx supabase projects list
```

É possível que `projects list` mostre normalmente o projeto `geolife-ppa-2025`, enquanto o comando abaixo falha ao buscar e validar as API keys:

```bash
npx supabase link --project-ref zmxusmuxorbnsrsizfzl
```

Se a listagem funciona, a autenticação da CLI, a organização e o `project-ref` já foram confirmados; investigue a versão da CLI antes de trocar credenciais.

### Workaround

O projeto está temporariamente fixado, sem `^` ou `~`, na versão 2.111.0:

```bash
npm install --save-dev supabase@2.111.0
npx supabase --version
npx supabase link --project-ref zmxusmuxorbnsrsizfzl
```

O segundo comando deve imprimir `2.111.0`. Caso outra versão esteja instalada, restaure o pin com o primeiro comando e mantenha o `package-lock.json` atualizado.

### Atualização futura

> A versão 2.111.0 está fixada temporariamente devido à issue supabase/cli#6115. Quando uma versão corrigida estiver disponível, ela deve ser testada com `supabase link` antes de remover o pin.

Não atualize automaticamente para `latest`. Valide uma futura versão corrigida com:

```bash
npm install --save-dev supabase@<versao-corrigida>
npx supabase --version
npx supabase link --project-ref zmxusmuxorbnsrsizfzl
```

Somente depois que o vínculo funcionar, confirme a nova versão no `package.json` e no lockfile. Workflows futuros que instalem a Supabase CLI devem usar o mesmo número exato adotado localmente.

## Configuração do banco no Supabase

1. Crie um projeto em [Supabase](https://supabase.com/dashboard) e abra **SQL Editor**.
2. Execute o conteúdo de [database/schema.sql](database/schema.sql) para criar as tabelas, permissões e políticas RLS.
3. Execute o conteúdo de [database/seed.sql](database/seed.sql) para popular o catálogo com 20 espécies, 8 regiões e 48 observações fictícias.
4. Em **Project Settings > API**, copie a **Project URL** e a chave pública (`anon` ou `publishable`). Configure-as no `.env` a partir do `.env.example`.
5. Reinicie `npm run dev` após alterar o `.env`.

O cliente consulta as tabelas `especies`, `regioes` e `observacoes` no schema `public`. No banco, os campos são `snake_case` (por exemplo, `nome_cientifico` e `especie_id`); a aplicação já faz a conversão para os nomes em camelCase usados na interface.

As políticas acima permitem leitura e escrita anônimas, adequadas apenas a um catálogo demonstrativo. Antes de publicar em produção, habilite autenticação e substitua-as por políticas RLS que limitem os dados aos usuários autorizados. Nunca use a chave `service_role` no `.env` do frontend.

## Autenticação por e-mail e senha

1. No Supabase Dashboard, abra Authentication > Sign In / Providers.
2. Mantenha habilitada a criação de contas por e-mail.
3. Para a primeira versão, desative “Confirm email” e clique em “Save changes”. No Dashboard, o controle verde significa ligado; depois da alteração ele deve ficar cinza. O fluxo de aprovação administrativa continua impedindo que contas novas acessem os dados.
4. Em Authentication > URL Configuration, defina o endereço do site e inclua nas Redirect URLs tanto o desenvolvimento (`http://localhost:5173/**`) quanto o Pages (`https://USUARIO.github.io/REPOSITORIO/**`). Essas URLs serão usadas caso a confirmação de e-mail seja ativada no futuro.

No ambiente local criado pela CLI, `supabase/config.toml` já usa `enable_signup = true` e `enable_confirmations = false`. Essa configuração não altera o projeto hospedado: ela precisa ser repetida e salva no Dashboard. Em produção, é possível ativar a confirmação depois de configurar um SMTP confiável, sem alterar o fluxo de aprovação do aplicativo. O `HashRouter` mantém as rotas depois do `#`, como `/#/hoje`, sem exigir fallback do servidor.

### Troubleshooting — `Email not confirmed`

#### Classificação

O incidente observado na configuração inicial foi uma falha de processo/configuração, com contribuição de execução humana, e não um defeito do login por senha:

- o controle “Confirm email” permaneceu verde, portanto ainda estava ligado no projeto hospedado;
- a configuração correta em `supabase/config.toml` valia apenas para o ambiente local;
- desativar a confirmação não confirma retroativamente contas criadas anteriormente;
- o perfil `public.profiles` já estava `admin/active`, mas autenticação e autorização são camadas independentes.

O processo anterior não exigia verificar objetivamente o campo “Confirmed at” em Authentication > Users. Sem esse critério, era possível concluir incorretamente que promover `public.profiles` para administrador também liberaria o login.

#### Diagnóstico

Quando o aplicativo mostrar `Email not confirmed`, verifique a identidade em `auth.users`:

```sql
select
  id,
  email,
  email_confirmed_at,
  confirmed_at
from auth.users
where email = 'usuario@exemplo.com';
```

Se `email_confirmed_at` estiver nulo, o Supabase Auth bloqueará o login antes de consultar `public.profiles`. Alterar `role` ou `status` no perfil não resolve essa etapa.

#### Correção de uma conta de desenvolvimento existente

Prefira enviar e abrir o e-mail de confirmação em Authentication > Users. Para uma conta de desenvolvimento controlada, sem SMTP configurado, um administrador do projeto pode fazer a correção pontual no SQL Editor:

```sql
update auth.users
set email_confirmed_at = now(),
    updated_at = now()
where email = 'usuario@exemplo.com'
  and email_confirmed_at is null
returning email, email_confirmed_at, confirmed_at;
```

Essa atualização direta em `auth.users` é um procedimento administrativo excepcional para desenvolvimento. Ela não deve ser executada pela aplicação, exposta a usuários ou usada como substituto da confirmação real de e-mail em produção.

#### Checklist preventivo

Antes de criar a primeira conta:

1. confirmar que “Allow new users to sign up” está verde;
2. confirmar que “Confirm email” está cinza e salvar;
3. usar `http://localhost:5173` como Site URL e `http://localhost:5173/**` como Redirect URL;
4. criar a conta pelo aplicativo;
5. verificar em Authentication > Users se “Confirmed at” possui uma data;
6. somente depois promover o primeiro perfil para `admin/active`.

## Fluxo de aprovação

1. A pessoa cria uma conta com nome, e-mail e senha.
2. O trigger `handle_new_user` cria `profiles` com `role = user` e `status = pending`.
3. O frontend mostra somente a página de espera e a ação Sair.
4. Um admin usa `/admin/usuarios` para aprovar ou rejeitar.
5. A RPC registra `approved_at` e `approved_by`; a próxima leitura do perfil libera o usuário ativo.
6. Contas bloqueadas ou rejeitadas continuam conseguindo ler apenas o próprio perfil para que a interface explique o estado.

## Evidências e Storage

As imagens são redimensionadas no navegador para até 1920 px no maior lado e convertidas para WebP com qualidade 0,82. O upload privado usa:

```text
<user_id>/<year>/<month>/<submission_id>/<uuid>.webp
```

Metadados ficam em `submission_photos`; as políticas do banco e do Storage validam o usuário e o estado ativo. Admins podem consultar evidências para revisão. URLs devem ser temporárias (signed URLs), nunca públicas.

## GitHub Pages

Em Settings > Pages, selecione “GitHub Actions”. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em Settings > Secrets and variables > Actions. Cada push em `main` executa lint, testes, build e deploy. O `base: './'` do Vite permite publicar em subdiretórios de repositório.

## Modelo financeiro e segurança

O saldo é `maximum_value - sum(ledger.value)`, com piso zero. O frontend apenas exibe o resultado da RPC; não grava saldos. Operações privilegiadas exigem simultaneamente perfil `admin/active` no banco. Esconder botões é apenas uma conveniência visual, nunca o controle de acesso.

Antes de produção, teste as políticas com contas distintas (pendente, usuário ativo e admin), configure backups e revise as URLs autorizadas de autenticação.
