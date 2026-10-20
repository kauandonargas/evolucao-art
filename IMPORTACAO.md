# Importação de sistemas no Evolução Art

O objetivo é cadastrar conjuntos de práticas sem inserir cada item manualmente. Você pode enviar o material a um assistente em texto livre (listas, esquemas, apostilas ou fotografias legíveis) e receber um pacote **JSON** no formato `evolucao-art.import/v1`. O próprio aplicativo **não utiliza IA e não interpreta texto livre**: ele valida e importa apenas o JSON já estruturado.

## Como usar

1. Envie o seu sistema em linguagem natural e descreva, se possível, os exercícios, dificuldades, metas e micro-habilidades. Não precisa converter nada manualmente.
2. Receba um `.json` preparado para o aplicativo. Revise com o assistente qualquer informação ambígua antes da importação.
3. No aplicativo, abra **Treino → Importar sistema de estudos…**.
4. Selecione o `.json` ou cole seu conteúdo. Clique em **Verificar e visualizar**.
5. Confira as quantidades e possíveis conflitos. Só então confirme em **Importar**.

O processo cria os vínculos entre Focos, fundamentos e exercícios. O nome do mestre, se houver, fica no fundamento associado ao Estudo de Mestres.

## Campos aceitos (versão 1)

| Entidade | Campos |
| --- | --- |
| Pacote | `schema`, `packageId`, `name`, `foundations`, `focuses`, `exercises` |
| Fundamento | `key`, `name`, `master` (opcional), `courseUrl` (opcional), `complexity` (1, 2 ou 3), `focusKeys` (opcional) |
| Foco | `key`, `title`, `concept`, `microSkill`, `courseUrl` (opcional) |
| Exercício | `key`, `title`, `area` (`drawing` ou `painting`), `foundationKey`, `focusKeys`, `difficulty` (`easy`, `medium` ou `hard`), `withReference` (número), `withoutReference` (número), `instructions` (opcional) |

`key` é um identificador estável em minúsculas, sem espaços. Um exercício pode fazer referência a vários Focos. As referências podem usar as chaves declaradas no mesmo pacote ou, para elementos já existentes no aplicativo, o nome exato do Foco/fundamento (desde que não seja ambíguo).

Amostra ilustrativa: `examples/exemplo-sistema-luz.json`.

## Segurança e integridade

- Antes de importar, o app valida nomes, vínculos, níveis, URLs e campos. **Campos não suportados bloqueiam a importação em vez de serem ignorados silenciosamente.**
- A prévia não grava nada. A confirmação faz uma atualização única dos metadados e mantém um backup do estado anterior em armazenamento local.
- Pacotes repetidos não recriam os mesmos itens. Itens já importados **não são sobrescritos**, preservando edições, avaliações e histórico.
- Títulos iguais criados sem a mesma identidade de importação são sinalizados como conflito para evitar mistura de conteúdo.
- **Imagens de Focos não são importadas nesta versão.** Os Focos podem começar apenas com texto; adicione referências pela Biblioteca de Focos quando quiser.
- O arquivo e o conteúdo importado ficam no dispositivo. O importador não envia dados ao GitHub ou a serviços externos.
- A importação não cria automaticamente progressões avançadas, calendários de estudo, avaliações históricas ou tipos de atividade que não existam atualmente no Evolução Art. Se seu sistema contiver esses elementos, eles precisam ser discutidos antes da conversão para não se perderem.
