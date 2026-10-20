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
        <td>${n3 === null ? '<span class="nota-ausente">Ainda não lançada</span>' : formatarNota(n3)}</td>
        <td>${media === null ? '<span class="nota-ausente">—</span>' : formatarNota(media)}</td>
        <td>${totalFaltas}</td>
        <td><span class="situacao ${classeSituacao(situacao)}">${situacao}</span></td>
      `;
      linha.querySelector(".nome-disciplina").textContent = d.disciplina;
    }

    corpo.appendChild(linha);
  });
}

function montarCards() {
  const container = document.getElementById("cards");
  container.innerHTML = "";

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

  const cards = [
    { titulo: "Média geral", valor: mediaGeral === null ? "—" : formatarNota(mediaGeral), extra: "Considerando notas disponíveis", emoji: "🐱" },
    { titulo: "Total de faltas", valor: totalFaltas, extra: "Somando todos os trimestres", emoji: "📚" },
    { titulo: "Bom desempenho", valor: bomDesempenho, extra: "Disciplinas com média ≥ 6,0", emoji: "🎀" },
    { titulo: "Precisam de atenção", valor: atencao, extra: "Disciplinas com média < 6,0", emoji: "💗" },
    { titulo: "Frequência", valor: FREQUENCIA_DEMONSTRATIVA + "%", extra: "Frequência adequada (demonstrativa)", emoji: "✏️" }
  ];

  cards.forEach(function (c) {
    const div = document.createElement("div");
    div.className = "card";
    div.setAttribute("data-emoji", c.emoji);
    
    const pTitulo = document.createElement("p");
    pTitulo.className = "card-titulo";
    pTitulo.textContent = c.titulo;
    
    const pValor = document.createElement("p");
    pValor.className = "card-valor";
    pValor.textContent = c.valor;

    const pExtra = document.createElement("p");
    pExtra.className = "card-extra";
    pExtra.textContent = c.extra;

    div.appendChild(pTitulo);
    div.appendChild(pValor);
    div.appendChild(pExtra);

    container.appendChild(div);
  });
}

function atualizarTela() {
  montarCards();
  montarTabela();
}

/* ------------------------------------------------------------
   INTEGRAÇÃO COM A API - ABRIR BOLETIM
   ------------------------------------------------------------ */
async function efetuarLogin() {
  const inputPin = document.getElementById("input-pin");
  const msgLogin = document.getElementById("msg-login");
  const valorPin = inputPin.value.trim();

  if (!valorPin) {
    msgLogin.textContent = "Digite seu PIN para acessar.";
    return;
  }

  msgLogin.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: valorPin
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const resultado = await resposta.json();
    pinSessao = valorPin;
    inputPin.value = "";

    if (resultado.dados && Array.isArray(resultado.dados.disciplinas)) {
      disciplinas = resultado.dados.disciplinas;
    }

    document.getElementById("area-login").style.display = "none";
    document.getElementById("painel-boletim").style.display = "block";
    atualizarTela();

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

/* ------------------------------------------------------------
   VALIDAÇÃO DE ENTRADAS NA EDIÇÃO
   ------------------------------------------------------------ */
function validarEObterDadosEdicao() {
  const novasDisciplinas = JSON.parse(JSON.stringify(disciplinas));
  let temErro = false;

  document.querySelectorAll(".input-invalido").forEach(el => el.classList.remove("input-invalido"));

  const inputsNota = document.querySelectorAll(".input-nota");
  inputsNota.forEach(input => {
    const idx = input.getAttribute("data-idx");
    const campo = input.getAttribute("data-campo");
    const val = input.value.trim();

    if (val === "") {
      novasDisciplinas[idx][campo] = null;
    } else {
      const valComPonto = val.replace(",", ".");
      const num = Number(valComPonto);

      if (isNaN(num) || num < 0 || num > 10 || val.includes("e") || val.includes("E")) {
        input.classList.add("input-invalido");
        temErro = true;
      } else {
        novasDisciplinas[idx][campo] = num;
      }
    }
  });

  const inputsFalta = document.querySelectorAll(".input-falta");
  inputsFalta.forEach(input => {
    const idx = input.getAttribute("data-idx");
    const tri = parseInt(input.getAttribute("data-tri"), 10);
    const val = input.value.trim();

    const num = Number(val);
    if (val === "" || isNaN(num) || !Number.isInteger(num) || num < 0) {
      input.classList.add("input-invalido");
      temErro = true;
    } else {
      if (!Array.isArray(novasDisciplinas[idx].faltas)) {
        novasDisciplinas[idx].faltas = [0, 0, 0];
      }
      novasDisciplinas[idx].faltas[tri] = num;
    }
  });

  if (temErro) {
    return null;
  }

  return novasDisciplinas;
}

/* ------------------------------------------------------------
   INTEGRAÇÃO COM A API - SALVAR BOLETIM
   ------------------------------------------------------------ */
async function salvarAlteracoes() {
  const msgEdicao = document.getElementById("msg-edicao");
  const novosDados = validarEObterDadosEdicao();

  if (!novosDados) {
    msgEdicao.textContent = "Por favor, corrija os campos destacados em vermelho.";
    return;
  }

  msgEdicao.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novosDados
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.textContent = "Não foi possível salvar as alterações. Tente novamente.";
      return;
    }

    disciplinas = novosDados;
    modoEdicao = false;

    document.getElementById("btn-alterar").style.display = "inline-block";
    document.getElementById("btn-salvar").style.display = "none";
    document.getElementById("btn-cancelar").style.display = "none";

    msgEdicao.textContent = "Dados salvos com sucesso.";
    atualizarTela();

  } catch (erro) {
    msgEdicao.textContent = "Não foi possível salvar as alterações. Tente novamente.";
  }
}

/* ------------------------------------------------------------
   INICIALIZAÇÃO E EVENTOS
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", function () {
  const btnEntrar = document.getElementById("btn-entrar");
  const inputPin = document.getElementById("input-pin");
  const btnAlterar = document.getElementById("btn-alterar");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelar = document.getElementById("btn-cancelar");

  btnEntrar.addEventListener("click", efetuarLogin);

  inputPin.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      efetuarLogin();
    }
  });

  btnAlterar.addEventListener("click", function () {
    modoEdicao = true;
    document.getElementById("msg-edicao").textContent = "";
    btnAlterar.style.display = "none";
    btnSalvar.style.display = "inline-block";
    btnCancelar.style.display = "inline-block";
    atualizarTela();
  });

  btnCancelar.addEventListener("click", function () {
    modoEdicao = false;
    document.getElementById("msg-edicao").textContent = "";
    btnAlterar.style.display = "inline-block";
    btnSalvar.style.display = "none";
    btnCancelar.style.display = "none";
    atualizarTela();
  });

  btnSalvar.addEventListener("click", salvarAlteracoes);
});