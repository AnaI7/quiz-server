// ESTE FICHEIRO É SÓ PARA O ALUNO
const socket = io();

console.log("aluno.js carregado");

// elementos
const btnContinuar = document.getElementById("btn-continuar");
const nomeInput = document.getElementById("nome");
const codigoInput = document.getElementById("codigo-input");
const nomeContainer = document.getElementById("nome-container");
const quizContainer = document.getElementById("quiz-container");
const avatarElements = document.querySelectorAll(".avatar");

// estado
let nome = "";
let avatarEscolhido = "";
let codigoSala = "";
let perguntas = [];
let i = 0;
let pontuacao = 0;

/* ---------- SELEÇÃO DE AVATAR ---------- */
avatarElements.forEach(el => {
	el.addEventListener("click", () => {
		console.log("Avatar clicado");

		avatarElements.forEach(a => a.classList.remove("selecionado"));
		el.classList.add("selecionado");

		avatarEscolhido = el.dataset.avatar;
		btnContinuar.disabled = false;
	});
});

/* ---------- SALA CHEIA ---------- */
socket.on("salaCheia", () => {
	alert("O cérebro acertou… mas os dedos foram lentos! A sala está cheia!);
	btnContinuar.disabled = false;
	btnContinuar.textContent = "Continuar";
});

/* ---------- ALUNO CLICA CONTINUAR ---------- */
btnContinuar.addEventListener("click", () => {
	nome = nomeInput.value.trim();
	codigoSala = codigoInput.value.trim().toUpperCase();

	if (!nome || !avatarEscolhido || !codigoSala) {
		alert("Preenche código, nome e avatar!");
		return;
	}

	socket.emit("entrarSala", {
		codigo: codigoSala,
		nome,
		avatar: avatarEscolhido
	});

	btnContinuar.disabled = true;
	btnContinuar.textContent = "À espera do professor…";
});

/* ---------- QUIZ COMEÇA ---------- */
socket.on("iniciarQuiz", async () => {
	nomeContainer.style.display = "none";
	quizContainer.style.display = "block";

	const res = await fetch("/perguntas");
	perguntas = await res.json();

	i = 0;
	pontuacao = 0;
	mostrarPergunta();
});

/* ---------- QUIZ ---------- */
function mostrarPergunta() {
	if (i >= perguntas.length) {
		alert(`Fim do quiz! Pontuação: ${pontuacao}`);
		return;
	}

	const p = perguntas[i];
	document.getElementById("pergunta").textContent = p.pergunta;

	const div = document.getElementById("opcoes");
	div.innerHTML = "";

	p.opcoes.forEach(opcao => {
		const btn = document.createElement("button");
		btn.textContent = opcao;
		btn.onclick = () => {
			if (opcao === p.resposta) pontuacao++;
			i++;
			mostrarPergunta();
		};
		div.appendChild(btn);
	});
}
