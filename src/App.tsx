import { useMemo, useState } from 'react';
import { extractBridgeBlock, parseBridgeCommands } from './bridge/parser';
import { previewCommands } from './bridge/preview';

export default function App() {
  const [input, setInput] = useState('');
  const [raw, setRaw] = useState<string | null>(null);
  const [mode, setMode] = useState<'auto'|'raw'>('auto');

  const result = useMemo(() => raw ? parseBridgeCommands(raw) : null, [raw]);
  const preview = useMemo(() => result && result.ok ? previewCommands(result.commands) : [], [result]);

  const analyse = () => {
    if (mode === 'auto') {
      const block = extractBridgeBlock(input);
      if (!block) { alert('Aucun bloc bridge detecte.'); return; }
      setRaw(block);
    } else {
      setRaw(input);
    }
  };
  const reset = () => { setInput(''); setRaw(null); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Elganya Bridge <span className="text-cyan-400">Demo</span></h1>
        <p className="text-slate-400 text-sm mt-1">
          Analyse et previsualisation de commandes bridge. Aucune execution GitHub reelle.
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-semibold">1. Coller la reponse IA</h2>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setMode('auto')} className={'px-3 py-1 rounded ' + (mode==='auto'?'bg-cyan-600':'bg-slate-800')}>Bloc bridge</button>
              <button onClick={() => setMode('raw')}  className={'px-3 py-1 rounded ' + (mode==='raw' ?'bg-cyan-600':'bg-slate-800')}>JSON brut</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode==='auto' ? 'Colle ici une reponse contenant un bloc bridge' : 'Colle ici un tableau JSON brut'}
            className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs resize-y"
          />
          <div className="flex gap-2 mt-3">
            <button onClick={analyse} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg font-medium">Analyser</button>
            <button onClick={reset}   className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg">Reinitialiser</button>
          </div>
        </section>

        {result && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="font-semibold mb-3">2. Resultat du parsing</h2>
            {result.ok
              ? <p className="text-emerald-400 text-sm mb-3">OK — {result.commands.length} commande(s) valide(s)</p>
              : <p className="text-red-400 text-sm mb-3">KO — {result.errors.length} erreur(s)</p>}
            {result.errors.length > 0 && (
              <ul className="text-red-300 text-xs space-y-1 mb-3">
                {result.errors.map((e, i) => <li key={i}>[{e.index}] {e.reason}</li>)}
              </ul>
            )}
            {result.warnings.length > 0 && (
              <ul className="text-amber-300 text-xs space-y-1">
                {result.warnings.map((w, i) => <li key={i}>warn: {w}</li>)}
              </ul>
            )}
          </section>
        )}

        {preview.length > 0 && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="font-semibold mb-3">3. Apercu des commandes</h2>
            <ul className="space-y-2 text-sm">
              {preview.map(p => (
                <li key={p.index} className="flex items-start gap-3 bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <span className="text-cyan-400 font-mono text-xs mt-0.5">#{p.index}</span>
                  <div className="flex-1">
                    <div className="font-mono text-xs text-slate-300">{p.cmd}</div>
                    <div className="text-slate-100">{p.action}</div>
                    {p.bytes !== undefined && <div className="text-slate-500 text-xs">{p.bytes} octets</div>}
                    {p.elevated && <div className="text-amber-400 text-xs mt-1">Operation sensible — confirmation renforcee requise</div>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2 flex-wrap">
              <button disabled className="bg-slate-700 text-slate-400 px-4 py-2 rounded-lg cursor-not-allowed" title="Necessite un backend securise">
                Executer (desactive)
              </button>
              <span className="text-xs text-slate-500 self-center">
                L'execution reelle exige une Edge Function securisee.
              </span>
            </div>
          </section>
        )}

        <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
          <h2 className="font-semibold text-slate-200 mb-2 text-sm">Etat des connecteurs</h2>
          <ul className="space-y-1">
            <li>GitHub : <span className="text-amber-400">Connecteur requis (backend)</span></li>
            <li>Bolt : <span className="text-slate-500">Non configure</span></li>
            <li>Termux : <span className="text-slate-500">Non configure</span></li>
            <li>Horus : <span className="text-slate-500">Non configure</span></li>
            <li>Fournisseurs IA : <span className="text-slate-500">Aucun</span></li>
          </ul>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto mt-8 text-center text-xs text-slate-600">
        Elganya Bridge Demo — parseur + preview uniquement. Aucun secret, aucune execution.
      </footer>
    </div>
  );
}
