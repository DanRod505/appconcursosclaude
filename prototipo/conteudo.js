/*
 * Conteúdo de teste do protótipo: Direito Administrativo.
 * Estrutura: disciplina → unidades → lições → questões.
 * Tipos de questão:
 *   "multipla": múltipla escolha (resposta = índice da alternativa correta)
 *   "ce":       certo ou errado, estilo CEBRASPE (resposta = true para Certo, false para Errado)
 *   "lacuna":   complete a lacuna marcada com ___ (resposta = palavra correta, presente em "opcoes")
 * Todas as questões são inéditas, escritas para o protótipo.
 */
window.CURSO = {
  disciplina: "Direito Administrativo",
  concurso: "TRT · Técnico Judiciário",
  unidades: [
    {
      id: "u1",
      titulo: "Princípios da Administração Pública",
      subtitulo: "LIMPE, legalidade, impessoalidade e cia.",
      cor: ["#2fbf69", "#1f9d55", "#167a42"],
      resumo: [
        "O caput do art. 37 da CF traz cinco princípios expressos: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência (LIMPE).",
        "Eles valem para a administração direta e indireta de todos os Poderes e de todos os entes federativos.",
        "Legalidade: a Administração só faz o que a lei autoriza. O particular pode fazer tudo o que a lei não proíbe.",
        "Impessoalidade: o ato busca o interesse público e é imputado ao órgão, não ao agente. Base da vedação ao nepotismo (SV 13).",
        "Publicidade: regra geral, com exceções de sigilo previstas na própria CF.",
        "Eficiência: incluída pela EC 19/1998; sempre atua dentro da legalidade."
      ],
      licoes: [
        {
          id: "u1l1", titulo: "LIMPE: visão geral", icone: "landmark",
          desc: "Os cinco princípios expressos do art. 37 da CF.",
          questoes: [
            { id: "q101", tipo: "multipla",
              enunciado: "Segundo o caput do art. 37 da Constituição Federal, qual destes NÃO é um princípio expresso da Administração Pública?",
              opcoes: ["Legalidade", "Eficiência", "Supremacia do interesse público", "Publicidade"], resposta: 2,
              explicacao: "O caput do art. 37 traz cinco princípios expressos: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência. A supremacia do interesse público é um princípio implícito, reconhecido pela doutrina.",
              ref: "CF/88, art. 37, caput" },
            { id: "q102", tipo: "lacuna",
              enunciado: "Os princípios do art. 37 se aplicam à administração pública direta e ___ de qualquer dos Poderes.",
              opcoes: ["indireta", "privada", "municipal"], resposta: "indireta",
              explicacao: "O art. 37 alcança a administração direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios.",
              ref: "CF/88, art. 37, caput" },
            { id: "q103", tipo: "ce",
              enunciado: "Os princípios expressos no art. 37 da Constituição Federal aplicam-se somente ao Poder Executivo.",
              resposta: false,
              explicacao: "Eles se aplicam a todos os Poderes (Executivo, Legislativo e Judiciário) no exercício da função administrativa, em todos os entes federativos.",
              ref: "CF/88, art. 37, caput" },
            { id: "q104", tipo: "ce",
              enunciado: "O princípio da eficiência não constava do texto original da CF/88 e foi incluído no art. 37 pela Emenda Constitucional nº 19/1998.",
              resposta: true,
              explicacao: "A EC 19/1998, conhecida como Reforma Administrativa, acrescentou a eficiência ao caput do art. 37.",
              ref: "EC nº 19/1998" },
            { id: "q105", tipo: "multipla",
              enunciado: "No mnemônico LIMPE, a letra M corresponde a qual princípio?",
              opcoes: ["Motivação", "Moralidade", "Mérito", "Modicidade"], resposta: 1,
              explicacao: "LIMPE = Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência. A motivação também é princípio, mas está na Lei 9.784/1999, não no caput do art. 37.",
              ref: "CF/88, art. 37, caput" }
          ]
        },
        {
          id: "u1l2", titulo: "Legalidade", icone: "scale",
          desc: "Legalidade estrita, Súmula 473 e decretos.",
          questoes: [
            { id: "q201", tipo: "multipla",
              enunciado: "Pelo princípio da legalidade, a Administração Pública:",
              opcoes: [
                "Pode fazer tudo o que a lei não proíbe.",
                "Só pode agir quando a lei autoriza ou determina.",
                "Pode agir conforme a conveniência do gestor, mesmo sem lei.",
                "Fica dispensada de seguir a lei em situações de urgência."
              ], resposta: 1,
              explicacao: "Para a Administração vale a legalidade estrita: só se faz o que a lei permite. A ideia de fazer tudo o que a lei não proíbe vale para os particulares.",
              ref: "CF/88, art. 37, caput" },
            { id: "q202", tipo: "ce",
              enunciado: "Ao particular é lícito fazer tudo aquilo que a lei não proíbe.",
              resposta: true,
              explicacao: "É a autonomia da vontade, extraída do art. 5º, II, da CF: ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.",
              ref: "CF/88, art. 5º, II" },
            { id: "q203", tipo: "lacuna",
              enunciado: "Segundo a Súmula 473 do STF, a Administração pode anular seus próprios atos quando eivados de vícios que os tornem ___.",
              opcoes: ["ilegais", "inoportunos", "inconvenientes"], resposta: "ilegais",
              explicacao: "A anulação decorre de ilegalidade. Já a revogação ocorre por conveniência ou oportunidade, respeitados os direitos adquiridos.",
              ref: "STF, Súmula 473" },
            { id: "q204", tipo: "multipla",
              enunciado: "A revogação de um ato administrativo ocorre por motivo de:",
              opcoes: ["Ilegalidade do ato", "Conveniência ou oportunidade", "Vício de competência", "Decisão judicial em ação popular"], resposta: 1,
              explicacao: "Revogação é um juízo de conveniência e oportunidade sobre um ato válido. Ilegalidades e vícios levam à anulação.",
              ref: "STF, Súmula 473" },
            { id: "q205", tipo: "ce",
              enunciado: "Com base no princípio da legalidade, um decreto pode criar obrigações para particulares mesmo sem amparo em lei.",
              resposta: false,
              explicacao: "Decretos regulamentares servem à fiel execução da lei. Não podem inovar o ordenamento criando obrigações sem base legal.",
              ref: "CF/88, art. 84, IV" }
          ]
        },
        {
          id: "u1l3", titulo: "Impessoalidade", icone: "users",
          desc: "Finalidade pública, promoção pessoal e nepotismo.",
          questoes: [
            { id: "q301", tipo: "ce",
              enunciado: "A publicidade dos atos, programas, obras e serviços dos órgãos públicos não pode conter nomes, símbolos ou imagens que caracterizem promoção pessoal de autoridades ou servidores.",
              resposta: true,
              explicacao: "É a regra do § 1º do art. 37, uma aplicação direta da impessoalidade: a obra é do Estado, não do governante.",
              ref: "CF/88, art. 37, § 1º" },
            { id: "q302", tipo: "multipla",
              enunciado: "A Súmula Vinculante 13 do STF, que proíbe o nepotismo, se apoia principalmente em quais princípios?",
              opcoes: ["Impessoalidade e moralidade", "Publicidade e continuidade", "Autotutela e especialidade", "Hierarquia e tutela"], resposta: 0,
              explicacao: "Nomear parentes para cargos em comissão fere a impessoalidade (favorece pessoas determinadas) e a moralidade administrativa.",
              ref: "STF, Súmula Vinculante 13" },
            { id: "q303", tipo: "lacuna",
              enunciado: "A Súmula Vinculante 13 veda a nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o ___ grau, para cargo em comissão.",
              opcoes: ["segundo", "terceiro", "quarto"], resposta: "terceiro",
              explicacao: "O limite é o terceiro grau, inclusive. Tios e sobrinhos (3º grau) entram na vedação. Primos (4º grau) não.",
              ref: "STF, Súmula Vinculante 13" },
            { id: "q304", tipo: "ce",
              enunciado: "Uma das faces da impessoalidade é a finalidade: todo ato deve buscar o interesse público, e não beneficiar ou prejudicar pessoas determinadas.",
              resposta: true,
              explicacao: "A impessoalidade tem duas faces: a finalidade pública e a vedação à promoção pessoal do agente.",
              ref: "CF/88, art. 37, caput" },
            { id: "q305", tipo: "multipla",
              enunciado: "Os atos praticados por um servidor são imputados ao órgão ou à entidade, e não à pessoa do agente. Essa ideia expressa o princípio da:",
              opcoes: ["Impessoalidade", "Publicidade", "Eficiência", "Autotutela"], resposta: 0,
              explicacao: "Pela teoria do órgão, quem age é o Estado, por meio do agente. Por isso a publicidade oficial não pode promover a pessoa do servidor.",
              ref: "Doutrina: teoria do órgão" }
          ]
        },
        {
          id: "u1l4", titulo: "Moralidade e publicidade", icone: "eye",
          desc: "Probidade, ação popular, sigilo e LAI.",
          questoes: [
            { id: "q401", tipo: "ce",
              enunciado: "A moralidade administrativa se relaciona com ética, probidade, lealdade e boa-fé na atuação do agente público.",
              resposta: true,
              explicacao: "A moralidade exige que o agente atue de forma honesta e leal, não bastando o cumprimento formal da lei.",
              ref: "CF/88, art. 37, caput" },
            { id: "q402", tipo: "multipla",
              enunciado: "Qualquer cidadão é parte legítima para propor ação que vise anular ato lesivo à moralidade administrativa. Trata-se da:",
              opcoes: ["Ação civil pública", "Ação popular", "Mandado de injunção", "Habeas data"], resposta: 1,
              explicacao: "A ação popular pode ser proposta por qualquer cidadão para anular ato lesivo ao patrimônio público, à moralidade administrativa, ao meio ambiente e ao patrimônio histórico e cultural.",
              ref: "CF/88, art. 5º, LXXIII" },
            { id: "q403", tipo: "ce",
              enunciado: "O princípio da publicidade é absoluto e não admite sigilo em nenhuma hipótese.",
              resposta: false,
              explicacao: "A CF ressalva o sigilo imprescindível à segurança da sociedade e do Estado e protege a intimidade das pessoas.",
              ref: "CF/88, art. 5º, X e XXXIII" },
            { id: "q404", tipo: "lacuna",
              enunciado: "A Lei de Acesso à Informação é a Lei nº ___/2011.",
              opcoes: ["12.527", "8.112", "9.784"], resposta: "12.527",
              explicacao: "A Lei 12.527/2011 regula o acesso a informações. A 8.112/1990 é o estatuto dos servidores federais e a 9.784/1999 trata do processo administrativo federal.",
              ref: "Lei nº 12.527/2011" },
            { id: "q405", tipo: "multipla",
              enunciado: "Além de garantir transparência, a publicação oficial dos atos administrativos funciona, em regra, como:",
              opcoes: ["Requisito de eficácia do ato", "Elemento de competência do ato", "Forma de revogação tácita", "Atributo de imperatividade"], resposta: 0,
              explicacao: "Em regra, a publicação é condição para que o ato produza efeitos externos e permite o controle pela sociedade.",
              ref: "Doutrina majoritária" }
          ]
        },
        {
          id: "u1l5", titulo: "Eficiência", icone: "gauge",
          desc: "EC 19/1998, desempenho e Lei 9.784/1999.",
          questoes: [
            { id: "q501", tipo: "multipla",
              enunciado: "O princípio da eficiência foi incluído no caput do art. 37 da Constituição pela:",
              opcoes: ["Redação original da CF/88", "Emenda Constitucional nº 19/1998", "Emenda Constitucional nº 45/2004", "Lei nº 9.784/1999"], resposta: 1,
              explicacao: "A eficiência chegou com a EC 19/1998 (Reforma Administrativa), que buscou um modelo de administração gerencial.",
              ref: "EC nº 19/1998" },
            { id: "q502", tipo: "ce",
              enunciado: "A avaliação periódica de desempenho, que pode levar à perda do cargo pelo servidor estável, é uma manifestação do princípio da eficiência.",
              resposta: true,
              explicacao: "A EC 19/1998 também criou essa hipótese de perda do cargo, assegurada a ampla defesa, na forma de lei complementar.",
              ref: "CF/88, art. 41, § 1º, III" },
            { id: "q503", tipo: "ce",
              enunciado: "Em nome da eficiência, a Administração pode deixar de cumprir a lei sempre que isso gerar melhores resultados.",
              resposta: false,
              explicacao: "A eficiência atua dentro da legalidade, nunca contra ela. Os princípios devem ser aplicados em conjunto.",
              ref: "CF/88, art. 37, caput" },
            { id: "q504", tipo: "multipla",
              enunciado: "Segundo o art. 2º da Lei 9.784/1999, a Administração Pública obedecerá, dentre outros, ao princípio da:",
              opcoes: ["Motivação", "Pessoalidade", "Discricionariedade plena", "Hierarquia absoluta"], resposta: 0,
              explicacao: "O art. 2º lista: legalidade, finalidade, motivação, razoabilidade, proporcionalidade, moralidade, ampla defesa, contraditório, segurança jurídica, interesse público e eficiência.",
              ref: "Lei nº 9.784/1999, art. 2º" },
            { id: "q505", tipo: "lacuna",
              enunciado: "A eficiência exige que a Administração alcance bons resultados, com qualidade e rapidez, ao menor ___ possível.",
              opcoes: ["custo", "controle", "prazo legal"], resposta: "custo",
              explicacao: "Eficiência é obter os melhores resultados com uso racional dos recursos públicos, o que se liga à ideia de economicidade.",
              ref: "Doutrina majoritária" }
          ]
        },
        {
          id: "u1d", tipo: "desafio", titulo: "Desafio da Unidade 1", icone: "trophy",
          desc: "6 questões misturadas de toda a unidade. Vale 20 XP."
        }
      ]
    },
    {
      id: "u2",
      titulo: "Atos Administrativos",
      subtitulo: "Elementos, atributos e extinção",
      cor: ["#22a6b8", "#17869a", "#106574"],
      resumo: [
        "Elementos (requisitos) do ato: Competência, Finalidade, Forma, Motivo e Objeto. Mnemônico: COM-FI-FOR-M-OB.",
        "Competência, finalidade e forma são, em regra, vinculados. Nos atos discricionários, o mérito está no motivo e no objeto.",
        "Atributos: Presunção de legitimidade, Autoexecutoriedade, Tipicidade e Imperatividade (PATI).",
        "A presunção de legitimidade é relativa: admite prova em contrário.",
        "Anulação: por ilegalidade, efeitos ex tunc, pela Administração ou pelo Judiciário.",
        "Revogação: por conveniência e oportunidade, efeitos ex nunc, só pela própria Administração. Não alcança direitos adquiridos."
      ],
      licoes: [
        {
          id: "u2l1", titulo: "Elementos do ato", icone: "puzzle",
          desc: "Competência, finalidade, forma, motivo e objeto.",
          questoes: [
            { id: "q601", tipo: "multipla",
              enunciado: "Qual das alternativas NÃO é um elemento (requisito) do ato administrativo?",
              opcoes: ["Competência", "Finalidade", "Imperatividade", "Motivo"], resposta: 2,
              explicacao: "Os elementos são Competência, Finalidade, Forma, Motivo e Objeto. Imperatividade é um atributo do ato, não um elemento.",
              ref: "Lei nº 4.717/1965, art. 2º" },
            { id: "q602", tipo: "lacuna",
              enunciado: "Os elementos do ato administrativo são: competência, finalidade, forma, motivo e ___.",
              opcoes: ["objeto", "mérito", "imperatividade"], resposta: "objeto",
              explicacao: "Use o mnemônico COM-FI-FOR-M-OB: COMpetência, FInalidade, FORma, Motivo e OBjeto.",
              ref: "Lei nº 4.717/1965, art. 2º" },
            { id: "q603", tipo: "ce",
              enunciado: "Competência, finalidade e forma são, em regra, elementos vinculados do ato administrativo.",
              resposta: true,
              explicacao: "Esses três elementos são definidos pela lei. A margem de escolha do gestor, quando existe, fica no motivo e no objeto.",
              ref: "Doutrina majoritária" },
            { id: "q604", tipo: "ce",
              enunciado: "Nos atos discricionários, o mérito administrativo reside no motivo e no objeto.",
              resposta: true,
              explicacao: "O mérito é o juízo de conveniência e oportunidade, que recai sobre o motivo e o objeto do ato discricionário.",
              ref: "Doutrina majoritária" },
            { id: "q605", tipo: "multipla",
              enunciado: "Um ato praticado por agente que não tinha atribuição legal para praticá-lo apresenta vício de:",
              opcoes: ["Competência", "Objeto", "Motivo", "Forma"], resposta: 0,
              explicacao: "É vício de competência (sujeito). Ele pode ser convalidado quando a competência não for exclusiva.",
              ref: "Lei nº 9.784/1999, art. 55" }
          ]
        },
        {
          id: "u2l2", titulo: "Atributos", icone: "shield",
          desc: "Presunção, autoexecutoriedade, tipicidade e imperatividade.",
          questoes: [
            { id: "q701", tipo: "multipla",
              enunciado: "O atributo que permite à Administração executar suas decisões diretamente, sem precisar recorrer ao Poder Judiciário, é a:",
              opcoes: ["Imperatividade", "Autoexecutoriedade", "Tipicidade", "Presunção de legitimidade"], resposta: 1,
              explicacao: "Autoexecutoriedade é executar o ato por meios próprios. Exemplo clássico: a apreensão de mercadorias impróprias para consumo.",
              ref: "Doutrina majoritária" },
            { id: "q702", tipo: "ce",
              enunciado: "A presunção de legitimidade dos atos administrativos é absoluta e não admite prova em contrário.",
              resposta: false,
              explicacao: "A presunção é relativa (juris tantum). Ela admite prova em contrário, e o ônus da prova é de quem alega o vício.",
              ref: "Doutrina majoritária" },
            { id: "q703", tipo: "lacuna",
              enunciado: "O mnemônico PATI resume os atributos do ato: Presunção de legitimidade, Autoexecutoriedade, Tipicidade e ___.",
              opcoes: ["Imperatividade", "Impessoalidade", "Irrevogabilidade"], resposta: "Imperatividade",
              explicacao: "PATI = Presunção de legitimidade, Autoexecutoriedade, Tipicidade e Imperatividade. Impessoalidade é princípio, não atributo.",
              ref: "Doutrina majoritária" },
            { id: "q704", tipo: "ce",
              enunciado: "Nem todo ato administrativo possui imperatividade. Atos enunciativos, como certidões e atestados, não impõem obrigações.",
              resposta: true,
              explicacao: "Imperatividade só existe em atos que impõem obrigações. Atos enunciativos e negociais (como licenças) não têm esse atributo.",
              ref: "Doutrina majoritária" },
            { id: "q705", tipo: "multipla",
              enunciado: "A imperatividade consiste na possibilidade de a Administração:",
              opcoes: [
                "Impor obrigações a terceiros independentemente de sua concordância.",
                "Executar o ato sem ordem judicial.",
                "Agir apenas conforme figuras previstas em lei.",
                "Presumir que seus atos são verdadeiros."
              ], resposta: 0,
              explicacao: "É o chamado poder extroverso: impor obrigações unilateralmente. As outras alternativas descrevem autoexecutoriedade, tipicidade e presunção.",
              ref: "Doutrina majoritária" }
          ]
        },
        {
          id: "u2l3", titulo: "Anulação e revogação", icone: "file-x",
          desc: "Efeitos, quem pode fazer e prazo decadencial.",
          questoes: [
            { id: "q801", tipo: "ce",
              enunciado: "A revogação de um ato administrativo produz efeitos ex nunc, ou seja, não retroage.",
              resposta: true,
              explicacao: "Como o ato revogado era válido, os efeitos que já produziu são preservados. A revogação vale dali em diante.",
              ref: "Doutrina majoritária" },
            { id: "q802", tipo: "multipla",
              enunciado: "Ao exercer controle sobre atos administrativos do Poder Executivo, o Poder Judiciário pode:",
              opcoes: ["Revogá-los por conveniência.", "Anulá-los por ilegalidade.", "Revogá-los por oportunidade.", "Alterar livremente seu mérito."], resposta: 1,
              explicacao: "O Judiciário controla a legalidade e, por isso, anula. Revogar é juízo de mérito, exclusivo da Administração que praticou o ato.",
              ref: "STF, Súmula 473" },
            { id: "q803", tipo: "lacuna",
              enunciado: "Pelo art. 54 da Lei 9.784/1999, o direito de anular atos com efeitos favoráveis aos destinatários decai em ___ anos, salvo comprovada má-fé.",
              opcoes: ["cinco", "dois", "dez"], resposta: "cinco",
              explicacao: "O prazo decadencial é de cinco anos, contados da data em que o ato foi praticado, salvo comprovada má-fé.",
              ref: "Lei nº 9.784/1999, art. 54" },
            { id: "q804", tipo: "ce",
              enunciado: "Atos que já geraram direitos adquiridos podem ser revogados livremente pela Administração.",
              resposta: false,
              explicacao: "A Súmula 473 ressalva os direitos adquiridos. Também não podem ser revogados atos vinculados e atos que já exauriram seus efeitos.",
              ref: "STF, Súmula 473" },
            { id: "q805", tipo: "multipla",
              enunciado: "Em regra, a anulação de um ato administrativo produz efeitos:",
              opcoes: ["Ex tunc (retroativos)", "Ex nunc (só para o futuro)", "Apenas após o trânsito em julgado", "Somente para terceiros de boa-fé"], resposta: 0,
              explicacao: "A anulação retroage à origem do ato, ressalvados os efeitos já produzidos perante terceiros de boa-fé.",
              ref: "Doutrina majoritária" }
          ]
        },
        {
          id: "u2d", tipo: "desafio", titulo: "Desafio da Unidade 2", icone: "trophy",
          desc: "6 questões misturadas de toda a unidade. Vale 20 XP."
        }
      ]
    }
  ],
  // Unidades que aparecem como "em breve" no fim da trilha
  proximas: ["Poderes administrativos", "Organização administrativa", "Licitações e contratos"]
};
