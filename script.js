/* ============================================================
   BOLETIM DIGITAL — script.js
   Responsável por: normalizar notas, calcular médias,
   somar faltas, definir situação, preencher cards e tabela.
   ============================================================ */

/* ------------------------------------------------------------
   DADOS FICTÍCIOS — 9º ANO
   ------------------------------------------------------------
   Aqui temos um ARRAY (lista) de OBJETOS.
   Cada objeto é uma disciplina, com suas notas e faltas.
   ------------------------------------------------------------ */
const disciplinas = [
  { disciplina: "Língua Portuguesa",              tri1: 78,   tri2: "8,2", tri3: 8.6,  faltas: [2, 2, 1] },
  { disciplina: "Matemática",                     tri1: 55,   tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências",                       tri1: 84,   tri2: 7.9,   tri3: "8,3",faltas: [1, 1, 1] },
  { disciplina: "História",                       tri1: "7,1",tri2: 82,    tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia",                      tri1: 69,   tri2: "7,5", tri3: 7.8,  faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa",                 tri1: 88,   tri2: 8.4,   tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte",                           tri1: "9,2",tri2: 87,    tri3: 9.0,  faltas: [1, 1, 0] },
  { disciplina: "Educação Física",                tri1: 96,   tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital",               tri1: 91,   tri2: 8.9,   tri3: "9,4",faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira",            tri1: 76,   tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática",        tri1: 58,   tri2: "5,9", tri3: 6.2,  faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico",              tri1: 49,   tri2: 5.5,   tri3: "5,8",faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento",    tri1: "8,0",tri2: 84,    tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais",         tri1: 64,   tri2: "6,6", tri3: 7.0,  faltas: [1, 1, 1] }
];

/* ------------------------------------------------------------
   FREQUÊNCIA DEMONSTRATIVA
   ------------------------------------------------------------
   ATENÇÃO: este valor é APENAS FICTÍCIO/DEMONSTRATIVO.
   Nesta versão NÃO calculamos frequência a partir das faltas.
   No futuro, isso será tratado de outra forma.
   ------------------------------------------------------------ */
const FREQUENCIA_DEMONSTRATIVA = 92;

/* Média mínima de referência para "Bom desempenho" */
const MEDIA_MINIMA = 6.0;


/* ------------------------------------------------------------
   FUNÇÃO: normalizarNota(valor)
   ------------------------------------------------------------
   Recebe um valor bruto (número, string com vírgula, null…)
   e devolve:
     - null  → nota ainda não lançada
     - número entre 0 e 10 → nota normalizada
   Regras:
     - vazio / null / undefined = null
     - 0 a 10 = permanece igual
     - >10 e <=100 = divide por 10
     - aceita ponto ou vírgula decimal
     - valores fora das regras = inválidos (retorna null)
   ------------------------------------------------------------ */
function normalizarNota(valor) {
  // 1) Vazio, null ou undefined = nota ainda não lançada
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // 2) Se for string, troca vírgula por ponto antes de converter
  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }

  // 3) Se não virou número válido, considera inválido
  if (isNaN(numero)) {
    return null;
  }

  // 4) Se já está entre 0 e 10, mantém
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // 5) Se está entre 10 (exclusivo) e 100, divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // 6) Qualquer outro valor é inválido
  return null;
}


/* ------------------------------------------------------------
   FUNÇÃO: calcularMedia(notas)
   ------------------------------------------------------------
   Recebe um ARRAY com as notas já normalizadas (ou null)
   e devolve a média considerando SOMENTE as notas válidas.
   Se não houver nenhuma nota válida, devolve null.
   ------------------------------------------------------------ */
function calcularMedia(notas) {
  const validas = notas.filter(function (n) {
    return n !== null;
  });

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce(function (acc, n) {
    return acc + n;
  }, 0);

  return soma / validas.length;
}


/* ------------------------------------------------------------
   FUNÇÃO: definirSituacao(media)
   ------------------------------------------------------------
   Recebe a média (número ou null) e devolve:
     - "Bom desempenho"
     - "Atenção"
     - "Nota ainda não disponível"
   ------------------------------------------------------------ */
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}


/* ------------------------------------------------------------
   FUNÇÃO: formatarNota(valor)
   ------------------------------------------------------------
   Devolve o texto que aparece na tabela:
     - null  → "Ainda não lançada"
     - número → com uma casa decimal (ex.: 8,2)
   ------------------------------------------------------------ */
function formatarNota(valor) {
  if (valor === null) {
    return "Ainda não lançada";
  }
  return valor.toFixed(1).replace(".", ",");
}


/* ------------------------------------------------------------
   FUNÇÃO: somarFaltas(lista)
   ------------------------------------------------------------
   Recebe o array de faltas por trimestre e devolve o total.
   ------------------------------------------------------------ */
function somarFaltas(lista) {
  return lista.reduce(function (acc, n) {
    return acc + n;
  }, 0);
}


/* ------------------------------------------------------------
   FUNÇÃO: classeSituacao(situacao)
   ------------------------------------------------------------
   Devolve a classe CSS correspondente à situação,
   para colorir a etiqueta na tabela.
   ------------------------------------------------------------ */
function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}


/* ------------------------------------------------------------
   FUNÇÃO: montarTabela()
   ------------------------------------------------------------
   Percorre o array de disciplinas, calcula tudo e cria
   as linhas da tabela dinamicamente no DOM.
   ------------------------------------------------------------ */
function montarTabela() {
  const corpo = document.getElementById("corpo-tabela");

  disciplinas.forEach(function (d) {
    // Normaliza as três notas
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    // Média considerando só as notas válidas
    const media = calcularMedia([n1, n2, n3]);

    // Situação
    const situacao = definirSituacao(media);

    // Total de faltas
    const totalFaltas = somarFaltas(d.faltas);

    // Cria a linha <tr>
    const linha = document.createElement("tr");

    // Monta o HTML interno da linha
    linha.innerHTML = `
      <td>${d.disciplina}</td>
      <td>${n1 === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(n1)}</td>
      <td>${n2 === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(n2)}</td>
      <td>${n3 === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(n3)}</td>
      <td>${media === null ? '<span class="nota-ausente">—</span>' : formatarNota(media)}</td>
      <td>${totalFaltas}</td>
      <td><span class="situacao ${classeSituacao(situacao)}">${situacao}</span></td>
    `;

    corpo.appendChild(linha);
  });
}


/* ------------------------------------------------------------
   FUNÇÃO: montarCards()
   ------------------------------------------------------------
   Calcula os resumos e cria os cards no topo da página.
   ------------------------------------------------------------ */
function montarCards() {
  const container = document.getElementById("cards");

  // Vamos acumular dados de todas as disciplinas
  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltas = 0;
  let bomDesempenho = 0;
  let atencao = 0;

  disciplinas.forEach(function (d) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const media = calcularMedia([n1, n2, n3]);

    totalFaltas += somarFaltas(d.faltas);

    if (media !== null) {
      somaMedias += media;
      qtdMedias++;
      if (media >= MEDIA_MINIMA) {
        bomDesempenho++;
      } else {
        atencao++;
      }
    }
  });

  const mediaGeral = qtdMedias > 0 ? (somaMedias / qtdMedias) : null;

  // Lista de cards a serem criados
  const cards = [
    {
      titulo: "Média geral",
      valor: mediaGeral === null ? "—" : formatarNota(mediaGeral),
      extra: "Considerando notas disponíveis",
      emoji: "🐱"
    },
    {
      titulo: "Total de faltas",
      valor: totalFaltas,
      extra: "Somando todos os trimestres",
      emoji: "📚"
    },
    {
      titulo: "Bom desempenho",
      valor: bomDesempenho,
      extra: "Disciplinas com média ≥ 6,0",
      emoji: "🎀"
    },
    {
      titulo: "Precisam de atenção",
      valor: atencao,
      extra: "Disciplinas com média < 6,0",
      emoji: "💗"
    },
    {
      titulo: "Frequência",
      valor: FREQUENCIA_DEMONSTRATIVA + "%",
      extra: "Frequência adequada (demonstrativa)",
      emoji: "✏️"
    }
  ];

  // Cria cada card
  cards.forEach(function (c) {
    const div = document.createElement("div");
    div.className = "card";
    div.setAttribute("data-emoji", c.emoji);
    div.innerHTML = `
      <p class="card-titulo">${c.titulo}</p>
      <p class="card-valor">${c.valor}</p>
      <p class="card-extra">${c.extra}</p>
    `;
    container.appendChild(div);
  });
}


/* ------------------------------------------------------------
   INICIALIZAÇÃO
   ------------------------------------------------------------
   Quando a página terminar de carregar, montamos os cards
   e a tabela.
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {
  montarCards();
  montarTabela();
});