# Importar sistemas de estudo — Evolução Art

O aplicativo aceita pacotes JSON com fundamentos, Focos e exercícios. Converta seus materiais de estudo para o formato de importação e revise a prévia antes de gravar. O aplicativo **não interpreta texto livre** automaticamente.

## Uso

1. Abra **Treino → Importar sistema de estudos…**.
2. Selecione um JSON ou cole o conteúdo.
3. Clique em **Verificar e visualizar**.
4. Confirme depois de revisar vínculos, duplicações e quantidades.

O importador não inventa avaliações, nem sobrescreve cadastros anteriores. Itens já importados com a mesma identidade de pacote são preservados; títulos iguais de origem diferente produzem conflito explícito.

## Formatos

- `evolucao-art.import/v1`: compatível com os pacotes antigos.
- `evolucao-art.import/v2`: acrescenta metas alternativas PRTP e cronogramas por folhas.

O pacote contém `schema`, `packageId`, `name`, `foundations`, `focuses`, `exercises`. Chaves devem ser identificadores estáveis, em minúsculas, sem espaços.

| Item | Campos aceitos |
| --- | --- |
| Fundamento | `key`, `name`, `master` (opcional), `courseUrl` (opcional), `complexity` (1–3), `focusKeys` |
| Foco | `key`, `title`, `concept`, `microSkill`, `courseUrl` (opcional) |
| Exercício | `key`, `title`, `area` (`drawing` ou `painting`), `foundationKey`, `focusKeys`, `difficulty` (`easy`, `medium`, `hard`), `withReference`, `withoutReference`, `instructions` |
| Exercício v2 (opcionais) | `progressMode`, `sheetTarget`, `sheetDone` |

Um exercício pode trabalhar diversos Focos. Fundamentos organizam a complexidade, mas **não possuem pontuação própria**. As avaliações de Focos e de exercícios permanecem independentes.

## Regras de progresso adicionais da v2

### `progressMode: "prtp"`

- `withReference: 3`, `withoutReference: 6`.
- Considera concluído quando há **3 estudos com referência + 6 sem referência** ou **9 estudos somente de imaginação**.
- Não cria avaliações e não impõe esses números a exercícios que não usam essa regra.
- Trata-se de uma interpretação programada do método 3 estudos-base com duas tentativas de imaginação cada; confirme se corresponde ao método antes de adotá-lo.

### `progressMode: "sheets"`

- Define `sheetTarget` (quantas folhas pretende produzir) e `sheetDone` (folhas já informadas, se houver).
- O progresso é **`sheetDone + número de estudos anexados`**, sem converter folhas antigas em imagens ou avaliações fictícias.
- Os campos `withReference` e `withoutReference` devem ser zero; a modalidade das folhas é livre.
- Pressupõe que cada estudo anexado corresponde a uma folha. Se isso não corresponder ao seu fluxo, adapte a regra antes de acompanhar o progresso.

Exemplo genérico: `examples/exemplo-progresso-v2.json`.

## Segurança e limitações

- Arquivos JSON são validados antes de qualquer alteração; campos não reconhecidos são recusados.
- Links externos aceitam somente HTTP ou HTTPS.
- A importação mantém um backup dos metadados e não apaga históricos ou imagens.
- Não importa anexos PDF, imagens, obras de mestres, calendários, progressões por desbloqueio ou notas históricas automaticamente.
- Atividades e Focos importados podem ser editados depois.
- O importador depende da versão Windows atualizada para o esquema v2; versões anteriores recusarão esse formato.
