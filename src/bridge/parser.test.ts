import { describe, it, expect } from 'vitest';
import { extractBridgeBlock, parseBridgeCommands } from './parser';
import { previewCommands } from './preview';

const wrap = (obj: unknown) => '```bridge\n' + JSON.stringify(obj) + '\n```';

describe('parser', () => {
  it('01 import bloc valide', () => {
    const b = extractBridgeBlock(wrap([{ cmd:'create_repo', name:'x', private:true }]));
    expect(parseBridgeCommands(b).ok).toBe(true);
  });
  it('02 rejet JSON invalide', () => expect(parseBridgeCommands('{pas}').ok).toBe(false));
  it('03 rejet commande inconnue', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'rm'}])).ok).toBe(false));
  it('04 rejet chemin ..', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'create_file',repo:'a',path:'../x',content:''}])).ok).toBe(false));
  it('05 rejet chemin absolu', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'create_file',repo:'a',path:'/x',content:''}])).ok).toBe(false));
  it('06 rejet .env', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'create_file',repo:'a',path:'.env',content:''}])).ok).toBe(false));
  it('07 rejet .pem', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'create_file',repo:'a',path:'k.pem',content:''}])).ok).toBe(false));
  it('08 delete sans confirm', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'delete_file',repo:'a',path:'x',sha:'abc1234'}])).ok).toBe(false));
  it('09 delete sans sha', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'delete_file',repo:'a',path:'x',confirm:'DELETE'}])).ok).toBe(false));
  it('10 delete correct', () => {
    const r = parseBridgeCommands(JSON.stringify([{cmd:'delete_file',repo:'a',path:'x',sha:'abc1234',confirm:'DELETE'}]));
    expect(r.ok).toBe(true);
    expect(r.warnings.some(w=>w.includes('delete_file'))).toBe(true);
  });
  it('11 racine non-tableau', () => expect(parseBridgeCommands('{}').ok).toBe(false));
  it('12 tableau vide -> warning', () => {
    const r = parseBridgeCommands('[]');
    expect(r.ok).toBe(true);
    expect(r.warnings).toContain('tableau vide');
  });
  it('13 > 200 commandes', () => {
    const big = Array.from({length:201},()=>({cmd:'get_repo',repo:'a'}));
    expect(parseBridgeCommands(JSON.stringify(big)).ok).toBe(false);
  });
  it('14 preview pure', () => {
    const r = parseBridgeCommands(JSON.stringify([{cmd:'create_file',repo:'a',path:'x',content:'hi'}]));
    const p = previewCommands(r.commands);
    expect(p[0].bytes).toBe(2);
  });
  it('15 extraction tolerante', () => expect(extractBridgeBlock('x ```bridge  \n[]\n``` y')).toBe('[]'));
  it('16 extraction null', () => expect(extractBridgeBlock('rien')).toBeNull());
  it('17 name invalide', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'create_repo',name:'a b/c',private:true}])).ok).toBe(false));
  it('18 content non-string', () => expect(parseBridgeCommands(JSON.stringify([{cmd:'create_file',repo:'a',path:'x',content:42}])).ok).toBe(false));
});
