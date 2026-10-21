# Editor compartilhado v18
O motor de edição é acionado apenas nas páginas de edição de Focos, exercícios, anotações e fundamentos.

- Blocos: parágrafos e linhas com até três imagens; menu ao clicar com o botão direito, arraste, colagem, exclusão, alinhamento e tamanho.
- Focos: grava `editorBlocks` e mantém `pageBlocks`, `imageIds`, conceito e micro-habilidade para compatibilidade.
- Anotações: usa `editorBlocks` sem apagar histórico de estudo e favoritos.
- Fundamentos: configura nome, descrição, obras e os Focos de cada exercício da categoria.
- Exercícios: edita texto, título, fundamento, nível e Focos, sem alterar sessões e avaliações.
- Os arquivos de imagem continuam no IndexedDB local. Excluir uma imagem de uma página remove o vínculo, não apaga imagens usadas em outros registros.
- A importação e o recomendador de treino não são modificados.
