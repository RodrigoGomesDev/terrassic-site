# Publicar em um novo GitHub

Esta pasta contém a versão final do site, pronta para um repositório independente.

## Executar

Use Node.js 22.12+ ou 24.

```sh
npm ci
npm run dev
```

## Conferir e gerar o site

```sh
npm run check
npm run build
```

A pasta `dist/` é a saída estática para hospedagem. O repositório deve guardar o código-fonte; `node_modules/` e `dist/` são ignorados.

## Enviar ao GitHub

Crie um repositório vazio no GitHub. Dentro desta pasta, execute os comandos abaixo, substituindo `URL_DO_SEU_REPOSITORIO` pela URL do repositório criado:

```sh
git init -b main
git add .
git commit -m "Site inicial do Terrassic"
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

A workflow incluída verifica os testes e a build no GitHub Actions.

## Links do projeto

Configure download, Discord, trailer e redes em `src/site-config.js`.
