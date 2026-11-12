
# ShowMate

**SEU DIÁRIO PESSOAL DE ENTRETENIMENTO**

**Aluno:** Caio Henrique Biaco  
**Disciplina:** Frameworks para Desenvolvimento de Dispositivos Móveis

## Descrição

O ShowMate é um aplicativo mobile inspirado no antigo TV Time, desenvolvido para ajudar os usuários a acompanhar filmes e séries.

O aplicativo permite descobrir novos conteúdos, organizar filmes e séries em uma lista pessoal, registrar filmes assistidos e acompanhar o progresso de episódios de séries.

O projeto foi desenvolvido utilizando React Native e Expo, com identidade visual Dark Blue.

## Funcionalidades

- Consulta de filmes e séries utilizando a API do TMDB.
- Busca de conteúdos pelo nome.
- Exibição de filmes e séries em uma grade de dois cards por linha.
- Carregamento de mais resultados ao rolar a tela.
- Visualização de detalhes, sinopse, elenco e informações dos conteúdos.
- Adição e remoção de filmes e séries da Minha Lista.
- Registro de filmes assistidos.
- Acompanhamento de episódios assistidos por temporada.
- Estatísticas pessoais de filmes, séries e tempo estimado assistido.
- Edição de nome e foto do perfil.
- Compartilhamento de filmes e séries.
- Armazenamento local dos dados utilizando AsyncStorage.

## Telas disponíveis

- **Home:** apresenta um resumo das atividades, estatísticas e conteúdos acompanhados.
- **Descobrir:** permite pesquisar filmes e séries, visualizar conteúdos populares e acessar seus detalhes.
- **Minha Lista:** reúne os filmes e séries salvos pelo usuário, com opções de filtros e remoção.
- **Perfil:** apresenta informações do usuário, filmes assistidos, progresso das séries e estatísticas.

Além dessas telas, o aplicativo possui páginas de detalhes dos conteúdos e edição de perfil.

## Tecnologias utilizadas

- React Native
- Expo
- JavaScript
- React Navigation
- AsyncStorage
- API do The Movie Database (TMDB)
- Expo Image Picker
- StyleSheet

## Como executar

1. Instale o [Node.js](https://nodejs.org/).

2. Clone o repositório:

```bash
git clone https://github.com/caiohbiaco/ShowMate.git
```

3. Entre na pasta do projeto:

```bash
cd ShowMate
```

4. Instale as dependências:

```bash
npm install
```

5. Crie um arquivo `.env.local` na raiz do projeto e configure seu token de acesso da API do TMDB:

```env
EXPO_PUBLIC_TMDB_TOKEN=SEU_TOKEN_AQUI
```

6. Inicie o aplicativo:

```bash
npx expo start
```

7. Instale o aplicativo Expo Go no celular ou tablet e escaneie o QR Code exibido no terminal.

## Capturas de tela

### Home

![Tela inicial do ShowMate](assets/screenshots/home.jpeg)

### Descobrir

![Tela de descoberta de filmes e séries](assets/screenshots/descobrir.jpeg)

### Minha Lista

![Minha Lista do usuário](assets/screenshots/biblioteca.jpeg)

### Perfil

![Perfil e estatísticas do usuário](assets/screenshots/perfil.jpeg)

## Créditos e atribuições

O ShowMate utiliza a API do [The Movie Database (TMDB)](https://www.themoviedb.org/) para consultar informações sobre filmes e séries, incluindo títulos, sinopses, pôsteres, avaliações e elenco.

This product uses the TMDB API but is not endorsed or certified by TMDB.
