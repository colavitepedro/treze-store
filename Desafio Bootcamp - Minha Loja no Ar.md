Bootcamp AI/R · Trilha Commerce · lançamento 25/08/2026

# Desafio: Minha Loja no Ar 🛒

**A entrega é uma URL. Na URL, uma loja — e você, explicando ela.**

## 1. O desafio

Nos workshops você viu **onde a IA entra numa loja** (Andrew, 18/08) e **o corpo que sustenta tudo isso na nuvem** (Romulo, 20/08 — inclusive uma página publicada ao vivo na AWS). Agora é a sua vez, de ponta a ponta:

**Construa uma mini-loja, coloque no ar de graça e grave um vídeo explicando o que você fez e por quê.**  
A entrega é **uma única URL pública**: a loja funcionando + uma página /como-fiz com o seu vídeo.

**Individual.** Prazo: **5 dias** (1 turno por dia) — entrega até **terça-feira, 01/09, 17h59**.

## 2. Requisitos da loja

- [ ] **Tema e identidade 100% seus.** Escolha o que a sua loja vende (tênis, plantas, games, café… qualquer coisa). Nome, cores e produtos precisam ser diferentes dos exemplos mostrados em aula.

- [ ] **Catálogo em JSON, separado do front:** os produtos vivem num arquivo products.json (mínimo **6 produtos**) carregado via fetch. **Proibido** hardcodar produto no HTML. É o conceito de **headless commerce** em miniatura: quem monta a vitrine é o JavaScript, lendo o catálogo.

- [ ] **Busca OU filtro por categoria** funcionando na vitrine.

- [ ] **Site estático** (sugestão: HTML + CSS + JS puros já resolvem; framework é permitido, mas não ganha ponto extra — a nota é da explicação).

- [ ] **Hospedado publicamente, de graça** (guia na seção 6).

- [ ] **Página /como-fiz** com o seu vídeo (embutido do YouTube não listado ou Loom vale; auto-hospedar o arquivo vale bônus).

Quer ir além (carrinho, checkout fictício, dark mode…)? Fique à vontade — conta em criatividade. Mas o mínimo bem explicado vale mais que o máximo mal explicado.

## 3. IA é liberada. **LEIA COM ATENÇÃO**

Use Claude, ChatGPT, Copilot, o que quiser — a gente usa todo dia. Mas lembra da **escada** que o Andrew mostrou: pedir → dar contexto → especificar → **delegar com aceite**.

A entrega deste desafio é **no degrau 4**: a IA pode escrever o código com você, mas **você precisa ser capaz de explicar e defender cada decisão**. Nas palavras dele: _"se você não consegue revisar a saída, você não delegou — você apostou"_. O vídeo e a call (seção 5) existem exatamente pra isso.

## 4. O vídeo (5 a 8 minutos)

Gravação de **tela com a sua voz** (OBS, Loom, gravador do Windows/Mac — tanto faz), navegando **ao vivo** no seu código e no seu site publicado. Nada de slides lidos: mostre o código de verdade. Responda, na ordem, estas 5 perguntas:

1.  **01**  **O que você construiu e como o código está organizado?** Passeie pelos arquivos: quem faz o quê.

2.  **02**  **Por que o catálogo é separado do front?** Mostre o products.json e o fetch funcionando — e explique o que isso tem a ver com "headless commerce".

3.  **03**  **Se essa loja fosse para a AWS, onde entraria cada peça?** (Dica: reveja a "jornada do clique".) E **o que o cache faz por você quando 10 mil pessoas acessam ao mesmo tempo?** Explique o caminho navegador → CDN → origem.

4.  **04**  **Rode o Lighthouse ao vivo** (F12 → aba Lighthouse → Analyze) e comente seus scores: o que você melhoraria primeiro, e por quê?

5.  **05**  **Onde você plugaria IA nessa loja** (busca? recomendação? atendimento?) — e **o que foi mais difícil de verdade** na construção?

## 5. Avaliação

| **Critério**                                                                                                                   | **O que a gente olha**                                                                                         | **Pontos** |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------- |
| **Clareza da explicação**                                                                                                      | O vídeo faz alguém de fora entender o que você fez? Didática, ordem, segurança ao navegar no próprio código.   | **30**     |
| **Domínio técnico**                                                                                                            | Headless, cache e mapeamento AWS explicados _corretamente_, com as suas palavras, apontando para o seu código. | **25**     |
| **Loja no ar**                                                                                                                 | URL pública funcionando, catálogo via products.json + fetch, busca/filtro operando.                            | **20**     |
| **Lighthouse comentado**                                                                                                       | Auditoria rodada ao vivo no vídeo, com leitura crítica dos scores e um plano de melhoria honesto.              | **15**     |
| **Conexão com os workshops**                                                                                                   | Amarrou os conceitos das duas apresentações ao que você construiu.                                             | **10**     |
| **Bônus** — vídeo auto-hospedado no próprio site (peso do arquivo é problema seu — bem-vindo ao mundo real das CDNs)           |                                                                                                                | **+10**    |
| **Bônus** — desenho da arquitetura apontando onde entraria um **BFF** se a sua loja ganhasse um app mobile (pesquise o termo!) |                                                                                                                | **+10**    |

**E tem mais: a call individual.** Depois da entrega, cada pessoa terá uma **call de 10 minutos, individual**, com 2–3 perguntas sobre o **seu** código e as **suas** decisões — no estilo "por que você fez assim?" e "o que acontece se eu mudar isso aqui?".

Se você construiu e entendeu, essa call é a parte mais tranquila do desafio.

## 6. Como colocar no ar (de graça)

Nossa **sugestão é o GitHub Pages** — além de gratuito, o repositório vira portfólio público seu. Mas você **não é obrigado** a usá-lo: Netlify, Cloudflare Pages e Vercel também são grátis e valem igual. A escolha (e o porquê dela) é um ótimo assunto pro seu vídeo.

## 7. Cronograma sugerido (1 turno por dia)

| **Turno**     | **Meta do dia**                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Qua 27/08** | Definir tema e nome da loja; esboçar o products.json; primeira versão da vitrine rodando localmente.                |
| **Qui 28/08** | Busca/filtro funcionando; visual da loja no capricho; testar em tela de celular.                                    |
| **Sex 29/08** | Publicar! Loja no ar na hospedagem escolhida; conferir que o fetch funciona hospedado; rodar o primeiro Lighthouse. |
| **Seg 31/08** | Ajustes finais + **ensaiar** a explicação (roteiro das 5 perguntas no papel; cronometre!).                          |
| **Ter 01/09** | Gravar o vídeo, montar a página /como-fiz, revisar tudo e **entregar até 17h59**.                                   |

## 8. Entrega

- [ ] Poste no canal do Bootcamp: a **URL pública da loja** (e a URL do repositório, se usou GitHub).

- [ ] Confira antes: a URL abre em **aba anônima** e no **celular**? O vídeo dá play?

- [ ] Prazo: **terça 01/09, 17h59**. As calls individuais serão agendadas na semana seguinte.

**Um lembrete final:** este desafio não mede quem escreve o melhor código — mede quem **entende e explica** o que colocou no ar. Essa é a habilidade que separa quem usa IA de quem é usado por ela. Boa sorte — e bom deploy! 🚀

Desafio Bootcamp · AI/R · Trilha Commerce · agosto/2026
