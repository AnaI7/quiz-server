const perguntas = [
	{ pergunta: "Qual é a capital de Portugal?", opcoes: ["Lisboa", "Porto", "Coimbra", "Faro"], resposta: "Lisboa" },
	{ pergunta: "Qual é 5 + 7?", opcoes: ["10", "11", "12", "13"], resposta: "12" },
	{ pergunta: "Qual é a cor do céu?", opcoes: ["Azul", "Verde", "Vermelho", "Amarelo"], resposta: "Azul" }
];

let pontuacao = 0;
let i = 0;
const nome = prompt("Qual é o seu nome?");

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
	const res = await fetch("/submit", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ nome, pontuacao })
	});
	const data = await res.json();

	document.getElementById("quiz-container").style.display = "none";
	document.getElementById("top3-container").style.display = "block";

	const lista = document.getElementById("top3");
	lista.innerHTML = "";
	data.top3.forEach(item => {
		const li = document.createElement("li");
		li.textContent = `${item.nome}: ${item.pontuacao} pontos`;
		lista.appendChild(li);
	});
}

mostrarPergunta();
