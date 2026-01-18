const socket = io();

const btnIniciar = document.getElementById("btn-iniciar");
const nomeInput = document.getElementById("nome");
const nomeContainer = document.getElementById("nome-container");
const quizContainer = document.getElementById("quiz-container");
const avatarElements = document.querySelectorAll(".avatar");

let perguntas = [];
let i = 0;
let pontuacao = 0;
let nome = "";
let avatarEscolhido = "";
let codigoSala = "ABCD"; // ou input para sala

// Seleção de avatar
avatarElements.forEach(el => {
	el.addEventListener("click", () => {
		avatarElements.forEach(a => a.classList.remove("selecionado"));
		el.classList.add("selecionado");
		avatarEscolhido = el.dataset.avatar; // guarda a escolha
	});
});

// Sala cheia
socket.on("salaCheia", () => {
	alert("Desculpe, esta sala já tem 10 jogadores!");
	nomeContainer.style.display = "block";
	quizContainer.style.display = "none";
});

btnIniciar.addEventListener("click", async () => {
	nome = nomeInput.value.trim();
	if (!nome) {
		alert("Por favor escreve o teu nome!");
		return;
	}
	if (!avatarEscolhido) {
		alert("Escolhe um avatar!");
		return;
	}

	// Envia info para o servidor
	socket.emit("entrarSala", { codigo: codigoSala, nome, avatar: avatarEscolhido });

	// Mostra quiz
	nomeContainer.style.display = "none";
	quizContainer.style.display = "block";

	// Pega perguntas do servidor
	const res = await fetch("/perguntas");
	perguntas = await res.json();

	mostrarPergunta();
});

function mostrarPergunta() {
	if (i >= perguntas.length) {
		enviarResultado();
		return;
	}

	const p = perguntas[i];
	document.getElementById("pergunta").textContent = p.pergunta;

	const divOpcoes = document.getElementById("opcoes");
	divOpcoes.innerHTML = "";

	p.opcoes.forEach(opcao => {
		const btn = document.createElement("button");
		btn.textContent = opcao;
		btn.addEventListener("click", () => {
			if (opcao === p.resposta) pontuacao++;
			i++;
			mostrarPergunta();
		});
		divOpcoes.appendChild(btn);
	});
}

async function enviarResultado() {
	const res = await fetch("/resposta", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ nome, pontuacao })
	});
	const data = await res.json();
	alert(`Quiz terminado! A tua pontuação: ${pontuacao}`);
	quizContainer.style.display = "none";
	nomeContainer.style.display = "block";
	i = 0; pontuacao = 0; perguntas = [];
}
