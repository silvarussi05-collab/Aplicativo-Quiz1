/* app.js — Versão completa com timer, sons, feedback visual, ranking e reiniciar */

// -------- Configurações iniciais --------
let pontuacao = 0;
let tempoInicio = null;
let tempoInterval = null;

const splash = document.getElementById("splash");
const startBtn = document.getElementById("startBtn");
const mainApp = document.getElementById("mainApp");
const quizSection = document.getElementById("quiz");
const perguntaEl = document.getElementById("pergunta");
const opcoesEl = document.getElementById("opcoes");
const resultadoEl = document.getElementById("resultado");
const btnProxima = document.getElementById("proxima");

// cria elemento de timer (será inserido dinamicamente dentro do quiz)
let timerEl = null;
function createTimerEl() {
  if (!timerEl) {
    timerEl = document.createElement("div");
    timerEl.id = "cronometro";
    timerEl.style.marginBottom = "10px";
    timerEl.style.fontWeight = "600";
    timerEl.style.color = "#0ec0d9";
    // insere no topo da seção quiz
    quizSection.insertBefore(timerEl, perguntaEl);
  }
}

// -------- Perguntas (12) --------
const perguntas = [
  { pergunta: "Qual instrumento moderno é conhecido por ter 6 cordas?", opcoes: ["Guitarra","Bateria","Sintetizador"], resposta: "Guitarra" },
  { pergunta: "Qual instrumento é tocado com baquetas e produz ritmo?", opcoes: ["Bateria","Piano","Baixo"], resposta: "Bateria" },
  { pergunta: "Qual instrumento possui teclas brancas e pretas?", opcoes: ["Piano","Violão","Guitarra"], resposta: "Piano" },
  { pergunta: "Qual instrumento moderno eletrônico é usado para efeitos e sons sintéticos?", opcoes: ["Sintetizador","Bateria","Violino"], resposta: "Sintetizador" },
  { pergunta: "Qual instrumento tem cordas e é tocado com palheta ou dedos?", opcoes: ["Baixo","Bateria","Piano"], resposta: "Baixo" },
  { pergunta: "Qual instrumento produz sons graves e marca a base da música?", opcoes: ["Baixo","Guitarra","Teclado"], resposta: "Baixo" },
  { pergunta: "Qual instrumento moderno é portátil e toca sons digitais?", opcoes: ["Teclado MIDI","Bateria","Violão"], resposta: "Teclado MIDI" },
  { pergunta: "Qual instrumento eletrônico é muito usado em música eletrônica e DJ sets?", opcoes: ["Controlador DJ","Guitarra","Bateria"], resposta: "Controlador DJ" },
  { pergunta: "Qual instrumento produz sons percussivos sem cordas ou teclas?", opcoes: ["Cajón","Piano","Baixo"], resposta: "Cajón" },
  { pergunta: "Qual instrumento moderno tem pads sensíveis ao toque e sons eletrônicos?", opcoes: ["Drum Pad","Violão","Sintetizador"], resposta: "Drum Pad" },
  { pergunta: "Qual instrumento é elétrico e similar à guitarra, mas com notas graves?", opcoes: ["Baixo elétrico","Bateria","Teclado"], resposta: "Baixo elétrico" },
  { pergunta: "Qual instrumento moderno pode ser tocado via computador usando softwares?", opcoes: ["Controlador MIDI","Guitarra","Bateria"], resposta: "Controlador MIDI" }
];

let indice = 0;

// -------- Sons dos instrumentos (na área instrumentos) --------
const instrumentos = document.querySelectorAll('.item');
instrumentos.forEach(item => {
  item.addEventListener('click', () => {
    const som = item.getAttribute('data-som');
    if (!som) return;
    const audio = new Audio(`assets/sounds/${som}.mp3`);
    audio.volume = 0.9;
    audio.play().catch(()=>{/* ignora autoplay errors */});
  });
});

// -------- Início: Splash → inicia timer e quiz --------
startBtn.addEventListener("click", () => {
  splash.classList.add("hidden");
  mainApp.classList.remove("hidden");
  // inicia cronômetro visível
  tempoInicio = Date.now();
  createTimerEl();
  updateTimer(); // atualiza imediatamente
  tempoInterval = setInterval(updateTimer, 500);
  // inicia quiz
  pontuacao = 0;
  indice = 0;
  mostrarPergunta();
});

// atualiza cronômetro no formato mm:ss
function updateTimer() {
  if (!tempoInicio) return;
  const diff = Date.now() - tempoInicio;
  const sec = Math.floor(diff / 1000);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  if (timerEl) timerEl.textContent = `Tempo: ${mm}:${ss}`;
}

// -------- Mostrar pergunta atual (uma por vez) --------
function mostrarPergunta() {
  // garantir que quiz esteja visível
  quizSection.classList.remove("hidden");

  const atual = perguntas[indice];
  perguntaEl.textContent = atual.pergunta;
  opcoesEl.innerHTML = "";

  // cria botões de opções
  atual.opcoes.forEach(opcao => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = opcao;
    btn.className = "resposta-btn"; // estilizado no CSS
    // acessibilidade
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => handleAnswer(btn, opcao));
    opcoesEl.appendChild(btn);
  });

  // resultado limpo
  resultadoEl.textContent = "";
  // exibe texto no botão próximo
  btnProxima.textContent = indice === perguntas.length - 1 ? "Finalizar" : "Próxima Pergunta";
  // mostra botão próxima
  btnProxima.style.display = "inline-block";
}

// -------- Resposta: cores, som e bloqueio --------
function handleAnswer(btnSelecionado, opcao) {
  const atual = perguntas[indice];

  // pega todos os botões atuais e desativa
  const botoes = Array.from(opcoesEl.querySelectorAll("button"));
  botoes.forEach(b => b.disabled = true);

  // marca cores: correta -> .correta, demais -> .errada
  botoes.forEach(b => {
    if (b.textContent === atual.resposta) {
      b.classList.add("correta"); // verde
    } else {
      b.classList.add("errada"); // vermelho
    }
  });

  // toca som apropriado
  try {
    const soundPath = (opcao === atual.resposta) ? "assets/sounds/correct.mp3" : "assets/sounds/wrong.mp3";
    const audio = new Audio(soundPath);
    audio.volume = 0.9;
    audio.play().catch(()=>{ /* evitar erros de autoplay */ });
  } catch (e) {
    console.warn("Erro ao tocar som:", e);
  }

  // pontuação e feedback texto
  if (opcao === atual.resposta) {
    pontuacao++;
    resultadoEl.textContent = "✅ Correto!";
  } else {
    resultadoEl.textContent = `❌ Errado! Resposta correta: ${atual.resposta}`;
  }
}

// -------- Próxima / Finalizar --------
btnProxima.addEventListener("click", () => {
  // importante: se usuário não respondeu (botões não desativados), ainda permitimos avançar
  // avança normalmente
  if (indice < perguntas.length - 1) {
    indice++;
    mostrarPergunta();
    // ao avançar, ocultamos botão "anterior" (vocês pediram sem anterior)
    // mantemos apenas o botão próxima
  } else {
    finalizarQuiz();
  }
});

// -------- Finalizar quiz: mostrar pontuação, tempo e ranking --------
function finalizarQuiz() {
  // parar timer
  if (tempoInterval) clearInterval(tempoInterval);
  const tempoFim = Date.now();
  const tempoTotalSeg = Math.floor((tempoFim - tempoInicio) / 1000);

  // esconder quiz
  quizSection.classList.add("hidden");
  btnProxima.style.display = "none";

  // mostrar resultados
  resultadoEl.innerHTML = `
    <div class="final-box">
      <h3>🎉 Fim do quiz!</h3>
      <p><strong>Pontuação:</strong> ${pontuacao}/${perguntas.length}</p>
      <p><strong>Tempo:</strong> ${tempoTotalSeg}s</p>
      <div class="final-actions">
        <button id="verRanking">🏆 Ver Ranking</button>
        <button id="reiniciarQuiz">🔄 Reiniciar</button>
      </div>
    </div>
  `;

  // salvar no ranking local (adiciona data)
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  ranking.push({ pontuacao, tempo: tempoTotalSeg, date: new Date().toISOString() });
  ranking.sort((a, b) => (b.pontuacao - a.pontuacao) || (a.tempo - b.tempo)); // maior pontuação, menor tempo
  localStorage.setItem("ranking", JSON.stringify(ranking));

  // eventos dos botões finais
  document.getElementById("verRanking").addEventListener("click", mostrarRanking);
  document.getElementById("reiniciarQuiz").addEventListener("click", reiniciarQuiz);
}

// -------- Ranking (mostra lista) --------
function mostrarRanking() {
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  let html = `<div id="ranking"><h3>🏆 Ranking</h3><ol>`;
  ranking.forEach((entry, i) => {
    // exibir data legível
    const d = new Date(entry.date);
    const dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    html += `<li><strong>#${i+1}</strong> — ${entry.pontuacao} pts • ${entry.tempo}s <span class="rank-date">(${dateStr})</span></li>`;
  });
  html += `</ol><div class="final-actions"><button id="reiniciarQuiz2">🔄 Reiniciar</button></div></div>`;

  resultadoEl.innerHTML = html;
  document.getElementById("reiniciarQuiz2").addEventListener("click", reiniciarQuiz);
}

// -------- Reiniciar --------
function reiniciarQuiz() {
  pontuacao = 0;
  indice = 0;
  tempoInicio = Date.now();
  if (tempoInterval) clearInterval(tempoInterval);
  createTimerEl();
  updateTimer();
  tempoInterval = setInterval(updateTimer, 500);

  quizSection.classList.remove("hidden");
  resultadoEl.textContent = "";
  btnProxima.style.display = "inline-block";
  mostrarPergunta();
}
