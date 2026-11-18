/*
 * Efeitos sonoros sintetizados com a Web Audio API.
 * Nenhum arquivo de áudio: cada som é montado com osciladores e ruído filtrado.
 * O navegador só libera o áudio depois de um toque ou clique do usuário.
 */
window.Sons = (function () {
  let ctx = null;
  let saida = null;
  let ativo = true;
  let ruidoBuf = null;

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      saida = ctx.createGain();
      saida.gain.value = 0.55;
      const comp = ctx.createDynamicsCompressor();
      saida.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Um tom com envelope de ataque e decaimento exponencial.
  function tom(f, t0, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.tipo || "sine";
    osc.frequency.setValueAtTime(f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    const vol = o.vol == null ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + (o.ataque || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let no = osc;
    if (o.filtro) {
      const fl = ctx.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.value = o.filtro;
      osc.connect(fl);
      no = fl;
    }
    no.connect(g);
    g.connect(saida);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function ruido(t0, dur, o) {
    o = o || {};
    if (!ruidoBuf) {
      ruidoBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = ruidoBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = ruidoBuf;
    const fl = ctx.createBiquadFilter();
    fl.type = "bandpass";
    fl.Q.value = o.q || 1.2;
    fl.frequency.setValueAtTime(o.de || 600, t0);
    fl.frequency.exponentialRampToValueAtTime(o.ate || 3000, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.15, t0 + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(fl);
    fl.connect(g);
    g.connect(saida);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  const N = { C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, C7: 2093 };

  const biblioteca = {
    toque(t) { tom(900, t, 0.05, { tipo: "triangle", vol: 0.06 }); },
    selecionar(t) { tom(480, t, 0.09, { tipo: "triangle", vol: 0.12, f2: 720 }); },
    chip(t) { tom(660, t, 0.07, { tipo: "triangle", vol: 0.12 }); tom(990, t + 0.03, 0.08, { vol: 0.06 }); },
    acerto(t) {
      tom(N.C6, t, 0.16, { vol: 0.2 });
      tom(N.E6, t + 0.09, 0.38, { vol: 0.22 });
      tom(N.C7, t + 0.09, 0.3, { tipo: "triangle", vol: 0.04 });
    },
    erro(t) {
      tom(220, t, 0.18, { tipo: "square", vol: 0.08, f2: 170, filtro: 900 });
      tom(165, t + 0.14, 0.3, { tipo: "square", vol: 0.08, f2: 120, filtro: 700 });
    },
    combo(t, n) {
      const notas = [N.E5, N.G5, N.C6, N.E6, N.G6];
      const k = Math.min(5, 2 + Math.floor((n || 3) / 3));
      for (let i = 0; i < k; i++) tom(notas[i], t + i * 0.06, 0.16, { tipo: "triangle", vol: 0.13 });
      ruido(t, 0.3, { de: 2000, ate: 7000, vol: 0.04 });
    },
    iniciar(t) {
      ruido(t, 0.25, { de: 300, ate: 2400, vol: 0.06 });
      tom(N.G5, t + 0.05, 0.12, { tipo: "triangle", vol: 0.1 });
      tom(N.C6, t + 0.13, 0.2, { tipo: "triangle", vol: 0.12 });
    },
    concluir(t) {
      const seq = [N.C5, N.E5, N.G5, N.C6];
      seq.forEach((f, i) => tom(f, t + i * 0.1, 0.22, { tipo: "triangle", vol: 0.16 }));
      const tf = t + 0.42;
      [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f) => tom(f, tf, 1.1, { vol: 0.09, ataque: 0.02 }));
      tom(N.C7, tf, 0.9, { tipo: "triangle", vol: 0.03 });
      ruido(tf, 0.6, { de: 3000, ate: 9000, vol: 0.03 });
    },
    ofensiva(t) {
      ruido(t, 0.45, { de: 200, ate: 3500, vol: 0.12, q: 0.8 });
      tom(440, t + 0.15, 0.4, { tipo: "sawtooth", vol: 0.05, f2: 1320, filtro: 2500 });
      tom(N.E6, t + 0.45, 0.4, { vol: 0.14 });
      tom(N.G6, t + 0.52, 0.5, { vol: 0.1 });
    },
    desbloquear(t) {
      [N.G6, N.C7, N.E6, N.G6].forEach((f, i) => tom(f, t + i * 0.07, 0.18, { vol: 0.07 }));
      ruido(t, 0.5, { de: 4000, ate: 10000, vol: 0.03 });
    },
    bloqueado(t) {
      tom(300, t, 0.08, { tipo: "square", vol: 0.06, filtro: 1000 });
      tom(240, t + 0.09, 0.12, { tipo: "square", vol: 0.06, filtro: 900 });
    },
    tick(t) { tom(1500, t, 0.035, { tipo: "triangle", vol: 0.035 }); },
    meta(t) {
      [N.C6, N.D6, N.E6, N.G6].forEach((f, i) => tom(f, t + i * 0.08, 0.25, { vol: 0.1 }));
    },
    falha(t) {
      tom(N.G5, t, 0.2, { tipo: "triangle", vol: 0.12 });
      tom(N.E5, t + 0.18, 0.2, { tipo: "triangle", vol: 0.12 });
      tom(N.C5, t + 0.36, 0.45, { tipo: "triangle", vol: 0.12 });
    }
  };

  return {
    tocar(nome, arg) {
      if (!ativo || !biblioteca[nome]) return;
      const c = contexto();
      if (!c) return;
      try { biblioteca[nome](c.currentTime + 0.01, arg); } catch (e) { /* som é opcional */ }
    },
    get ativo() { return ativo; },
    set ativo(v) { ativo = !!v; }
  };
})();
