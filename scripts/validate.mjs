import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skill=path.join(root,'skills/teacher-webapp-review');
const refs=path.join(skill,'references');
const activities=fs.readdirSync(refs).filter(n=>/^activity-\d\d\.md$/.test(n)).sort();
assert.equal(activities.length,37);
const files=['SKILL.md','references/index.md','references/common.md',...activities.map(n=>'references/'+n)];
let prompts=0,localLinks=0;
for(const rel of files){
 const file=path.join(skill,rel),text=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 assert.ok(text.trim(),`Empty file: ${rel}`);
 if(rel.startsWith('references/'))prompts+=[...text.matchAll(/^```text\n/gm)].length;
 assert.equal([...text.matchAll(/^```/gm)].length%2,0,`Unclosed code fence: ${rel}`);
 for(const m of text.matchAll(/\]\(([^\s)]+)\)/g)){
  const url=m[1];
  if(/^(https?:|#)/.test(url))continue;
  const target=path.resolve(path.dirname(file),url.split('#')[0]);
  assert.ok(target.startsWith(skill+path.sep),`Outside skill: ${url}`);
  assert.ok(fs.existsSync(target),`Missing link: ${url}`);localLinks++;
 }
 // Real credential-like strings and workstation paths must never ship.
 assert.ok(!/(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|[CI]:[\\/]Users[\\/]|[CI]:[\\/]내 드라이브)/.test(text),`Potential private data: ${rel}`);
}
assert.equal(prompts,337);
const index=fs.readFileSync(path.join(refs,'index.md'),'utf8');
for(const name of activities)assert.equal(index.split(`](${name})`).length-1,1,`Activity missing or repeated: ${name}`);
console.log(JSON.stringify({activities:activities.length,prompts,localLinks,referenceChecks:'passed',liveWebappTested:false}));
