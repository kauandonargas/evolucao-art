# Importar sistemas de estudo — Evolução Art v3

O programa usa **um único sistema adaptativo**: Focos orientam habilidades prioritárias e avaliações de sessões calibram o desafio. Exercícios são reutilizáveis e podem ser repetidos sem limite. Imagens e metas de folhas não determinam conclusão ou domínio.

Em **Treino → Importar sistema de estudos**, selecione um JSON, revise a prévia e confirme.

O formato recomendado é `evolucao-art.import/v3`; cada exercício tem `key`, `title`, `area`, `foundationKey`, `focusKeys`, `difficulty`, `instructions` e `sourceNotes` opcional. Os antigos campos `progressMode`, `sheetTarget` e `sheetDone` NÃO são aceitos na v3; pacotes v1/v2 ainda são lidos e suas metas são mantidas como informação histórica, sem influenciar a recomendação.

Importações repetidas preservam IDs e avaliações. PDFs e imagens não são carregados automaticamente; seu pacote pessoal PRTP não é incluído no repositório público.
