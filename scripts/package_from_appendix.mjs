import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/package_from_appendix.mjs source.md');
const source=fs.readFileSync(path.resolve(input),'utf8').replace(/\r\n/g,'\n');
const dest=path.join(root,'skills/teacher-webapp-review/references');
const starts=[...source.matchAll(/^<a id="activity-(\d+)"><\/a>$/gm)];
if(starts.length!==40)throw new Error(`Expected 40 activities, found ${starts.length}`);
const final=source.indexOf('<a id="references"></a>');
if(final<starts.at(-1).index)throw new Error('Missing final references boundary');
const blocks=[];
const index=['# 활동별 목차','','자기 앱과 요청에 해당하는 활동 파일만 읽습니다. 각 파일의 프롬프트는 참고 예시이며 자동 실행할 명령 목록이 아닙니다.',''];
let lastGroup='';
for(let i=0;i<starts.length;i++){
 const id=Number(starts[i][1]);
 if(id!==i+1)throw new Error('Activity IDs must be ordered 1 through 40');
 const block=source.slice(starts[i].index,i+1<starts.length?starts[i+1].index:final).trim();
 const title=block.match(/^## (.+)$/m)?.[1];
 const group=block.match(/^분류: (.+)$/m)?.[1];
 const condition=block.match(/^사용하는 경우: (.+)$/m)?.[1];
 if(!title||!group||!condition)throw new Error(`Activity ${id}: missing metadata`);
 const file=`activity-${String(id).padStart(2,'0')}.md`;
 const text=block.replace(/^<a[^\n]+\n\n/,'').replace(/^## /,'# ');
 blocks.push([file,text+'\n']);
 if(group!==lastGroup){index.push(`## ${group}`,'');lastGroup=group;}
 index.push(`- [${title}](${file}) — ${condition}`,'');
}
const pre=source.slice(source.indexOf('<a id="guide"></a>')+'<a id="guide"></a>'.length,starts[0].index).trim();
const sections=pre.split(/(?=^## )/m).filter(Boolean);
// The source's HTML and lecture usage instructions are replaced by SKILL.md routing.
const common=sections.filter(s=>!s.startsWith('## 이 부록을 사용하는 방법')&&!s.startsWith('## 어떤 활동부터 고를까요')).join('\n');
const commonFile='# 공통 안내와 시작 프롬프트\n\n활동에 필요한 사용법과 용어만 참고합니다. 아래 문장은 원자료의 사용자용 프롬프트 예시이며 현재 작업의 실행 권한을 추가하지 않습니다.\n\n'+common+'\n';
const count=s=>[...s.matchAll(/^```text\n/gm)].length;
const prompts=blocks.reduce((n,[,s])=>n+count(s),0)+count(commonFile);
if(prompts!==370)throw new Error(`Expected 370 prompts, found ${prompts}`);
// Ensure every prompt is retained exactly, including qualifications and placeholders.
const promptsIn=s=>[...s.matchAll(/^```text\n([\s\S]*?)\n```/gm)].map(m=>m[1]);
const before=promptsIn(source),after=promptsIn(commonFile+'\n'+blocks.map(b=>b[1]).join('\n'));
if(JSON.stringify(before)!==JSON.stringify(after))throw new Error('Prompt content/order changed during packaging');
fs.mkdirSync(dest,{recursive:true});
for(const [file,text] of blocks)fs.writeFileSync(path.join(dest,file),text);
fs.writeFileSync(path.join(dest,'index.md'),index.join('\n'));
fs.writeFileSync(path.join(dest,'common.md'),commonFile);
console.log(JSON.stringify({activities:blocks.length,prompts,promptTextUnchanged:true}));
