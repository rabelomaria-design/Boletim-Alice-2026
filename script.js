/* ============================================================
   BOLETIM DIGITAL — script.js
   Responsável por: normalizar notas, calcular médias,
   somar faltas, definir situação, preencher cards e tabela,
   além da integração com a API (PIN e salvamento).
   ============================================================ */

/* ------------------------------------------------------------
   CONFIGURAÇÃO FIXA DO ALUNO
   ------------------------------------------------------------ */
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 23,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* ------------------------------------------------------------
   VARIÁVEIS DE SESSÃO E DADOS
   ------------------------------------------------------------ */
let pinSessao = null;
let modoEdicao = false;

/* Dados fictícios originais preservados */
let disciplinas = [
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

const FREQUENCIA_DEMONSTRATIVA = 92;
const MEDIA_MINIMA = 6.0;

/* ------------------------------------------------------------
   FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
   ------------------------------------------------------------ */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  let numero = valor;
  if (typeof valor === "string") {
    numero = parseFloat(valor.replace(",", "."));
  }
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

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

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

function formatarNota(valor) {
  if (valor === null) {
    return "Ainda não lançada";
  }
  return valor.toFixed(1).replace(".", ",");
}

function somarFaltas(lista) {
  if (!Array.isArray(lista)) return 0;
  return lista.reduce(function (acc, n) {
    return acc + (Number(n) || 0);
  }, 0);
}

function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

/* ------------------------------------------------------------
   RENDERIZAÇÃO DA TELA
   ------------------------------------------------------------ */
function montarTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = "";

  disciplinas.forEach(function (d, idx) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);
    const media = calcularMedia([n1, n2, n3]);
    const situacao = definirSituacao(media);
    const f1 = Array.isArray(d.faltas) ? d.faltas[0] : 0;
    const f2 = Array.isArray(d.faltas) ? d.faltas[1] : 0;
    const f3 = Array.isArray(d.faltas) ? d.faltas[2] : 0;
    const totalFaltas = somarFaltas(d.faltas);

    const linha = document.createElement("tr");

    if (modoEdicao) {
      linha.innerHTML = `
        <td class="nome-disciplina"></td>
        <td><input type="text" class="input-nota" data-idx="${idx}" data-campo="tri1" value="${n1 !== null ? String(n1).replace('.', ',') : ''}"></td>
        <td><input type="text" class="input-nota" data-idx="${idx}" data-campo="tri2" value="${n2 !== null ? String(n2).replace('.', ',') : ''}"></td>
        <td><input type="text" class="input-nota" data-idx="${idx}" data-campo="tri3" value="${n3 !== null ? String(n3).replace('.', ',') : ''}"></td>
        <td>${media === null ? '<span class="nota-ausente">—</span>' : formatarNota(media)}</td>
        <td>
          <div style="display: flex; gap: 2px; justify-content: center;">
            <input type="text" class="input-falta" data-idx="${idx}" data-tri="0" value="${f1}">
            <input type="text" class="input-falta" data-idx="${idx}" data-tri="1" value="${f2}">
            <input type="text" class="input-falta" data-idx="${idx}" data-tri="2" value="${f3}">
          </div>
        </td>
        <td><span class="situacao ${classeSituacao(situacao)}">${situacao}</span></td>
      `;
      linha.querySelector(".nome-disciplina").textContent = d.disciplina;
    } else {
      linha.innerHTML = `
        <td class="nome-disciplina"></td>
        <td>${n1 === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(n1)}</td>
        <td>${n2 === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(n2)}</td>
        <td>${n3 === null ? '<span class="nota-ausente">Ainda não lançada</span>' :