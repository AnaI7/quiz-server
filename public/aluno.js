
const btnContinuar = document.getElementById("btn-continuar");
const nomeInput = document.getElementById("nome");
const nomeContainer = document.getElementById("nome-container");
const quizContainer = document.getElementById("quiz-container");

const perguntaEl = document.getElementById("pergunta");
const opcoesEl = document.getElementById("opcoes");

const resultadoDiv = document.getElementById("resultado");
const resultadoTexto = document.getElementById("resultado-texto");

// ================= ESTADO =================
let perguntas = [];
let indiceAtual = 0;

// ================= INICIAR QUIZ =================
btnContinuar.addEventListener("click", async () => {
	const nome = nomeInput.value.trim();

	if (!nome) {
		alert("Escreve o teu nome!");
		return;
	}

	// pedido ao servidor para iniciar quiz
	const res = await fetch("/iniciar", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ nome })
	});

	const data = await res.json();

	// muda de ecrã
	nomeContainer.style.display = "none";
	quizContainer.style.display = "block";

	// mostra primeira pergunta
	mostrarPergunta(data.pergunta);
});

// ================= MOSTRAR PERGUNTA =================
function mostrarPergunta(pergunta) {
	perguntaEl.textContent = pergunta.pergunta;
	opcoesEl.innerHTML = "";

	pergunta.opcoes.forEach((opcao, index) => {
		const btn = document.createElement("button");
		btn.textContent = opcao;

		btn.addEventListener("click", async () => {
			// envia resposta ao servidor
			const res = await fetch("/responder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ resposta: index })
			});

			const data = await res.json();

			// fim do quiz
			if (data.fim) {
				mostrarResultado(data.acertos, data.total);
				return;
			}

			// próxima pergunta
			mostrarPergunta(data.pergunta);
		});

		opcoesEl.appendChild(btn);
	});
}

// ================= RESULTADO FINAL =================
function mostrarResultado(acertos, total) {
	quizContainer.style.display = "none";
	resultadoDiv.style.display = "block";

	let mensagem = "";

	if (acertos <= 4) {
		mensagem = "Precisas de rever a matéria 🙂";
	} else if (acertos <= 7) {
		mensagem = "Bom trabalho 👍";
	} else {
		mensagem = "Excelente! 👏";
	}

	resultadoTexto.textContent =
		`Tiveste ${acertos} / ${total} respostas certas\n${mensagem}`;
}
