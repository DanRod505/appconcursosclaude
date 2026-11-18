/* Concurso+ · protótipo
 * App de página única em JavaScript puro. Telas por hash (#inicio, #revisao, #simulado, #progresso, #perfil).
 * O progresso fica no localStorage do navegador e começa com dados de demonstração.
 */
(function () {
  "use strict";

  const CURSO = window.CURSO;
  const Sons = window.Sons;
  const CHAVE = "concursomais.v1";
  const DIA = 864e5;
  const HORA = 36e5;
  const META = 30;
  const NOME_MASCOTE = "Neuro";
  const reduzMov = window.matchMedia("(prefers-reduced-motion: reduce)");
  const temaEscuroSO = window.matchMedia("(prefers-color-scheme: dark)");

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const sortear = (a) => a[Math.floor(Math.random() * a.length)];
  function embaralhar(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function diaISO(ts) {
    const d = new Date(ts);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  const hojeISO = () => diaISO(Date.now());
  const ontemISO = () => diaISO(Date.now() - DIA);
  function mmss(seg) { seg = Math.max(0, Math.round(seg)); return Math.floor(seg / 60) + ":" + String(seg % 60).padStart(2, "0"); }
  function duracao(seg) { const h = Math.floor(seg / 3600), m = Math.round((seg % 3600) / 60); return h ? h + "h" + String(m).padStart(2, "0") + "min" : m + " min"; }

  /* ---------- Curso achatado ---------- */
  const LICOES = [];
  const Q = {};
  CURSO.unidades.forEach((u) => {
    u.licoes.forEach((l) => {
      l.unidade = u;
      l.ordem = LICOES.length;
      LICOES.push(l);
      (l.questoes || []).forEach((q) => { q.licao = l; Q[q.id] = q; });
    });
  });
  const TODAS = Object.values(Q);
  const questoesDaUnidade = (u) => u.licoes.flatMap((l) => l.questoes || []);

  /* ---------- Estado ---------- */
  function semente() {
    const agora = Date.now();
    const mem = {};
    const l1 = LICOES[0].questoes, l2 = LICOES[1].questoes;
    [[96, 4], [60, 3], [30, 3], [72, 5], [20, 2]].forEach(([h, d], i) => { mem[l1[i].id] = { h, t: agora - d * DIA - 3 * HORA }; });
    [[30, 2], [40, 1], [14, 2], [60, 1], [22, 2]].forEach(([h, d], i) => { mem[l2[i].id] = { h, t: agora - d * DIA - 5 * HORA }; });
    const xpDia = {};
    [35, 20, 50, 30, 40, 25].forEach((xp, i) => { xpDia[diaISO(agora - (6 - i) * DIA)] = xp; });
    return {
      v: 1,
      nome: "Concurseiro",
      estilo: document.documentElement.dataset.style === "glass" ? "glass" : "neo",
      tema: "sistema",
      som: true,
      xp: 340,
      streak: 12,
      ultimoDia: ontemISO(),
      congelamentos: 2,
      concluidas: { [LICOES[0].id]: { acc: 100 }, [LICOES[1].id]: { acc: 80 } },
      mem,
      xpDia,
      stats: { resp: 120, acertos: 101, tempo: 67200 },
      simulados: [{ data: agora - 2 * DIA, acertos: 7, total: 10, tempo: 341 }],
      perfeitas: 1
    };
  }
  function carregar() {
    try {
      const s = localStorage.getItem(CHAVE);
      if (s) { const o = JSON.parse(s); if (o && o.v === 1) return o; }
    } catch (e) { /* armazenamento indisponível */ }
    return semente();
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* ignora */ } }
  let E = carregar();
  Sons.ativo = E.som;

  // Ofensiva: dias perdidos consomem bloqueios; sem bloqueio, a ofensiva zera.
  let avisoInicial = null;
  (function verificarOfensiva() {
    const hoje = hojeISO();
    if (E.ultimoDia === hoje || E.ultimoDia === ontemISO()) return;
    const faltas = Math.round((new Date(hoje) - new Date(E.ultimoDia)) / DIA) - 1;
    if (faltas > 0 && faltas <= E.congelamentos) {
      E.congelamentos -= faltas;
      E.ultimoDia = ontemISO();
      avisoInicial = "Bloqueio de ofensiva usado. Sua ofensiva está salva!";
    } else if (E.streak > 0) {
      E.streak = 0;
    }
    salvar();
  })();

  /* ---------- Regras ---------- */
  const licaoAtual = () => LICOES.find((l) => !E.concluidas[l.id]) || null;
  function estadoLicao(l) {
    if (E.concluidas[l.id]) return "feito";
    return l === licaoAtual() ? "atual" : "bloqueado";
  }
  function forca(id) {
    const m = E.mem[id];
    if (!m) return null;
    return Math.pow(2, -(Date.now() - m.t) / (m.h * HORA));
  }
  function registrarMemoria(q, acertou) {
    const m = E.mem[q.id];
    if (!m) { E.mem[q.id] = { h: acertou ? 48 : 12, t: Date.now() }; return; }
    m.h = acertou ? Math.min(m.h * 2, 24 * 180) : Math.max(6, m.h / 2);
    m.t = Date.now();
  }
  function forcaLicao(l) {
    const vals = (l.questoes || []).map((q) => forca(q.id)).filter((v) => v != null);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function classeForca(f) { return f >= 0.7 ? "forte" : f >= 0.4 ? "morna" : "fria"; }
  function rotuloForca(f) { return f >= 0.7 ? "Firme" : f >= 0.4 ? "Esfriando" : "Precisa revisar"; }
  function corForca(f) { return f >= 0.7 ? "var(--accent)" : f >= 0.4 ? "var(--gold)" : "var(--danger)"; }
  const licoesParaRevisar = () => LICOES.filter((l) => { const f = forcaLicao(l); return f != null && f < 0.5; });

  const xpHoje = () => E.xpDia[hojeISO()] || 0;
  function xpSemana() {
    let s = 0;
    for (let i = 0; i < 7; i++) s += E.xpDia[diaISO(Date.now() - i * DIA)] || 0;
    return s;
  }
  const RIVAIS = [
    ["Ana P.", 312, 150], ["Marcos T.", 268, 210], ["Juliana R.", 231, 330], ["Rafael S.", 214, 25],
    ["Bianca L.", 189, 280], ["Diego M.", 172, 190], ["Larissa F.", 151, 350], ["Thiago C.", 133, 40],
    ["Camila A.", 108, 300], ["Pedro H.", 91, 220], ["Fernanda O.", 63, 10], ["Lucas V.", 38, 260]
  ];
  function ranking() {
    const eu = { nome: E.nome || "Você", xp: xpSemana(), hue: 145, eu: true };
    return RIVAIS.map(([nome, xp, hue]) => ({ nome, xp, hue })).concat([eu]).sort((a, b) => b.xp - a.xp);
  }
  const minhaPosicao = () => ranking().findIndex((r) => r.eu) + 1;
  function diasAteDomingo() { const d = new Date().getDay(); return d === 0 ? 1 : 7 - d + 1; }

  function saudacao() {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  }
  const FALAS = {
    inicio: [
      "Cinco minutinhos hoje valem mais que cinco horas no domingo.",
      "Bora garantir a ofensiva de hoje?",
      "A banca não descansa. A gente também não.",
      "Direito Administrativo é meu assunto favorito. Vamos?"
    ],
    inicioFeito: ["Ofensiva garantida hoje! Quer aproveitar e revisar?", "Meta batida. Seu eu do futuro agradece!"],
    licao: ["Vamos praticar?", "Leia com calma. A banca adora uma pegadinha.", "Respira e confia no que você estudou."],
    simulado: ["Modo prova: o gabarito só aparece no final.", "Olho no relógio e foco no enunciado."],
    acerto: ["Isso aí! A banca que lute.", "Acertou! Já sinto o cheiro da posse.", "Mandou bem! Mais um passo até o Diário Oficial.", "Perfeito! Seu cérebro agradece."],
    erro: ["Errar aqui é melhor que errar na prova.", "Calma, essa pega muita gente.", "Essa volta no fim da lição. Você vai acertar!"],
    erroTeste: ["Anota essa e segue em frente.", "Tudo bem, o teste mostra onde focar."],
    combo: ["Que sequência! Tá pegando fogo!", "Ninguém segura!"]
  };

  /* ---------- Aparência ---------- */
  function temaEfetivoEscuro() {
    const t = document.documentElement.dataset.theme;
    return t ? t === "dark" : temaEscuroSO.matches;
  }
  function aplicarAparencia() {
    const r = document.documentElement;
    r.dataset.style = E.estilo;
    if (E.tema === "sistema") delete r.dataset.theme;
    else r.dataset.theme = E.tema === "escuro" ? "dark" : "light";
  }
  function icones() {
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons({ icons: window.lucide.icons }); } catch (e) { /* ícones são opcionais */ }
    }
  }
  const ic = (nome) => '<i data-lucide="' + nome + '"></i>';

  function seletorEstilo(mini) {
    return '<div class="seg ' + (mini ? "mini" : "") + '" role="group" aria-label="Estilo visual">' +
      '<button type="button" data-acao="estilo" data-valor="neo" aria-pressed="' + (E.estilo === "neo") + '">Neo</button>' +
      '<button type="button" data-acao="estilo" data-valor="glass" aria-pressed="' + (E.estilo === "glass") + '">Glass</button></div>';
  }
  function seletorTema() {
    const op = [["sistema", "monitor", "Sistema"], ["claro", "sun", "Claro"], ["escuro", "moon", "Escuro"]];
    return '<div class="seg" role="group" aria-label="Tema">' + op.map(([v, i, t]) =>
      '<button type="button" data-acao="tema-def" data-valor="' + v + '" aria-pressed="' + (E.tema === v) + '" title="' + t + '">' + ic(i) + '<span>' + t + '</span></button>').join("") + "</div>";
  }

  /* ---------- Anel SVG ---------- */
  function anel(pct, tam, esp, conteudo, grad) {
    const r = (tam - esp) / 2, c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, pct)));
    return '<div class="anel" style="width:' + tam + 'px;height:' + tam + 'px"><svg width="' + tam + '" height="' + tam + '" aria-hidden="true">' +
      '<circle class="trk" cx="' + tam / 2 + '" cy="' + tam / 2 + '" r="' + r + '" stroke-width="' + esp + '"/>' +
      '<circle class="val" cx="' + tam / 2 + '" cy="' + tam / 2 + '" r="' + r + '" stroke-width="' + esp + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" style="stroke:url(#' + (grad || "gradAnel") + ')"/>' +
      '</svg><div class="centro">' + (conteudo || "") + "</div></div>";
  }

  /* ---------- Blocos reutilizáveis ---------- */
  function semanaHTML() {
    const nomes = ["D", "S", "T", "Q", "Q", "S", "S"];
    let h = '<div class="semana">';
    for (let i = 6; i >= 0; i--) {
      const ts = Date.now() - i * DIA;
      const on = (E.xpDia[diaISO(ts)] || 0) > 0;
      h += "<span>" + nomes[new Date(ts).getDay()] + '<i class="' + (on ? "on" : "") + (i === 0 ? " hoje" : "") + '"></i></span>';
    }
    return h + "</div>";
  }
  function cardOfensiva() {
    const feitoHoje = E.ultimoDia === hojeISO();
    return '<article class="card mini-card"><div class="linha"><h3>Ofensiva</h3><span class="' + (feitoHoje ? "fogo-ico" : "fogo-ico apagado") + '">' + ic("flame") + "</span></div>" +
      '<div><div class="num">' + E.streak + ' <small style="font-size:15px">dias</small></div><div class="sub">' + (feitoHoje ? "Garantida hoje" : "Faça 1 lição para manter") + "</div></div>" + semanaHTML() + "</article>";
  }
  function cardMeta() {
    const x = xpHoje();
    const pct = Math.min(1, x / META);
    return '<article class="card mini-card"><div class="linha"><h3>Meta diária</h3><span style="color:var(--accent)">' + ic("target") + "</span></div>" +
      '<div><div class="num">' + Math.min(x, 999) + '<small style="font-size:15px;color:var(--fg-2)"> / ' + META + ' XP</small></div><div class="sub">' + (pct >= 1 ? "Meta concluída!" : "Faltam " + (META - x) + " XP") + "</div></div>" +
      '<div class="barra peq ' + (pct >= 1 ? "ouro" : "") + '"><i style="--p:' + Math.round(pct * 100) + '%"></i></div></article>';
  }
  function ligaHTML(compacto) {
    const r = ranking();
    const pos = r.findIndex((x) => x.eu);
    let lista = r.map((x, i) => Object.assign({ pos: i + 1 }, x));
    if (compacto) {
      const ini = Math.max(0, Math.min(pos - 2, lista.length - 5));
      lista = lista.slice(ini, ini + 5);
    }
    const n = r.length;
    let h = '<ol class="liga-lista">';
    lista.forEach((x, idx) => {
      const sobe = x.pos <= 3, desce = x.pos > n - 3;
      if (!compacto && x.pos === 4) h += '<li class="liga-zona sobe" aria-hidden="true">Zona de promoção</li>';
      if (!compacto && x.pos === n - 2) h += '<li class="liga-zona desce" aria-hidden="true">Zona de rebaixamento</li>';
      const ini = x.nome.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
      h += '<li class="' + (x.eu ? "eu " : "") + (sobe ? "sobe" : desce ? "desce" : "") + '"><span class="pos">' + x.pos + '</span>' +
        '<span class="av" style="background:hsl(' + x.hue + ' 55% 46%)">' + ini + '</span><span class="nome">' + (x.eu ? x.nome + " (você)" : x.nome) + '</span><span class="pts">' + x.xp + " XP</span></li>";
      void idx;
    });
    return h + "</ol>";
  }
  function cabLiga() {
    return '<div class="liga-cab"><span class="escudo">' + ic("gem") + '</span><div><h3>Liga Esmeralda</h3><small>Grupo TRT · termina em ' + diasAteDomingo() + " dia" + (diasAteDomingo() > 1 ? "s" : "") + "</small></div></div>";
  }

  /* ---------- Telas ---------- */
  function viewInicio() {
    const atual = licaoAtual();
    const feitoHoje = E.ultimoDia === hojeISO();
    let h = '<section class="card saudacao"><div><span class="eyebrow">' + CURSO.concurso + "</span>" +
      "<h1>" + saudacao() + ", " + esc(E.nome || "concurseiro") + "!</h1>" +
      '<p class="fala">' + sortear(feitoHoje ? FALAS.inicioFeito : FALAS.inicio) + "</p></div>" +
      '<img class="mascote flutua" src="mascote.webp" alt="' + NOME_MASCOTE + ', o mascote do app"></section>';
    h += '<div class="resumo-dia so-estreito">' + cardOfensiva() + cardMeta() + "</div>";
    if (atual) {
      h += '<article class="card continuar"><span class="ico-disc">' + ic("scale") + '</span><div class="txt"><span>' + CURSO.disciplina + "</span><b>" +
        (atual.tipo === "desafio" ? atual.titulo : "Próxima: " + atual.titulo) + "</b></div>" +
        '<button class="play" data-acao="comecar" data-id="' + atual.id + '" aria-label="Começar ' + atual.titulo + '">' + ic("play") + "</button></article>";
    }
    CURSO.unidades.forEach((u, ui) => { h += unidadeHTML(u, ui); });
    h += '<article class="card em-breve"><span class="eyebrow">Próximas unidades</span><ul>' +
      CURSO.proximas.map((p) => "<li>" + ic("lock") + p + "</li>").join("") + "</ul></article>";
    return h;
  }
  function unidadeHTML(u, ui) {
    let h = '<section class="unidade" style="--u1:' + u.cor[0] + ";--u2:" + u.cor[1] + ";--u3:" + u.cor[2] + '">' +
      '<header class="unidade-banner"><div><span class="eyebrow">Unidade ' + (ui + 1) + "</span><h2>" + u.titulo + "</h2><p>" + u.subtitulo + "</p></div>" +
      '<button class="btn-guia" data-acao="guia" data-id="' + u.id + '">' + ic("book-open") + "Resumo</button></header>" +
      '<div class="trilha" data-unidade="' + u.id + '"><svg class="conector" aria-hidden="true"></svg>';
    u.licoes.forEach((l, i) => {
      const est = estadoLicao(l);
      const x = l.tipo === "desafio" ? 0 : Math.round(Math.sin(i * 1.15 + 0.5) * 62);
      const icone = est === "bloqueado" ? (l.tipo === "desafio" ? "trophy" : "lock") : l.icone;
      h += '<div class="no-wrap ' + est + '" style="--x:' + x + 'px" data-wrap="' + l.id + '">' +
        (est === "atual" ? '<span class="balao-comecar">COMEÇAR</span>' : "") +
        '<button class="no ' + est + (l.tipo === "desafio" ? " desafio" : "") + '" data-acao="no" data-id="' + l.id + '" aria-label="' + l.titulo + " (" + (est === "feito" ? "concluída" : est === "atual" ? "disponível" : "bloqueada") + ')">' + ic(icone) +
        (est === "feito" ? '<span class="selo">' + ic("check") + "</span>" : "") + "</button>" +
        '<span class="no-rotulo">' + l.titulo + "</span>" +
        (est === "atual" ? '<img class="mascote mascote-trilha flutua ' + (x >= 0 ? "esq" : "dir") + '" src="mascote.webp" alt="">' : "") +
        "</div>";
    });
    return h + "</div></section>";
  }

  function viewRevisao() {
    const vistas = TODAS.filter((q) => E.mem[q.id]);
    const fracas = vistas.filter((q) => forca(q.id) < 0.5).length;
    let h = '<header class="pag-cab"><span class="eyebrow">Repetição espaçada</span><h1>Revisão inteligente</h1>' +
      "<p>Cada questão tem uma meia-vida na sua memória. Acertou, ela dobra. Errou, cai pela metade. A revisão chega antes do esquecimento.</p></header>";
    h += '<section class="card revisao-hero"><img class="mascote flutua" src="mascote.webp" alt="">' +
      "<div><h2>" + (vistas.length ? (fracas ? fracas + " questões esfriando" : "Memória em dia!") : "Nada para revisar ainda") + "</h2>" +
      "<p>" + (vistas.length ? "Separei as " + Math.min(6, vistas.length) + " questões que você está mais perto de esquecer." : "Faça sua primeira lição e eu começo a acompanhar sua memória.") + "</p>" +
      (vistas.length ? '<button class="btn btn-primario" data-acao="revisar-tudo">' + ic("rotate-ccw") + "Revisar agora</button>" : "") + "</div></section>";
    const lista = LICOES.map((l) => ({ l, f: forcaLicao(l) })).filter((x) => x.f != null).sort((a, b) => a.f - b.f);
    if (lista.length) {
      h += '<section class="bloco card"><div class="bloco-cab"><h2>Força da memória por lição</h2><small>agora</small></div><ul class="memoria-lista">';
      lista.forEach(({ l, f }) => {
        h += '<li class="card"><span class="ico">' + ic(l.icone) + '</span><div class="txt"><b>' + l.titulo + '</b>' +
          '<div class="barra peq forca" style="--cor-forca:' + corForca(f) + '"><i style="--p:' + Math.round(f * 100) + '%"></i></div>' +
          '<span class="estado ' + classeForca(f) + '">' + rotuloForca(f) + " · " + Math.round(f * 100) + "%</span></div>" +
          '<button class="btn btn-sec peq" data-acao="revisar-licao" data-id="' + l.id + '">Revisar</button></li>';
      });
      h += "</ul></section>";
    }
    return h;
  }

  function viewSimulado() {
    let h = '<header class="pag-cab"><span class="eyebrow">Modo prova</span><h1>Simulados</h1><p>Questões de todas as lições, com cronômetro. O gabarito comentado só aparece no final, como na prova.</p></header>';
    h += '<section class="card sim-hero"><div style="display:flex;flex-direction:column;gap:10px"><h2>Simulado relâmpago</h2>' +
      '<ul><li class="tag">' + ic("file-text") + "10 questões</li><li class=\"tag\">" + ic("timer") + "8 minutos</li><li class=\"tag\">" + ic("zap") + "2 XP por acerto</li></ul>" +
      "<p>Mistura múltipla escolha, certo ou errado e lacunas.</p></div>" +
      '<img class="mascote flutua" src="mascote.webp" alt=""><button class="btn btn-ouro" data-acao="simulado">' + ic("play") + "Iniciar simulado</button></section>";
    h += '<section class="bloco card"><div class="bloco-cab"><h2>Histórico</h2><small>' + E.simulados.length + " feito" + (E.simulados.length === 1 ? "" : "s") + "</small></div>";
    if (E.simulados.length) {
      h += '<ul class="hist-lista">' + E.simulados.slice(0, 6).map((s) => {
        const pct = Math.round((100 * s.acertos) / s.total);
        return '<li class="card"><div><b>' + s.acertos + "/" + s.total + '</b> <small>· ' + pct + "% de acerto</small><br><small>" +
          new Date(s.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " + mmss(s.tempo) + "</small></div>" +
          '<div class="anel-mini">' + anel(pct / 100, 46, 6, "", pct >= 70 ? "gradAnel" : "gradOuro") + "</div></li>";
      }).join("") + "</ul>";
    } else {
      h += "<p style=\"color:var(--fg-2);font-weight:600\">Seu primeiro simulado aparece aqui.</p>";
    }
    return h + "</section>";
  }

  function viewProgresso() {
    const acc = E.stats.resp ? Math.round((100 * E.stats.acertos) / E.stats.resp) : 0;
    let h = '<header class="pag-cab"><span class="eyebrow">Seu desempenho</span><h1>Progresso</h1></header>';
    h += '<section class="card ofensiva-grande">' + anel(Math.min(1, E.streak / 30), 148, 14,
      '<div><span class="chama-grande">' + ic("flame") + '</span><div class="num">' + E.streak + "</div><small>dias seguidos</small></div>", "gradFogo") +
      '<div class="info"><h2 style="font-size:22px">Ofensiva de ' + E.streak + " dias</h2><p>Próximo marco: 30 dias. Você tem " + E.congelamentos +
      ' bloqueio' + (E.congelamentos === 1 ? "" : "s") + " de ofensiva para dias corridos.</p>" + semanaHTML() + "</div></section>";
    h += '<div class="grade-tiles">' +
      '<div class="card stat"><span class="ico" style="color:var(--accent)">' + ic("target") + "</span><b>" + acc + "%</b><span>de acertos</span></div>" +
      '<div class="card stat"><span class="ico" style="color:var(--sel)">' + ic("clock") + "</span><b>" + duracao(E.stats.tempo) + "</b><span>de estudo</span></div>" +
      '<div class="card stat"><span class="ico" style="color:var(--gold)">' + ic("zap") + "</span><b>" + E.xp + "</b><span>XP total</span></div></div>";
    // Gráfico semanal
    const dias = [];
    for (let i = 6; i >= 0; i--) { const ts = Date.now() - i * DIA; dias.push({ ts, xp: E.xpDia[diaISO(ts)] || 0, hoje: i === 0 }); }
    const max = Math.max(META, ...dias.map((d) => d.xp));
    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    h += '<section class="card bloco"><div class="bloco-cab"><h2>XP nos últimos 7 dias</h2><small>' + xpSemana() + ' XP</small></div><div class="grafico">' +
      dias.map((d, i) => '<div class="col' + (d.hoje ? " hoje" : "") + '"><em>' + d.xp + '</em><i style="--h:' + Math.round((d.xp / max) * 100) + "%;animation-delay:" + i * 0.05 + 's"></i><span>' + nomes[new Date(d.ts).getDay()] + "</span></div>").join("") +
      "</div></section>";
    h += '<section class="card bloco">' + cabLiga() + ligaHTML(false) + "</section>";
    // Conquistas
    const u1 = CURSO.unidades[0].licoes.every((l) => E.concluidas[l.id]);
    const desafio = LICOES.some((l) => l.tipo === "desafio" && E.concluidas[l.id]);
    const cq = [
      ["Primeira lição", "book-open", "#2fbf69", true, "Feito"],
      ["7 dias seguidos", "flame", "#ff7a1a", E.streak >= 7, E.streak >= 7 ? "Feito" : E.streak + "/7"],
      ["Lição perfeita", "star", "#f2a516", E.perfeitas > 0, E.perfeitas > 0 ? E.perfeitas + "×" : "0/1"],
      ["1º simulado", "trophy", "#2f7fe0", E.simulados.length > 0, E.simulados.length ? "Feito" : "0/1"],
      ["Desafio vencido", "swords", "#8b5cf6", desafio, desafio ? "Feito" : "0/1"],
      ["Mestre dos princípios", "landmark", "#17869a", u1, u1 ? "Feito" : "Unidade 1"],
      ["30 dias seguidos", "crown", "#e0a106", E.streak >= 30, Math.min(E.streak, 30) + "/30"]
    ];
    h += '<section class="card bloco"><div class="bloco-cab"><h2>Conquistas</h2><small>' + cq.filter((c) => c[3]).length + "/" + cq.length + '</small></div><div class="conquistas">' +
      cq.map((c) => '<div class="card conquista' + (c[3] ? "" : " travada") + '" style="--cor:' + c[2] + '"><span class="medalha">' + ic(c[1]) + "</span><b>" + c[0] + "</b><small>" + c[4] + "</small></div>").join("") +
      "</div></section>";
    return h;
  }

  function viewPerfil() {
    let h = '<header class="pag-cab"><span class="eyebrow">Ajustes</span><h1>Perfil</h1><p>Compare os dois estilos e os dois temas. A escolha vale para o app inteiro.</p></header>';
    h += '<section class="card bloco"><div class="campo"><label for="nome">Como devo te chamar?</label><input type="text" id="nome" maxlength="24" value="' + esc(E.nome) + '" autocomplete="off"></div></section>';
    h += '<section class="card bloco"><h2>Estilo visual</h2><div class="estilos-escolha">' +
      '<button class="estilo-opcao" data-acao="estilo" data-valor="neo" aria-pressed="' + (E.estilo === "neo") + '"><span class="previa neo"><i></i></span><b>Neumorphism</b><small>Relevo suave, sombras claras e escuras</small></button>' +
      '<button class="estilo-opcao" data-acao="estilo" data-valor="glass" aria-pressed="' + (E.estilo === "glass") + '"><span class="previa glass"><i></i></span><b>Glassmorphism</b><small>Vidro fosco sobre fundo vivo</small></button></div>' +
      '<div class="campo"><span class="rotulo">Tema</span>' + seletorTema() + "</div></section>";
    h += '<section class="card bloco"><div class="linha-config"><div><b>Efeitos sonoros</b><small>Acerto, erro, combo, conclusão e desbloqueio</small></div>' +
      '<button class="switch" role="switch" aria-checked="' + E.som + '" aria-label="Efeitos sonoros" data-acao="som"></button></div>' +
      '<div class="botoes-som">' + [["acerto", "Acerto"], ["erro", "Erro"], ["combo", "Combo"], ["concluir", "Conclusão"], ["ofensiva", "Ofensiva"], ["desbloquear", "Desbloqueio"]]
        .map(([s, t]) => '<button class="btn btn-sec peq" data-acao="testar-som" data-valor="' + s + '">' + ic("volume-2") + t + "</button>").join("") + "</div></section>";
    h += '<section class="card bloco"><div class="linha-config"><div><b>Reiniciar demonstração</b><small>Volta para os dados de exemplo: 12 dias de ofensiva e 2 lições concluídas.</small></div>' +
      '<button class="btn btn-sec peq" data-acao="reset">' + ic("rotate-ccw") + "Reiniciar</button></div></section>";
    return h;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  const VIEWS = { inicio: viewInicio, revisao: viewRevisao, simulado: viewSimulado, progresso: viewProgresso, perfil: viewPerfil };
  const NAV = [["inicio", "home", "Início"], ["revisao", "brain", "Revisão"], ["simulado", "clipboard-check", "Simulado"], ["progresso", "bar-chart-3", "Progresso"], ["perfil", "user", "Perfil"]];
  const rota = () => { const h = location.hash.slice(1); return VIEWS[h] ? h : "inicio"; };

  function navHTML(r) {
    const pend = licoesParaRevisar().length;
    return NAV.map(([id, i, t]) => '<a class="nav-item" href="#' + id + '"' + (r === id ? ' aria-current="page"' : "") + ">" + ic(i) + "<span>" + t + "</span>" +
      (id === "revisao" && pend ? '<span class="contador">' + pend + "</span>" : "") + "</a>").join("");
  }
  function renderCasca(r) {
    $("#topo").innerHTML = '<div class="topo-inner card"><span class="chip-stat fogo" title="Ofensiva">' + ic("flame") + E.streak + "</span>" +
      '<span class="chip-stat xp" title="XP total">' + ic("zap") + E.xp + '</span><span class="espaco"></span>' + seletorEstilo(true) +
      '<button class="icone-btn" data-acao="tema" aria-label="Alternar tema claro ou escuro">' + ic(temaEfetivoEscuro() ? "sun" : "moon") + "</button></div>";
    $("#navbar").innerHTML = '<div class="navbar-inner card">' + navHTML(r) + "</div>";
    $("#lateral").innerHTML = '<div class="marca"><img src="mascote.webp" alt=""><b>Concurso+</b></div><nav aria-label="Navegação">' + navHTML(r) + "</nav>" +
      '<div class="lateral-rodape card"><span class="eyebrow">Estilo</span>' + seletorEstilo(false) + '<span class="eyebrow">Tema</span>' +
      '<div class="seg" role="group" aria-label="Tema"><button data-acao="tema-def" data-valor="claro" aria-pressed="' + !temaEfetivoEscuro() + '">' + ic("sun") + 'Claro</button><button data-acao="tema-def" data-valor="escuro" aria-pressed="' + temaEfetivoEscuro() + '">' + ic("moon") + "Escuro</button></div></div>";
    const fraca = LICOES.map((l) => ({ l, f: forcaLicao(l) })).filter((x) => x.f != null).sort((a, b) => a.f - b.f)[0];
    $("#aside").innerHTML =
      '<div class="card stats-linha"><span class="chip-stat fogo" title="Ofensiva">' + ic("flame") + E.streak + '</span><span class="chip-stat xp" title="XP total">' + ic("zap") + E.xp +
      '</span><span class="chip-stat gelo" title="Bloqueios de ofensiva">' + ic("snowflake") + E.congelamentos + "</span>" +
      '<button class="icone-btn" data-acao="tema" aria-label="Alternar tema claro ou escuro">' + ic(temaEfetivoEscuro() ? "sun" : "moon") + "</button></div>" +
      cardOfensiva() + cardMeta() +
      '<div class="card">' + cabLiga() + ligaHTML(true) + '<a class="btn-texto" href="#progresso" style="align-self:flex-start">Ver liga completa</a></div>' +
      (fraca ? '<div class="card dica"><img class="mascote" src="mascote.webp" alt=""><p><b>Dica do ' + NOME_MASCOTE + ":</b> sua memória de <b>" + fraca.l.titulo + "</b> está em " + Math.round(fraca.f * 100) + "%. Uma revisão rápida resolve.</p></div>" : "");
  }

  let desbloqueioPendente = null;
  function render(animar) {
    aplicarAparencia();
    const r = rota();
    renderCasca(r);
    const v = $("#view");
    v.innerHTML = VIEWS[r]();
    if (animar !== false) { v.classList.remove("entrar"); void v.offsetWidth; v.classList.add("entrar"); }
    icones();
    if (r === "inicio") {
      requestAnimationFrame(desenharConectores);
      if (desbloqueioPendente) {
        const w = $('[data-wrap="' + desbloqueioPendente + '"]');
        desbloqueioPendente = null;
        if (w) {
          w.classList.add("desbloqueando");
          setTimeout(() => Sons.tocar("desbloquear"), 250);
          w.scrollIntoView({ block: "center", behavior: reduzMov.matches ? "auto" : "smooth" });
        }
      }
    }
  }

  /* ---------- Conectores da trilha ---------- */
  function desenharConectores() {
    $$(".trilha").forEach((tr) => {
      const svg = $(".conector", tr);
      const rb = tr.getBoundingClientRect();
      const pts = $$(".no", tr).map((n) => {
        const b = n.getBoundingClientRect();
        return { x: b.left + b.width / 2 - rb.left, y: b.top + b.height / 2 - rb.top, feito: n.classList.contains("feito"), atual: n.classList.contains("atual") };
      });
      svg.setAttribute("width", rb.width);
      svg.setAttribute("height", rb.height);
      svg.setAttribute("viewBox", "0 0 " + rb.width + " " + rb.height);
      let feito = "", resto = "";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], my = (a.y + b.y) / 2;
        const seg = "M" + a.x + " " + a.y + " C" + a.x + " " + my + " " + b.x + " " + my + " " + b.x + " " + b.y + " ";
        if (a.feito && (b.feito || b.atual)) feito += seg; else resto += seg;
      }
      svg.innerHTML = '<path class="c-resto" d="' + resto + '"/><path class="c-feito" d="' + feito + '"/>';
    });
  }
  window.addEventListener("resize", () => { if (rota() === "inicio") desenharConectores(); fecharPop(); });

  /* ---------- Popover dos nós ---------- */
  function fecharPop() { $$(".pop").forEach((p) => p.remove()); }
  function abrirPop(id) {
    fecharPop();
    const l = LICOES.find((x) => x.id === id);
    const wrap = $('[data-wrap="' + id + '"]');
    if (!l || !wrap) return;
    const tr = wrap.closest(".trilha");
    const est = estadoLicao(l);
    const nq = l.tipo === "desafio" ? 6 : l.questoes.length;
    let corpo = "<h3>" + l.titulo + "</h3><p>" + l.desc + "</p>";
    if (est === "bloqueado") {
      corpo += "<p>Conclua as lições anteriores para liberar esta. Se você já domina o conteúdo, faça um teste rápido: acertando 80%, você pula para cá.</p>" +
        '<button class="btn btn-sec bloco" data-acao="pular" data-id="' + id + '">' + ic("fast-forward") + "Fazer teste para pular</button>";
      Sons.tocar("bloqueado");
    } else {
      corpo += '<div class="meta-linha"><span>' + ic("file-text") + nq + " questões</span><span>" + ic("zap") + "+" + (est === "feito" ? 5 : l.tipo === "desafio" ? 20 : 10) + " XP</span></div>" +
        '<button class="btn btn-primario bloco" data-acao="comecar" data-id="' + id + '">' + (est === "feito" ? "Praticar de novo" : "Começar") + "</button>";
      Sons.tocar("toque");
    }
    const pop = document.createElement("div");
    pop.className = "pop card";
    pop.innerHTML = corpo;
    tr.appendChild(pop);
    const rb = tr.getBoundingClientRect(), nb = $(".no", wrap).getBoundingClientRect();
    const w = pop.offsetWidth;
    const cx = nb.left + nb.width / 2 - rb.left;
    pop.style.left = Math.max(0, Math.min(rb.width - w, cx - w / 2)) + "px";
    pop.style.top = nb.bottom - rb.top + 14 + "px";
    icones();
  }

  /* ---------- Modal e toast ---------- */
  function abrirModal(html) {
    const raiz = $("#modal-raiz");
    raiz.innerHTML = '<div class="modal-fundo" data-acao="fechar-modal-fundo"><div class="modal card" role="dialog" aria-modal="true">' + html + "</div></div>";
    icones();
    const b = $(".modal button", raiz);
    if (b) b.focus();
  }
  function fecharModal() { $("#modal-raiz").innerHTML = ""; }
  function toast(html, info) {
    const raiz = $("#toast-raiz");
    const t = document.createElement("div");
    t.className = "toast" + (info ? " info" : "");
    t.innerHTML = html;
    raiz.innerHTML = "";
    raiz.appendChild(t);
    icones();
    setTimeout(() => t.remove(), 1500);
  }

  /* ---------- Sessão de estudo ---------- */
  let S = null;
  function iniciarSessao(modo, questoes, extra) {
    if (!questoes.length) return;
    fecharPop();
    S = Object.assign({
      modo, fila: questoes.slice(), total: questoes.length, feitas: 0, acertos: 0,
      tentadas: new Set(), erradas: new Set(), combo: 0, maxCombo: 0, inicio: Date.now(),
      sel: null, fase: "pergunta", atual: null, respostas: [], timer: null, prazo: null
    }, extra || {});
    if (modo === "simulado") {
      S.prazo = Date.now() + 8 * 60 * 1000;
      S.timer = setInterval(tique, 1000);
    }
    document.body.classList.add("em-licao");
    const el = $("#licao");
    el.hidden = false;
    Sons.tocar("iniciar");
    proxima();
  }
  function proxima() {
    if (!S.fila.length) { concluirSessao(); return; }
    S.atual = S.fila.shift();
    S.sel = null;
    S.fase = "pergunta";
    renderQuestao();
  }
  function tipoRotulo(q) { return q.tipo === "ce" ? "Certo ou errado · estilo CEBRASPE" : q.tipo === "lacuna" ? "Complete a lacuna" : "Múltipla escolha"; }
  function renderQuestao() {
    const q = S.atual;
    const pct = Math.round((100 * S.feitas) / S.total);
    const fala = S.modo === "simulado" ? sortear(FALAS.simulado) : sortear(FALAS.licao);
    let resp = "";
    if (q.tipo === "multipla") {
      resp = '<div class="opcoes" role="group" aria-label="Alternativas">' + q.opcoes.map((o, i) =>
        '<button class="opcao" data-acao="opcao" data-valor="' + i + '" aria-pressed="false"><span class="letra">' + "ABCD"[i] + "</span><span>" + o + "</span></button>").join("") + "</div>";
    } else if (q.tipo === "ce") {
      resp = '<div class="opcoes ce" role="group" aria-label="Julgue o item">' +
        '<button class="opcao" data-acao="opcao" data-valor="c" aria-pressed="false"><span class="letra">' + ic("check") + "</span>Certo</button>" +
        '<button class="opcao" data-acao="opcao" data-valor="e" aria-pressed="false"><span class="letra">' + ic("x") + "</span>Errado</button></div>";
    } else {
      resp = '<div class="chips" role="group" aria-label="Palavras">' + embaralhar(q.opcoes).map((o) =>
        '<button class="chip-palavra" data-acao="chip" data-valor="' + esc(o) + '">' + o + "</button>").join("") + "</div>";
    }
    const enun = q.tipo === "lacuna"
      ? '<p class="frase-lacuna">' + q.enunciado.replace("___", '<button class="lacuna" data-acao="lacuna" aria-label="Lacuna">&nbsp;</button>') + "</p>"
      : '<p class="enunciado">' + q.enunciado + "</p>";
    const contador = S.modo === "simulado"
      ? '<span class="chip-stat tempo" id="cron">' + ic("timer") + "<b>" + mmss((S.prazo - Date.now()) / 1000) + "</b></span>"
      : '<span class="chip-stat combo' + (S.combo >= 2 ? " ativo" : "") + '" id="combo" title="Acertos seguidos">' + ic("flame") + "<b>" + S.combo + "</b></span>";
    $("#licao").innerHTML =
      '<header class="licao-topo"><button class="icone-btn" data-acao="sair" aria-label="Sair">' + ic("x") + "</button>" +
      '<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i id="prog" style="--p:' + pct + '%"></i></div>' + contador + "</header>" +
      '<div class="licao-corpo"><div class="licao-conteudo">' +
      '<div class="licao-mascote"><img class="mascote" id="mascote-licao" src="mascote.webp" alt="' + NOME_MASCOTE + '"><div class="balao" id="balao">' + fala + "</div></div>" +
      (S.erradas.has(q.id) && S.modo !== "simulado" ? '<p class="aviso-erro">' + ic("rotate-ccw") + "Questão que você errou nesta lição</p>" : "") +
      '<article class="questao card"><div class="q-meta"><span class="tag">' + ic("scale") + q.licao.titulo + '</span><span class="tag suave">' + tipoRotulo(q) + "</span></div>" + enun + "</article>" +
      resp + "</div></div>" +
      '<footer class="licao-rodape" id="rodape">' + rodapePergunta() + "</footer>";
    icones();
    $(".licao-corpo").scrollTop = 0;
  }
  function rodapePergunta() {
    const dica = S.atual.tipo === "ce" ? "Teclas C e E para responder, Enter para confirmar" : S.atual.tipo === "lacuna" ? "Toque na palavra certa" : "Teclas 1 a 4 para escolher, Enter para confirmar";
    return '<div class="rodape-inner"><span class="dica-teclas">' + dica + '</span><button class="btn btn-primario" data-acao="verificar" id="btn-verificar" disabled>' +
      (S.modo === "simulado" ? "Confirmar" : "Verificar") + "</button></div>";
  }
  function selecionar(v) {
    if (!S || S.fase !== "pergunta") return;
    S.sel = v;
    $$(".opcao", $("#licao")).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.valor === String(v))));
    $("#btn-verificar").disabled = false;
    Sons.tocar("selecionar");
  }
  function escolherChip(v) {
    if (!S || S.fase !== "pergunta") return;
    S.sel = v;
    const lac = $(".lacuna", $("#licao"));
    lac.textContent = v;
    lac.classList.remove("cheia"); void lac.offsetWidth; lac.classList.add("cheia");
    $$(".chip-palavra", $("#licao")).forEach((c) => c.classList.toggle("usada", c.dataset.valor === v));
    $("#btn-verificar").disabled = false;
    Sons.tocar("chip");
  }
  function limparLacuna() {
    if (!S || S.fase !== "pergunta" || S.sel == null) return;
    S.sel = null;
    const lac = $(".lacuna", $("#licao"));
    lac.innerHTML = "&nbsp;";
    lac.classList.remove("cheia");
    $$(".chip-palavra", $("#licao")).forEach((c) => c.classList.remove("usada"));
    $("#btn-verificar").disabled = true;
    Sons.tocar("toque");
  }
  function corrigir(q, sel) {
    if (q.tipo === "multipla") return Number(sel) === q.resposta;
    if (q.tipo === "ce") return (sel === "c") === q.resposta;
    return sel === q.resposta;
  }
  function textoResposta(q, sel) {
    if (sel == null) return "sem resposta";
    if (q.tipo === "multipla") return "ABCD"[sel] + ") " + q.opcoes[sel];
    if (q.tipo === "ce") return sel === "c" ? "Certo" : "Errado";
    return sel;
  }
  const textoCorreta = (q) => textoResposta(q, q.tipo === "multipla" ? q.resposta : q.tipo === "ce" ? (q.resposta ? "c" : "e") : q.resposta);
  function posarMascote(classe) {
    const m = $("#mascote-licao");
    if (!m) return;
    m.classList.remove("pula", "treme");
    void m.offsetWidth;
    m.classList.add(classe);
  }
  function falar(txt) {
    const b = $("#balao");
    if (!b) return;
    b.textContent = txt;
    b.classList.remove("troca"); void b.offsetWidth; b.classList.add("troca");
  }

  function verificar() {
    if (!S || S.fase !== "pergunta" || S.sel == null) return;
    const q = S.atual;
    const ok = corrigir(q, S.sel);
    const primeira = !S.tentadas.has(q.id);
    S.tentadas.add(q.id);
    if (primeira) {
      E.stats.resp++;
      if (ok) { E.stats.acertos++; S.acertos++; }
      registrarMemoria(q, ok);
    }
    S.respostas.push({ id: q.id, sel: S.sel, ok });
    if (S.modo === "simulado") {
      S.feitas++;
      Sons.tocar("selecionar");
      proxima();
      return;
    }
    S.fase = "feedback";
    if (ok) {
      S.feitas++;
      S.combo++;
      S.maxCombo = Math.max(S.maxCombo, S.combo);
      Sons.tocar("acerto");
      posarMascote("pula");
      if (S.combo >= 3 && (S.combo === 3 || S.combo % 3 === 0)) {
        setTimeout(() => { Sons.tocar("combo", S && S.combo); toast(ic("flame") + "Combo x" + S.combo + "!"); }, 380);
        falar(sortear(FALAS.combo));
      } else falar(sortear(FALAS.acerto));
    } else {
      S.combo = 0;
      S.erradas.add(q.id);
      if (S.modo === "teste") S.feitas++;
      else S.fila.push(q);
      Sons.tocar("erro");
      posarMascote("treme");
      falar(sortear(S.modo === "teste" ? FALAS.erroTeste : FALAS.erro));
    }
    // Marca alternativas
    if (q.tipo === "lacuna") {
      $(".lacuna", $("#licao")).classList.add(ok ? "certa" : "errada");
      $(".chips", $("#licao")).classList.add("travadas");
    } else {
      const grupo = $(".opcoes", $("#licao"));
      grupo.classList.add("travadas");
      const certaVal = q.tipo === "multipla" ? String(q.resposta) : q.resposta ? "c" : "e";
      $$(".opcao", grupo).forEach((b) => {
        b.setAttribute("aria-pressed", "false");
        if (b.dataset.valor === certaVal) b.classList.add("certa");
        else if (b.dataset.valor === String(S.sel)) b.classList.add("errada");
      });
    }
    const pct = Math.round((100 * S.feitas) / S.total);
    $("#prog").style.setProperty("--p", pct + "%");
    const cb = $("#combo");
    if (cb) {
      cb.querySelector("b").textContent = S.combo;
      cb.classList.toggle("ativo", S.combo >= 2);
      if (ok) { cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump"); }
    }
    const rod = $("#rodape");
    rod.className = "licao-rodape " + (ok ? "ok" : "erro");
    rod.innerHTML = '<div class="rodape-inner fb"><div class="fb-icone">' + ic(ok ? "check" : "x") + '</div><div class="fb-texto">' +
      "<h3>" + (ok ? sortear(["Isso aí!", "Mandou bem!", "Excelente!", "Perfeito!"]) : "Quase lá!") + "</h3>" +
      (ok ? "" : '<p class="fb-correta">Resposta correta: <strong>' + textoCorreta(q) + "</strong></p>") +
      "<p>" + q.explicacao + '</p><p class="ref">' + ic("book-open") + q.ref + "</p></div>" +
      '<button class="btn btn-primario' + (ok ? "" : " perigo") + '" data-acao="continuar" id="btn-continuar">Continuar</button></div>';
    icones();
    $("#btn-continuar").focus({ preventScroll: true });
  }

  function tique() {
    if (!S || !S.prazo) return;
    const rest = (S.prazo - Date.now()) / 1000;
    const c = $("#cron");
    if (c) { c.querySelector("b").textContent = mmss(rest); c.classList.toggle("urgente", rest <= 60); }
    if (rest <= 0) {
      if (S.atual && !S.respostas.some((r) => r.id === S.atual.id)) S.respostas.push({ id: S.atual.id, sel: null, ok: false });
      S.fila.forEach((q) => S.respostas.push({ id: q.id, sel: null, ok: false }));
      S.fila = [];
      concluirSessao();
    }
  }

  function concluirSessao() {
    clearInterval(S.timer);
    S.fase = "fim";
    const seg = Math.round((Date.now() - S.inicio) / 1000);
    E.stats.tempo += seg;
    const acc = S.total ? Math.round((100 * S.acertos) / S.total) : 0;
    const perfeita = S.erradas.size === 0 && S.modo !== "simulado";
    let xp = 0, titulo = "Lição concluída!", sub = "", falhou = false;
    const posAntes = minhaPosicao();
    if (S.modo === "licao") {
      const ja = !!E.concluidas[S.licao.id];
      xp = ja ? 5 : 10 + (perfeita ? 5 : 0);
      if (!ja) { E.concluidas[S.licao.id] = { acc }; S.desbloqueou = true; }
      titulo = perfeita ? "Lição perfeita!" : "Lição concluída!";
      sub = ja ? "Praticar de novo fortalece a memória de longo prazo." : perfeita ? "Nenhum erro. A banca que se cuide." : "Os erros voltaram no fim e você fechou a lição. É assim que fixa.";
    } else if (S.modo === "desafio") {
      xp = 20 + (perfeita ? 5 : 0);
      if (!E.concluidas[S.licao.id]) { E.concluidas[S.licao.id] = { acc }; S.desbloqueou = true; }
      titulo = "Desafio vencido!";
      sub = "Unidade fechada. Você revisou tudo o que estudou nela.";
    } else if (S.modo === "revisao") {
      xp = 8;
      titulo = "Revisão concluída!";
      sub = "Memória renovada. Essas questões voltam só quando estiverem esfriando de novo.";
    } else if (S.modo === "simulado") {
      xp = S.respostas.filter((r) => r.ok).length * 2;
      const ac = S.respostas.filter((r) => r.ok).length;
      E.simulados.unshift({ data: Date.now(), acertos: ac, total: S.total, tempo: seg });
      titulo = "Simulado finalizado";
      sub = "Você acertou " + ac + " de " + S.total + ". Confira o gabarito comentado abaixo.";
    } else if (S.modo === "teste") {
      if (acc >= 80) {
        S.puladas.forEach((l) => { if (!E.concluidas[l.id]) E.concluidas[l.id] = { acc }; });
        S.desbloqueou = true;
        xp = 15;
        titulo = "Você pulou de fase!";
        sub = S.puladas.length + " lições liberadas. Agora é com " + S.alvo.titulo + ".";
      } else {
        xp = 3;
        falhou = true;
        titulo = "Ainda não foi dessa vez";
        sub = "Você acertou " + acc + "% e precisava de 80%. Siga a trilha normal: ela vai te preparar.";
      }
    }
    if (perfeita && (S.modo === "licao" || S.modo === "desafio")) E.perfeitas = (E.perfeitas || 0) + 1;

    // Ofensiva e meta
    const hoje = hojeISO();
    const xpAntes = E.xpDia[hoje] || 0;
    let ofensivaSubiu = false;
    if (E.ultimoDia !== hoje) {
      E.streak = E.ultimoDia === ontemISO() ? E.streak + 1 : 1;
      E.ultimoDia = hoje;
      ofensivaSubiu = true;
    }
    E.xp += xp;
    E.xpDia[hoje] = xpAntes + xp;
    const metaBatida = xpAntes < META && xpAntes + xp >= META;
    const posDepois = minhaPosicao();
    salvar();

    const tempoTxt = mmss(seg);
    let html = '<div class="licao-corpo"><div class="fim">' +
      '<img class="mascote festa" src="mascote.webp" alt="' + NOME_MASCOTE + ' comemorando">' +
      '<h1 class="' + (falhou ? "falhou" : "") + '">' + titulo + '</h1><p class="sub">' + sub + "</p>" +
      '<div class="tiles"><div class="tile ouro"><span>XP ganho</span><b>' + ic("zap") + '<span data-contar="' + xp + '">0</span></b></div>' +
      '<div class="tile verde"><span>Precisão</span><b>' + ic("target") + '<span data-contar="' + acc + '" data-suf="%">0%</span></b></div>' +
      '<div class="tile azul"><span>Tempo</span><b>' + ic("clock") + tempoTxt + "</b></div></div>" +
      '<div class="fim-cards">';
    if (ofensivaSubiu) html += '<div class="card fim-card"><span class="ico chama-grande">' + ic("flame") + "</span><div><b>" + E.streak + " dias de ofensiva!</b><small>Volte amanhã para chegar a " + (E.streak + 1) + ".</small></div></div>";
    if (metaBatida) html += '<div class="card fim-card"><span class="ico" style="color:var(--accent)">' + ic("target") + "</span><div><b>Meta diária concluída</b><small>" + E.xpDia[hoje] + " XP hoje. Seu eu do futuro agradece.</small></div></div>";
    if (posDepois < posAntes) html += '<div class="card fim-card"><span class="ico" style="color:#1fae5c">' + ic("trending-up") + "</span><div><b>Você subiu para " + posDepois + "º na Liga Esmeralda</b><small>" + xpSemana() + " XP nesta semana.</small></div></div>";
    if (S.maxCombo >= 3 && S.modo !== "simulado") html += '<div class="card fim-card"><span class="ico" style="color:var(--fire)">' + ic("zap") + "</span><div><b>Maior combo: " + S.maxCombo + " acertos seguidos</b><small>Ritmo de quem vai passar.</small></div></div>";
    html += "</div>";
    if (S.modo === "simulado") {
      html += '<ol class="gabarito">' + S.respostas.map((r, i) => {
        const q = Q[r.id];
        return '<li class="card ' + (r.ok ? "ok" : "erro") + '"><details><summary><span class="g-ico">' + ic(r.ok ? "check" : "x") + "</span><span>" + (i + 1) + ". " + q.enunciado.replace("___", "____") + "</span></summary>" +
          "<p><b>Sua resposta:</b> " + esc(textoResposta(q, r.sel)) + "<br><b>Correta:</b> " + esc(textoCorreta(q)) + "</p><p>" + q.explicacao + " <em>(" + q.ref + ")</em></p></details></li>";
      }).join("") + "</ol>";
    }
    html += '</div></div><footer class="licao-rodape"><div class="rodape-inner" style="justify-content:center"><button class="btn btn-primario" data-acao="fim-continuar" id="btn-fim">Continuar</button></div></footer>';
    const el = $("#licao");
    el.innerHTML = html;
    icones();
    $("#btn-fim").focus({ preventScroll: true });

    if (falhou) Sons.tocar("falha");
    else {
      Sons.tocar("concluir");
      if (window.confetti && !reduzMov.matches) {
        const cores = ["#2fbf69", "#f5b331", "#ff7a1a", "#5aa2ff", "#ff6b8b"];
        window.confetti({ particleCount: 110, spread: 75, origin: { y: 0.3 }, colors: cores, zIndex: 80 });
        setTimeout(() => window.confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors: cores, zIndex: 80 }), 250);
        setTimeout(() => window.confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors: cores, zIndex: 80 }), 400);
      }
    }
    setTimeout(contarNumeros, 450);
    if (ofensivaSubiu) setTimeout(() => Sons.tocar("ofensiva"), 1300);
    else if (metaBatida) setTimeout(() => Sons.tocar("meta"), 1300);
    if (S.desbloqueou) { const a = licaoAtual(); desbloqueioPendente = a ? a.id : null; }
  }
  function contarNumeros() {
    $$("[data-contar]", $("#licao")).forEach((el) => {
      const alvo = Number(el.dataset.contar), suf = el.dataset.suf || "";
      if (reduzMov.matches || alvo === 0) { el.textContent = alvo + suf; return; }
      const t0 = performance.now(), dur = 900;
      let ultimo = -1;
      (function passo(t) {
        const p = Math.min(1, (t - t0) / dur);
        const v = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf;
        if (v !== ultimo && v % 3 === 0 && !suf) Sons.tocar("tick");
        ultimo = v;
        if (p < 1) requestAnimationFrame(passo);
      })(t0);
    });
  }
  function fecharLicao() {
    if (S) clearInterval(S.timer);
    S = null;
    document.body.classList.remove("em-licao");
    const el = $("#licao");
    el.hidden = true;
    el.innerHTML = "";
    fecharModal();
  }

  /* ---------- Atalhos para iniciar ---------- */
  function comecar(id) {
    const l = LICOES.find((x) => x.id === id);
    if (!l || estadoLicao(l) === "bloqueado") return;
    if (l.tipo === "desafio") iniciarSessao("desafio", embaralhar(questoesDaUnidade(l.unidade)).slice(0, 6), { licao: l });
    else iniciarSessao("licao", embaralhar(l.questoes), { licao: l });
  }
  function pularPara(id) {
    const alvo = LICOES.find((x) => x.id === id);
    const atual = licaoAtual();
    if (!alvo || !atual) return;
    const puladas = LICOES.slice(atual.ordem, alvo.ordem);
    const qs = embaralhar(puladas.flatMap((l) => (l.tipo === "desafio" ? [] : l.questoes))).slice(0, 8);
    iniciarSessao("teste", qs, { alvo, puladas });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", (ev) => {
    const alvo = ev.target.closest("[data-acao]");
    if (!alvo) {
      if (!ev.target.closest(".pop")) fecharPop();
      if (ev.target.closest(".nav-item")) Sons.tocar("toque");
      return;
    }
    const a = alvo.dataset.acao, v = alvo.dataset.valor, id = alvo.dataset.id;
    switch (a) {
      case "estilo":
        if (E.estilo !== v) { E.estilo = v; salvar(); Sons.tocar("selecionar"); render(false); }
        break;
      case "tema":
        E.tema = temaEfetivoEscuro() ? "claro" : "escuro"; salvar(); Sons.tocar("toque"); render(false);
        break;
      case "tema-def":
        E.tema = v; salvar(); Sons.tocar("toque"); render(false);
        break;
      case "som":
        E.som = !E.som; Sons.ativo = E.som; salvar(); render(false); if (E.som) Sons.tocar("selecionar");
        break;
      case "testar-som":
        if (!E.som) { toast(ic("volume-x") + "Ative os efeitos sonoros primeiro", true); break; }
        Sons.tocar(v, 3);
        break;
      case "no":
        ev.stopPropagation();
        abrirPop(id);
        break;
      case "comecar": comecar(id); break;
      case "pular": pularPara(id); break;
      case "guia": {
        const u = CURSO.unidades.find((x) => x.id === id);
        Sons.tocar("toque");
        abrirModal('<img class="mascote" src="mascote.webp" alt=""><span class="eyebrow">Resumo da unidade</span><h2>' + u.titulo + "</h2><ul>" + u.resumo.map((r) => "<li>" + r + "</li>").join("") +
          '</ul><div class="acoes"><button class="btn btn-primario" data-acao="fechar-modal">Entendi</button></div>');
        break;
      }
      case "revisar-tudo": {
        const qs = TODAS.filter((q) => E.mem[q.id]).sort((x, y) => forca(x.id) - forca(y.id)).slice(0, 6);
        iniciarSessao("revisao", embaralhar(qs));
        break;
      }
      case "revisar-licao": {
        const l = LICOES.find((x) => x.id === id);
        iniciarSessao("revisao", embaralhar(l.questoes));
        break;
      }
      case "simulado":
        iniciarSessao("simulado", embaralhar(TODAS).slice(0, 10));
        break;
      case "reset":
        abrirModal('<h2>Reiniciar a demonstração?</h2><p>Seu progresso neste navegador volta para os dados de exemplo.</p><div class="acoes">' +
          '<button class="btn btn-sec" data-acao="fechar-modal">Cancelar</button><button class="btn btn-primario perigo" data-acao="reset-ok">Reiniciar</button></div>');
        break;
      case "reset-ok": {
        const est = E.estilo, tema = E.tema, som = E.som;
        E = semente(); E.estilo = est; E.tema = tema; E.som = som; salvar(); fecharModal(); location.hash = "inicio"; render(); toast(ic("check") + "Demonstração reiniciada", true);
        break;
      }
      case "fechar-modal": fecharModal(); break;
      case "fechar-modal-fundo": if (ev.target === alvo) fecharModal(); break;
      // Lição
      case "opcao": selecionar(v); break;
      case "chip": escolherChip(v); break;
      case "lacuna": limparLacuna(); break;
      case "verificar": verificar(); break;
      case "continuar": proxima(); break;
      case "sair":
        abrirModal('<img class="mascote treme" src="mascote.webp" alt=""><h2>Vai sair agora?</h2><p>Se sair, o progresso desta ' + (S && S.modo === "simulado" ? "prova" : "lição") + " se perde.</p>" +
          '<div class="acoes"><button class="btn btn-primario" data-acao="fechar-modal">Continuar estudando</button><button class="btn-texto" data-acao="sair-ok" style="color:var(--danger)">Sair mesmo assim</button></div>');
        break;
      case "sair-ok": fecharLicao(); render(); break;
      case "fim-continuar": fecharLicao(); if (rota() !== "inicio" && desbloqueioPendente) location.hash = "inicio"; else render(); break;
    }
  });
  document.addEventListener("input", (ev) => {
    if (ev.target.id === "nome") { E.nome = ev.target.value.trim().slice(0, 24); salvar(); }
  });
  document.addEventListener("change", (ev) => { if (ev.target.id === "nome") renderCasca(rota()), icones(); });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      if ($("#modal-raiz").innerHTML) { fecharModal(); return; }
      if ($(".pop")) { fecharPop(); return; }
      if (S && S.fase === "fim") { $("#btn-fim") && $("#btn-fim").click(); return; }
      if (S) { $('[data-acao="sair"]') && $('[data-acao="sair"]').click(); return; }
    }
    if (!S || $("#modal-raiz").innerHTML || ev.target.tagName === "INPUT") return;
    const k = ev.key.toLowerCase();
    if (k === "enter") {
      ev.preventDefault();
      if (S.fase === "fim") { $("#btn-fim") && $("#btn-fim").click(); return; }
      if (S.fase === "pergunta") verificar(); else proxima();
      return;
    }
    if (S.fase !== "pergunta" || !S.atual) return;
    const q = S.atual;
    if (q.tipo === "multipla" && /^[1-4]$/.test(k)) selecionar(String(Number(k) - 1));
    else if (q.tipo === "multipla" && /^[a-d]$/.test(k)) selecionar(String("abcd".indexOf(k)));
    else if (q.tipo === "ce" && (k === "c" || k === "1")) selecionar("c");
    else if (q.tipo === "ce" && (k === "e" || k === "2")) selecionar("e");
    else if (q.tipo === "lacuna" && /^[1-9]$/.test(k)) { const c = $$(".chip-palavra", $("#licao"))[Number(k) - 1]; if (c) escolherChip(c.dataset.valor); }
  });
  window.addEventListener("hashchange", () => { fecharPop(); window.scrollTo(0, 0); render(); });
  temaEscuroSO.addEventListener && temaEscuroSO.addEventListener("change", () => { if (E.tema === "sistema") render(false); });

  render();
  if (avisoInicial) setTimeout(() => toast(ic("snowflake") + avisoInicial, true), 600);
})();
