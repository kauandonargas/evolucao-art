# Evolução Art — aplicativo para Windows

Versão desktop da interface **Evolução Art v9**, com Treino, Focos e Estudo de Mestres.

## Abrir localmente

Requer Node.js 22+ e npm com acesso à internet na primeira instalação:

```powershell
npm install
npm start
```

## Instalar no Windows

O workflow `.github/workflows/windows-release.yml` gera automaticamente um instalador **NSIS para Windows x64** e publica uma Release quando há novas alterações na branch `main`.

O instalador é publicado em **https://github.com/kauandonargas/evolucao-art/releases/latest** após o primeiro workflow bem-sucedido. Não há um `.exe` neste pacote de fontes; ele é construído pelo GitHub Actions no Windows.

### Atualizações sem botão

- O aplicativo consulta a Release pública no GitHub 15 segundos após abrir e depois a cada 4 horas, enquanto estiver aberto.
- Quando existe uma versão maior, baixa automaticamente em segundo plano.
- **Instala a atualização ao fechar o programa**, para não interromper um desenho ou corromper uma edição em andamento.
- Quando aberto novamente, inicia na versão atualizada. Não é necessário clicar em "Atualizar".
- Se estiver sem internet, a verificação falha silenciosamente e será repetida depois.
- O atualizador funciona no **aplicativo instalado pelo NSIS**, não com `npm start`, nem abrindo o HTML diretamente.

O versionamento usa `0.1.<número da execução do workflow>`, garantindo uma versão maior a cada nova publicação bem-sucedida.

## Publicação (primeira vez)

1. Crie no GitHub um repositório público vazio chamado `kauandonargas/evolucao-art` (sem README inicial).
2. Copie todos os arquivos deste pacote para esse repositório, **incluindo `.github/workflows/windows-release.yml`**.
3. Faça o primeiro push para `main`. O Actions deve testar, montar o instalador e criar o primeiro Release público.
4. Depois de verificar que o workflow terminou com sucesso, abra `https://github.com/kauandonargas/evolucao-art/releases/latest` e baixe o instalador `.exe`.
5. No futuro, cada mudança publicada em `main` aciona o workflow. O aplicativo instalado verifica as novas versões sozinho.

Atenção: sem publicar uma Release com `latest.yml`, não existe servidor de atualizações. E sem instalar a primeira versão, o aplicativo não tem como se atualizar.

## Dados locais

A origem interna `evolucao://app/index.html` é estável; os dados de `localStorage` e `IndexedDB` são mantidos no perfil persistente do Electron em `%APPDATA%\\EvolucaoArt`. O atualizador não apaga essa pasta.

**Os dados do HTML aberto no navegador não são importados automaticamente** para o programa instalado. Esta primeira versão desktop preserva a interface e os dados em armazenamento interno do Electron; não implementa ainda a futura biblioteca de arquivos físicos no Explorador do Windows.

## Segurança e distribuição

O programa não habilita Node.js na interface e bloqueia novas janelas e navegação para destinos inseguros. Links HTTPS externos são abertos no navegador padrão.

A instalação não possui assinatura digital. O Windows SmartScreen pode exibir um aviso na primeira execução. Para uma distribuição pública ampla, é recomendável providenciar assinatura de código.

## Validação

`npm run check` executa checagem de sintaxe e testes de lógica do atualizador. A instalação real, retenção de dados entre versões e atualização silenciosa devem ser verificadas no Windows após duas Releases publicadas.