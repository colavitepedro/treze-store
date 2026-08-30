# Deploy na Oracle Cloud (Ubuntu 24.04)

A aplicação é publicada como uma imagem Docker no GitHub Container Registry
(GHCR). O GitHub Actions atualiza a instância Oracle sempre que há push em
`main` e todos os testes passam.

## 1. Preparar o Ubuntu 24.04

Execute na instância via SSH, substituindo `SEU_HOST_ORACLE` pelo host da sua
instância:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

printf '%s\n' \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"${UBUNTU_CODENAME:-$VERSION_CODENAME}\") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Saia e entre novamente no SSH para o grupo `docker` ser aplicado. Confirme:

```bash
docker --version
docker compose version
```

## 2. Preparar a pasta da aplicação

```bash
mkdir -p "$HOME/treze"
curl --fail --silent --show-error \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.raw+json" \
  "https://api.github.com/repos/SEU_USUARIO_GITHUB/SEU_REPOSITORIO/contents/compose.yaml?ref=main" \
  --output "$HOME/treze/compose.yaml"
cd "$HOME/treze"
```

O workflow usa `$HOME/treze` por padrão e baixa automaticamente o `compose.yaml`
do SHA exato de cada deploy. Assim, a instância não precisa ter Git instalado.
Se preferir `/opt/treze`, crie a pasta com permissão para o usuário configurado
em `ORACLE_USER` e altere `APP_DIR` no workflow.

Se o pacote do GHCR estiver privado, faça login uma vez usando um token com
permissão `read:packages`. Nunca coloque esse token em um arquivo versionado:

```bash
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io \
  -u colavitepedro --password-stdin
```

Inicie a primeira versão:

```bash
docker compose pull
docker compose up -d
curl --fail http://127.0.0.1:3000/api/health
```

## 3. Configurar secrets no GitHub

Em `Settings → Secrets and variables → Actions`, cadastre:

- `ORACLE_HOST`: IP ou hostname público da instância;
- `ORACLE_USER`: usuário SSH da instância;
- `ORACLE_SSH_KEY`: chave privada SSH usada pelo GitHub Actions.

O workflow usa o `GITHUB_TOKEN` automático para ler o pacote no GHCR durante o
deploy. Se o pacote for privado e a organização exigir outra credencial, use um
secret separado com permissão mínima `read:packages`.

## 4. Fluxo automático

O arquivo `.github/workflows/ci-cd.yml` executa:

```text
Pull request ou push
        ↓
npm ci + npm test + format + audit
        ↓
Push em main?
        ↓
Build da imagem Docker
        ↓
Push para GHCR (latest e SHA)
        ↓
SSH na Oracle
        ↓
docker compose pull/up
        ↓
Health check /api/health
```

O primeiro deploy de cada alteração ocorre com a imagem identificada pelo SHA
do commit, evitando depender apenas da tag `latest`.

## 5. Rede da Oracle

Para um primeiro teste, a porta `3000` pode ser liberada na Security List/NSG da
instância. Para publicar de forma adequada, prefira manter o Node acessível
somente localmente e colocar Nginx ou Caddy na frente nas portas `80` e `443`, com
TLS e domínio.

A aplicação escuta em `0.0.0.0` dentro do container, conforme exigido para a
instância. O compose expõe a porta configurada por `PORT` (3000 por padrão).
Enquanto o acesso for direto por `http://IP:3000`, mantenha `HTTPS_ENABLED=false`.
Depois de configurar TLS em Nginx ou Caddy, defina `HTTPS_ENABLED=true` no
ambiente do compose.

## Observações importantes

- A imagem usa Node 22 Alpine, é publicada para `amd64` e `arm64` e executa como
  usuário não-root.
- O Dockerfile instala somente dependências de produção.
- O `HEALTHCHECK` do container consulta `/api/health`.
- O vídeo é servido pelo Nginx fora do container, em `/var/www/treze/video/`, e
  não entra no GitHub nem na imagem Docker.
- Carrinhos ainda ficam em memória e são temporários.
- Pedidos são persistidos em `DATA_DIR/orders.json` no volume Docker `treze_data`,
  sobrevivendo a reinícios e redeploys do container. Para uma operação maior,
  evolua esse repository para SQLite ou PostgreSQL.
