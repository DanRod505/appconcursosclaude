# Protótipo Concurso+

Protótipo navegável do app de estudo para concursos, inspirado na pesquisa em `docs/pesquisa-duolingo.md`.

## Como abrir

Qualquer servidor estático serve. Por exemplo:

```bash
cd prototipo && python3 -m http.server 8000
```

Depois, abra http://localhost:8000 no navegador (no PC ou no celular, na mesma rede).

## O que tem

- **Dois estilos visuais**, alternáveis a qualquer momento (topo no celular, barra lateral no PC, ou em Perfil):
  - Neumorphism: relevo suave, com sombras claras e escuras sobre fundo único.
  - Glassmorphism: cartões de vidro fosco sobre um fundo vivo e animado.
- **Tema claro e escuro** em cada estilo (ou "Sistema", que segue o aparelho).
- **Trilha** com unidades, lições, desafio de unidade, nós bloqueados e "teste para pular".
- **Lição** com três tipos de questão: múltipla escolha, certo ou errado (estilo CEBRASPE) e lacuna. Questões erradas voltam no fim da lição.
- **Revisão inteligente**: cada questão tem uma meia-vida na memória (dobra no acerto, cai pela metade no erro).
- **Simulado** com cronômetro e gabarito comentado no final.
- **Progresso**: ofensiva, XP da semana, liga semanal e conquistas.
- **Sons sintetizados** (Web Audio, sem arquivos) e **animações** (mascote reagindo, combos, confete, desbloqueio de nó).
- **Atalhos de teclado** na lição: 1–4 ou A–D, C/E, Enter e Esc.

O progresso fica salvo no navegador e começa com dados de demonstração. Em Perfil → Reiniciar demonstração, ele volta ao início.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Estrutura da página |
| `estilos.css` | Tokens dos 2 estilos × 2 temas e todos os componentes |
| `app.js` | Telas, trilha, motor da lição, ofensiva, revisão e liga |
| `conteudo.js` | Matéria de teste (Direito Administrativo). Será trocada pelo conteúdo base. |
| `sons.js` | Efeitos sonoros |
| `mascote.webp` | Personagem |

Bibliotecas externas: [Lucide](https://lucide.dev) (ícones) e [canvas-confetti](https://github.com/catdad/canvas-confetti).
