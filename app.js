/* =========================
   app.js — Quiz com Timer 30s (sem ouvir instrumentos)
   ========================= */

let pontuacao = 0,
    indice = 0,
    tempoInicio = null,
    tempoInterval = null,
    respostaSelecionada = false,
    timerPerguntaInterval = null,
    tempoPergunta = 30; // 30 segundos por pergunta

// elementos
const splash = document.getElementById("splash");
const startBtn = document.getElementById("startBtn");
const mainApp = document.getElementById("mainApp");
const quizSection = document.getElementById("quiz");
const perguntaEl = document.getElementById("pergunta");
const opcoesEl = document.getElementById("opcoes");
const resultadoEl = document.getElementById("resultado");
const btnProxima = document.getElementById("proxima");
const finalSection = document.getElementById("final");
const finalBox = document.getElementById("finalBox");

function elSafe(el) { return !!el; }

let currentAudio = null;
let isPlaying = false;
let progressInterval = null;

// perguntas
const perguntas = [
  { pergunta: "Quantas cordas uma guitarra tem?", opcoes: ["8", "6", "4"], resposta: "6" },
  { pergunta: "Qual destas partes é responsável por produzir o som amplificado da guitarra elétrica?", opcoes: ["Captadores", "Tarraxas", "Ponte"], resposta: "Captadores" },
  { pergunta: "Qual dessas funções o FL Studio não realiza diretamente", opcoes: ["Gravar instrumentos", "Editar aúdio", "Tocar guitarra física automaticamente"], resposta: "Tocar guitarra física automaticamente" },
  { pergunta: "Qual artista abriu portas no hip-hop para novos subgêneros no início dos anos 2000?", opcoes: ["kanye west", "Venom extreme", "Leandro Fonseca"], resposta: "kanye west" },
  { pergunta: "Quantas notas tem em uma escala musical?", opcoes: ["8", "7", "6"], resposta: "8" },
  { pergunta: "Qual é a principal diferença entre a guitarra elétrica e a acústica?", opcoes: ["A guitarra elétrica não precisa de cabos.", "A guitarra elétrica precisa de um amplificador para produzir som.", "A guitarra elétrica tem cordas de nylon."], resposta: "A guitarra elétrica precisa de um amplificador para produzir som." },
  { pergunta: "Para que serve o amplificador na guitarra elétrica?", opcoes: ["Para afinar as cordas automaticamente.", "Para aumentar e modificar o som da guitarra.", "Para carregar a bateria do instrumento."], resposta: "Para aumentar e modificar o som da guitarra." },
  { pergunta: "O que é um sintetizador?", opcoes: ["Um instrumento que grava o som de outros.", "Um instrumento que cria sons eletronicamente.", "Um tipo de microfone."], resposta: "Um instrumento que cria sons eletronicamente." },
  { pergunta: "O que o autotune faz com a voz de um cantor?", opcoes: ["Aumenta o volume da voz.", "Corrige ou altera a afinação da voz.", "Adiciona eco e reverb automaticamente."], resposta: "Corrige ou altera a afinação da voz." },
  { pergunta: "Em quais estilos musicais o autotune é mais usado atualmente?", opcoes: ["Rock clássico e jazz.", "Pop, rap e música eletrônica.", "Música erudita e ópera."], resposta: "Pop, rap e música eletrônica." }
];

localStorage.removeItem("ranking");

// Timer da pergunta em bola branca
let timerPerguntaEl = null;
function createTimerPerguntaEl() {
  if (!timerPerguntaEl && elSafe(quizSection)) {
    timerPerguntaEl = document.createElement("div");
    timerPerguntaEl.id = "timerPergunta";
    timerPerguntaEl.style.cssText = `
      width: 60px; height: 60px; border-radius: 50%; 
      border: 3px solid #fff; background: transparent; color: #fff; 
      font-weight: bold; display: flex; align-items: center; justify-content: center; 
      font-size: 24px; margin: 10px auto;
    `;
    quizSection.insertBefore(timerPerguntaEl, opcoesEl);
  }
}

function startTimerPergunta() {
  if(timerPerguntaInterval) clearInterval(timerPerguntaInterval);
  let tempoRestante = tempoPergunta;
  if(elSafe(timerPerguntaEl)) timerPerguntaEl.textContent = tempoRestante;
  timerPerguntaInterval = setInterval(() => {
    tempoRestante--;
    if(elSafe(timerPerguntaEl)) timerPerguntaEl.textContent = tempoRestante;
    if(tempoRestante <= 0) {
      clearInterval(timerPerguntaInterval);
      marcarComoErradaPorTempo();
    }
  }, 1000);
}

// Shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Partículas
(function setupParticles() {
  const canvas = document.getElementById("particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const N = 80;
  const particles = [];
  for (let i = 0; i < N; i++) {
    particles.push({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*3+1, dx: (Math.random()-0.5)*0.8, dy: Math.random()*0.6+0.2 });
  }
  function draw() {
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle="rgba(255,215,0,0.8)";
      ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x>w)p.x=0;if(p.x<0)p.x=w;
      if(p.y>h)p.y=0;if(p.y<0)p.y=h;
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener("resize",()=>{ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; });
})();

// Start quiz
if (elSafe(startBtn)) {
  startBtn.addEventListener("click", ()=>{
    if(elSafe(splash)) splash.classList.add("hidden");
    if(elSafe(mainApp)) mainApp.classList.remove("hidden");
    if(elSafe(quizSection)) quizSection.classList.remove("hidden");
    if(elSafe(finalSection)) finalSection.classList.add("hidden");

    shuffle(perguntas);
    perguntas.forEach(p=>shuffle(p.opcoes));

    tempoInicio = Date.now();
    createTimerPerguntaEl();
    pontuacao=0; indice=0;
    mostrarPergunta();
  });
}

// Mostrar pergunta
function mostrarPergunta() {
  respostaSelecionada=false;
  if(!elSafe(perguntaEl) || !elSafe(opcoesEl)) return;
  const atual = perguntas[indice];
  perguntaEl.textContent=atual.pergunta;
  opcoesEl.innerHTML="";
  resultadoEl.textContent="";

  shuffle(atual.opcoes).forEach(opcao=>{
    const btn=document.createElement("button");
    btn.textContent=opcao;
    btn.className="resposta-btn";
    btn.type="button";
    btn.addEventListener("click",()=>handleAnswer(btn,opcao));
    opcoesEl.appendChild(btn);
  });

  if(elSafe(btnProxima)) btnProxima.textContent=indice===perguntas.length-1?"Finalizar":"Próxima Pergunta";

  startTimerPergunta();
}

// Responder
function handleAnswer(btn,opcao){
  const atual=perguntas[indice];
  respostaSelecionada=true;
  clearInterval(timerPerguntaInterval);
  const botoes=Array.from(opcoesEl.querySelectorAll("button"));
  botoes.forEach(b=>b.disabled=true);
  botoes.forEach(b=>{ if(b.textContent===atual.resposta) b.classList.add("correta"); else b.classList.add("errada"); });

  const feedbackSrc = opcao===atual.resposta?"assets/sounds/correct.mp3":"assets/sounds/wrong.mp3";
  const feedbackAudio=new Audio(feedbackSrc); feedbackAudio.currentTime=0; feedbackAudio.play().catch(()=>{});

  if(opcao===atual.resposta){ pontuacao++; resultadoEl.textContent="✅ Correto!"; }
  else resultadoEl.textContent=`❌ Errado! Resposta correta: ${atual.resposta}`;
}

// Marcar como errada por tempo
function marcarComoErradaPorTempo() {
  const atual = perguntas[indice];
  respostaSelecionada = true;
  const botoes = Array.from(opcoesEl.querySelectorAll("button"));
  botoes.forEach(b => b.disabled = true);
  botoes.forEach(b => { if(b.textContent === atual.resposta) b.classList.add("correta"); else b.classList.add("errada"); });
  resultadoEl.textContent = `⏰ Tempo esgotado! Resposta correta: ${atual.resposta}`;
}

// Próxima / finalizar
if(elSafe(btnProxima)){
  btnProxima.addEventListener("click", ()=>{
    if(!respostaSelecionada){ alert("Selecione uma resposta antes de avançar!"); return; }
    if(indice<perguntas.length-1){ indice++; mostrarPergunta(); }
    else finalizarQuiz();
  });
}

// Finalizar
function finalizarQuiz(){
  clearInterval(timerPerguntaInterval);
  if(elSafe(quizSection)) quizSection.classList.add("hidden");
  if(elSafe(finalSection)) finalSection.classList.remove("hidden");

  const tempoFim=Date.now(); 
  const tempoTotalSeg=Math.floor((tempoFim-tempoInicio)/1000); 
  const erros=perguntas.length-pontuacao;
  if(!elSafe(finalBox)) return;
  finalBox.innerHTML=`
    <div style="
      background: linear-gradient(90deg,#0a98b1,#0ec0d9);
      padding: 25px; border-radius: 20px; color: #fff;
      box-shadow: 0 0 25px rgba(14,192,217,0.5);
      animation: fadeIn 1s ease;
      text-align: center;
    ">
      <h3>🎉 Fim do Quiz!</h3>
      <p>✅ Acertos: ${pontuacao}</p>
      <p>❌ Erros: ${erros}</p>
      <p>⏱ Tempo total: ${tempoTotalSeg}s</p>
      <div class="final-actions" style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
        <button id="verRanking">Ver Ranking</button>
        <button id="voltarInicio">Voltar ao Início</button>
      </div>
    </div>
  `;

  const ranking=JSON.parse(localStorage.getItem("ranking"))||[];
  ranking.push({pontuacao,tempo:tempoTotalSeg,date:new Date().toISOString()});
  ranking.sort((a,b)=>b.pontuacao-a.pontuacao||a.tempo-b.tempo);
  localStorage.setItem("ranking",JSON.stringify(ranking));

  const verRankingBtn=document.getElementById("verRanking");
  if(verRankingBtn) verRankingBtn.addEventListener("click", mostrarRanking);

  const voltarInicioBtn=document.getElementById("voltarInicio");
  if(voltarInicioBtn) voltarInicioBtn.addEventListener("click", ()=>{
    if(elSafe(finalSection)) finalSection.classList.add("hidden");
    if(elSafe(splash)) splash.classList.remove("hidden");
  });
}

// Ranking
function mostrarRanking(){
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
  let html = `
    <div style="
      background: linear-gradient(90deg,#0a98b1,#0ec0d9);
      padding: 25px; border-radius: 20px; color: #fff;
      box-shadow: 0 0 25px rgba(14,192,217,0.5);
      animation: fadeIn 1s ease;
      text-align: center;
    ">
      <h2>🏆 Ranking</h2>
      <ol style="text-align:left; padding-left:20px; margin-top:15px;">
  `;

  ranking.forEach((entry,i)=>{
    const d = new Date(entry.date);
    html += `<li style="margin-bottom:8px;">#${i+1} — ${entry.pontuacao} pts • ${entry.tempo}s <span class="rank-date">(${d.toLocaleDateString()} ${d.toLocaleTimeString()})</span></li>`;
  });

  html += `</ol>
      <div class='final-actions' style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
        <button id='reiniciarQuiz2'>Reiniciar Quiz</button>
        <button id='voltarInicioRanking'>Voltar ao Início</button>
      </div>
    </div>
  `;

  finalBox.innerHTML = html;

  const reiniciarBtn = document.getElementById("reiniciarQuiz2");
  if(reiniciarBtn) reiniciarBtn.addEventListener("click", reiniciarQuiz);

  const voltarInicioRankingBtn = document.getElementById("voltarInicioRanking");
  if(voltarInicioRankingBtn) voltarInicioRankingBtn.addEventListener("click", ()=>{
    if(elSafe(finalSection)) finalSection.classList.add("hidden");
    if(elSafe(splash)) splash.classList.remove("hidden");
  });
}

// Reiniciar
function reiniciarQuiz(){
  pontuacao=0; indice=0; tempoInicio=Date.now();
  createTimerPerguntaEl();
  shuffle(perguntas); perguntas.forEach(p=>shuffle(p.opcoes));
  if(elSafe(quizSection)) quizSection.classList.remove("hidden");
  if(elSafe(finalSection)) finalSection.classList.add("hidden");
  mostrarPergunta();
}
