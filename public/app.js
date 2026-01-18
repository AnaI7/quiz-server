const btnIniciar = document.getElementById("btn-iniciar");
const nomeInput = document.getElementById("nome");
const inicioDiv = document.getElementById("inicio");
const quizContainer = document.getElementById("quiz-container");

const perguntas = [
	{ pergunta: "Qual é a capital de Portugal?", opcoes: ["Lisboa", "Porto", "Coimbra", "Faro"], resposta: "Lisboa" },
	{ pergunta: "Qual é 5 + 7?", opcoes: ["10", "11", "12", "13"], resposta: "12" },
	{ pergunta: "Qual é a cor do céu?", opcoes: ["Azul", "Verde", "Vermelho", "Amarelo"], resposta: "Azul" }
];

let pontuacao = 0;
let i = 0;

// Evento do botão
btnIniciar.addEventListener("click", () => {
	const nome = nomeInput.value.trim();
	if (nome === "") {
		alert("Por favor, escreve o teu nome!");
		return;
	}

	// Esconde a tela inicial e mostra o quiz
	inicioDiv.style.display = "none";
	quizContainer.style.display = "block";

	// Inicia o quiz
	mostrarPergunta(nome);
});

function mostrarPergunta(nome) {
	if (i >= perguntas.length) {
		enviarResultado(nome);
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
			mostrarPergunta(nome); // passa o nome
		});
		divOpcoes.appendChild(btn);
	});
}

async function enviarResultado(nome) {
	const res = await fetch("/submit", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ nome, pontuacao })
	});

	const data = await res.json();

	quizContainer.style.display = "none";
	document.getElementById("top3-container").style.display = "block";

	const lista = document.getElementById("top3");
	lista.innerHTML = "";
	data.top3.forEach(item => {
		const li = document.createElement("li");
		li.textContent = `${item.nome}: ${item.pontuacao} pontos`;
		lista.appendChild(li);
	});
}
