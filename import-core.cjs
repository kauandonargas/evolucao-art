'use strict';
/* BEGIN EA_IMPORT_CORE_v1: shared by Node tests and the browser (embedded). */
const EvolucaoImport = (() => {
  const schema = 'evolucao-art.import/v1';
  const fields = {
    root:['schema','packageId','name','foundations','focuses','exercises'],
    foundation:['key','name','master','courseUrl','complexity','focusKeys'],
    focus:['key','title','concept','microSkill','courseUrl'],
    exercise:['key','title','area','foundationKey','focusKeys','difficulty','withReference','withoutReference','instructions','progressMode','sheetTarget','sheetDone']
  };
  const keyPattern = /^[a-z0-9][a-z0-9_-]{0,63}$/;
  const MAX = 1000;
  const plain = v => v!==null && typeof v==='object' && !Array.isArray(v) && (Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null);
  const text = v => typeof v==='string'?v.trim():'';
  const folded = v => text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/\s+/g,' ');
  function error(message){throw new Error(message)}
  function keysOnly(value,kind,where){for(const key of Object.keys(value))if(!fields[kind].includes(key))error(`${where}: campo não suportado "${key}". Nenhuma informação será ignorada.`)}
  function str(value,where,max=6000,required=true){if(value!==undefined&&value!==null&&typeof value!=='string')error(`${where}: precisa ser texto.`);const v=text(value);if(required&&!v)error(`${where}: obrigatório.`);if(v.length>max)error(`${where}: limite de ${max} caracteres.`);return v}
  function key(value,where){const k=str(value,where,64);if(!keyPattern.test(k))error(`${where}: use letras minúsculas, números, _ ou -, começando por letra/número.`);return k}
  function url(value,where){const v=str(value??'',where,1000,false);if(!v)return '';let p;try{p=new URL(v)}catch{error(`${where}: endereço inválido.`)}if(!['http:','https:'].includes(p.protocol))error(`${where}: somente http:// ou https://.`);return p.href}
  function integer(value,where,lo,hi,defaultValue){if(value===undefined)return defaultValue;if(!Number.isInteger(value)||value<lo||value>hi)error(`${where}: informe inteiro entre ${lo} e ${hi}.`);return value}
  function array(value,where){if(value===undefined)return [];if(!Array.isArray(value))error(`${where}: precisa ser uma lista.`);return value}
  function linkKeys(value,where){const a=array(value,where);if(a.length>100)error(`${where}: máximo de 100 vínculos.`);const arr=a.map((v,i)=>str(v,`${where}[${i}]`,160));if(new Set(arr.map(folded)).size!==arr.length)error(`${where}: vínculos repetidos.`);return arr}
  function validate(input){
    const obj=typeof input==='string'?JSON.parse(input):input;
    if(!plain(obj))error('O pacote deve ser um objeto JSON.');
    keysOnly(obj,'root','pacote');if(![schema,'evolucao-art.import/v2'].includes(obj.schema))error(`Formato não reconhecido. Use "schema": "${schema}" ou "evolucao-art.import/v2".`);
    const result={schema:obj.schema,packageId:key(obj.packageId,'packageId'),name:str(obj.name,'name',120)};
    let total=0;
    for(const type of ['foundations','focuses','exercises']){
      const vals=array(obj[type],type);total+=vals.length;if(vals.length>MAX)error(`${type}: máximo ${MAX} itens.`);
      const seen=new Set();
      result[type]=vals.map((item,i)=>{
        const w=`${type}[${i}]`;
        if(!plain(item))error(`${w}: formato inválido.`);
        keysOnly(item,type==='foundations'?'foundation':type==='focuses'?'focus':'exercise',w);
        const k=key(item.key,`${w}.key`);if(seen.has(k))error(`${w}: identificador ${k} repetido.`);seen.add(k);
        if(type==='foundations')return {
          key:k,name:str(item.name,`${w}.name`,160),master:str(item.master??'',`${w}.master`,160,false),
          courseUrl:url(item.courseUrl,`${w}.courseUrl`),complexity:integer(item.complexity,`${w}.complexity`,1,3,2),focusKeys:linkKeys(item.focusKeys,`${w}.focusKeys`)
        };
        if(type==='focuses')return {
          key:k,title:str(item.title,`${w}.title`,160),concept:str(item.concept,`${w}.concept`,6000),
          microSkill:str(item.microSkill,`${w}.microSkill`,3000),courseUrl:url(item.courseUrl,`${w}.courseUrl`)
        };
        const area=str(item.area,`${w}.area`,20);if(!['drawing','painting'].includes(area))error(`${w}.area: use drawing ou painting.`);
        const difficulty=str(item.difficulty,`${w}.difficulty`,20);if(!['easy','medium','hard'].includes(difficulty))error(`${w}.difficulty: use easy, medium ou hard.`);
        const focusKeys=linkKeys(item.focusKeys,`${w}.focusKeys`);if(!focusKeys.length)error(`${w}.focusKeys: vincule pelo menos um Foco.`);
        const progressMode=str(item.progressMode??'standard',`${w}.progressMode`,20);
        if(!['standard','prtp','sheets'].includes(progressMode))error(`${w}.progressMode: use standard, prtp ou sheets.`);
        const withReference=integer(item.withReference,`${w}.withReference`,0,500,0);
        const withoutReference=integer(item.withoutReference,`${w}.withoutReference`,0,500,0);
        const sheetTarget=integer(item.sheetTarget,`${w}.sheetTarget`,0,500,0);
        const sheetDone=integer(item.sheetDone,`${w}.sheetDone`,0,500,0);
        if(obj.schema===schema && progressMode!=='standard')error(`${w}: use esquema v2 para os modos de progresso extras.`);
        if(progressMode==='prtp' && (withReference!==3||withoutReference!==6))error(`${w}: PRTP exige 3 estudos de referência e 6 de imaginação, com alternativa de 9 só de imaginação.`);
        if(progressMode==='sheets'&&(sheetTarget<1||sheetDone>sheetTarget||withReference!==0||withoutReference!==0))error(`${w}: metas em folhas devem definir sheetTarget >= sheetDone, sem exigir modalidade.`);
        if(progressMode!=='sheets' && (sheetTarget!==0||sheetDone!==0))error(`${w}: sheetTarget/sheetDone só se aplicam ao modo sheets.`);
        return {key:k,title:str(item.title,`${w}.title`,160),area,foundationKey:str(item.foundationKey,`${w}.foundationKey`,160),focusKeys,difficulty,
          withReference,withoutReference,progressMode,sheetTarget,sheetDone,
          instructions:str(item.instructions??'',`${w}.instructions`,6000,false)};
      });
    }
    if(total===0)error('O pacote está vazio.');
    if(total>1500)error('Máximo de 1.500 itens por pacote.');
    return result;
  }
  const collections = s => ({
    foundations:Array.isArray(s?.foundations)?s.foundations:[],
    focuses:Array.isArray(s?.focuses)?s.focuses:[],
    exercises:[...(s?.exercises?.drawing||[]).map(x=>({...x,area:'drawing'})),...(s?.exercises?.painting||[]).map(x=>({...x,area:'painting'}))]
  });
  function plan(input,state){
    const doc=validate(input),existing=collections(state),errors=[],warnings=[],newItems={foundations:[],focuses:[],exercises:[]},reused={foundations:[],focuses:[],exercises:[]};
    const resolvers={foundations:new Map(),focuses:new Map()};
    function claim(type,item){
      const imported=`${doc.packageId}/${type}/${item.key}`;
      const matches=existing[type].filter(x=>x.importRef===imported);
      if(matches.length>1){errors.push(`${type} ${item.key}: identificador de importação duplicado nos dados.`);return null}
      if(matches.length===1){reused[type].push({item,existingId:matches[0].id});warnings.push(`${type}: "${item.title||item.name}" já foi importado; será preservado sem sobrescrever.`);return {id:matches[0].id,isNew:false}}
      const n=folded(item.title||item.name);
      const collisions=existing[type].filter(x=>folded(x.title||x.name)===n && (type!=='exercises'||x.area===item.area));
      if(collisions.length){errors.push(`${type}: "${item.title||item.name}" já existe sem o mesmo identificador. Revise para evitar duplicação.`);return null}
      newItems[type].push(item);return {key:item.key,isNew:true};
    }
    for(const type of ['foundations','focuses','exercises']){
      const list=doc[type];for(const item of list){const ref=claim(type,item);if(ref&&type!=='exercises')resolvers[type].set(item.key,ref)}
    }
    function resolve(type,k){
      if(resolvers[type].has(k))return resolvers[type].get(k);
      const available=existing[type].filter(x=>x.importRef===`${doc.packageId}/${type}/${k}`||folded(x.title||x.name)===folded(k));
      if(available.length!==1)return null;
      return {id:available[0].id,isNew:false};
    }
    for(const f of doc.foundations){for(const k of f.focusKeys)if(!resolve('focuses',k))errors.push(`Fundamento "${f.name}": Foco "${k}" não encontrado.`)}
    for(const ex of doc.exercises){
      if(!resolve('foundations',ex.foundationKey))errors.push(`Exercício "${ex.title}": fundamento "${ex.foundationKey}" não encontrado.`);
      for(const k of ex.focusKeys)if(!resolve('focuses',k))errors.push(`Exercício "${ex.title}": Foco "${k}" não encontrado.`);
    }
    if(doc.focuses.some(x=>!existing.focuses.some(f=>f.importRef===`${doc.packageId}/focuses/${x.key}`)))warnings.push('Focos importados não recebem imagem automaticamente. Você pode adicionar imagens depois.');
    if(doc.foundations.some(x=>x.focusKeys.length&&reused.foundations.some(z=>z.item.key===x.key)))warnings.push('Vínculos novos de Focos podem ser acrescentados a fundamentos já existentes, sem remover os anteriores.');
    if(doc.exercises.length)warnings.push('As instruções são exibidas nos exercícios; avaliações e históricos anteriores não são alterados.');
    return {doc,errors,warnings,newItems,reused,counts:{foundations:newItems.foundations.length,focuses:newItems.focuses.length,exercises:newItems.exercises.length,existing:reused.foundations.length+reused.focuses.length+reused.exercises.length}};
  }
  function apply(planned,current,id,now=Date.now()){
    if(!planned||planned.errors.length)error('Existem erros pendentes. A importação foi bloqueada.');
    if(typeof id!=='function')error('Função geradora de identificadores não fornecida.');
    const state=JSON.parse(JSON.stringify(current));
    if(!Array.isArray(state.foundations))state.foundations=[];
    if(!Array.isArray(state.focuses))state.focuses=[];
    if(!plain(state.exercises))state.exercises={};
    for(const kind of ['drawing','painting'])if(!Array.isArray(state.exercises[kind]))state.exercises[kind]=[];
    const doc=planned.doc,map={foundations:new Map(),focuses:new Map()};
    function ref(type,item){return `${doc.packageId}/${type}/${item.key}`}
    function existingRecord(type,refValue){return type==='exercises'?['drawing','painting'].flatMap(k=>state.exercises[k]).find(x=>x.importRef===refValue):state[type].find(x=>x.importRef===refValue)}
    for(const type of ['foundations','focuses']){
      for(const item of doc[type]){
        let currentRecord=existingRecord(type,ref(type,item));
        if(!currentRecord){
          const named=state[type].filter(x=>folded(x.title||x.name)===folded(item.title||item.name));
          if(named.length)error(`Conflito inesperado ao importar "${item.title||item.name}".`);
          currentRecord=type==='foundations'?{id:id('f'),name:item.name,master:item.master,courseUrl:item.courseUrl,complexity:item.complexity,focusIds:[],artIds:[],importRef:ref(type,item)}:
            {id:id('focus'),title:item.title,concept:item.concept,microSkill:item.microSkill,courseUrl:item.courseUrl,imageIds:[],imageId:null,history:[],intervalDays:0,nextDue:now,createdAt:now,importRef:ref(type,item)};
          state[type].push(currentRecord);
        }
        map[type].set(item.key,currentRecord.id);
      }
    }
    function findRef(type,k){
      if(map[type].has(k))return map[type].get(k);
      const available=state[type].filter(x=>x.importRef===`${doc.packageId}/${type}/${k}`||folded(x.title||x.name)===folded(k));
      if(available.length!==1)error(`Referência ambígua ou ausente: ${type}/${k}`);
      return available[0].id;
    }
    for(const f of doc.foundations){const rec=state.foundations.find(x=>x.id===map.foundations.get(f.key));const ids=f.focusKeys.map(k=>findRef('focuses',k));rec.focusIds=[...new Set([...(rec.focusIds||[]),...ids])];}
    for(const e of doc.exercises){const importRef=ref('exercises',e),all=[...state.exercises.drawing,...state.exercises.painting];if(all.some(x=>x.importRef===importRef))continue;
      if((state.exercises[e.area]||[]).some(x=>folded(x.title)===folded(e.title)))error(`Conflito inesperado no exercício "${e.title}".`);
      state.exercises[e.area].push({id:id('ex'),title:e.title,difficulty:e.difficulty,foundationId:findRef('foundations',e.foundationKey),focusIds:e.focusKeys.map(k=>findRef('focuses',k)),refTarget:e.withReference,noRefTarget:e.withoutReference,
        instructions:e.instructions,progressMode:e.progressMode||'standard',sheetTarget:e.sheetTarget||0,sheetDone:e.sheetDone||0,entries:[],ratings:[],importRef});
    }
    return state;
  }
  return {schema,validate,plan,apply};
})();
if(typeof module==='object' && module.exports)module.exports=EvolucaoImport;
/* END EA_IMPORT_CORE_v1 */
