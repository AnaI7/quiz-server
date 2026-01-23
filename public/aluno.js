const btnContinuar = document.getElementById("btn-continuar");
const nomeInput = document.getElementById("nome");

const nomeContainer = document.getElementById("nome-container");
const quizContainer = document.getElementById("quiz-container");
const topBar = document.getElementById("top-bar");

const perguntaEl = document.getElementById("pergunta");
const opcoesEl = document.getElementById("opcoes");

const progressoEl = document.getElementById("progresso");
const pontosEl = document.getElementById("pontos");

const resultadoDiv = document.getElementById("resultado");
const resultadoTexto = document.getElementById("resultado-texto");

const letras = ["A", "B", "C", "D"];

// ===== ESTADO =====
let numeroPergunta = 1;
let totalPerguntas = 10;
let pontos = 0;

// ===== INICIAR QUIZ =====
btnContinuar.addEventListener("click", async () => {
	const nome = nomeInput.value.trim();
	if (!nome) {
		alert("Escreve o teu nome!");
		return;
	}

	const res = await fetch("/iniciar", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ nome })
	});

	const data = await res.json();

	// reset estado
	numeroPergunta = 1;
	pontos = 0;

	// muda ecrãs
	nomeContainer.style.display = "none";
	topBar.style.display = "flex";
	quizContainer.style.display = "block";

	atualizarTopBar();
	mostrarPergunta(data.pergunta);
});

// ===== MOSTRAR PERGUNTA =====
function mostrarPergunta(pergunta) {
	perguntaEl.textContent = pergunta.pergunta;
	opcoesEl.innerHTML = "";

	pergunta.opcoes.forEach((texto, index) => {
		const div = document.createElement("div");
		div.className = "opcao";

		div.innerHTML = `
			<span>${letras[index]}</span>
			${texto}
		`;

		div.onclick = async () => {

			// desativa todas as opções
			const todasOpcoes = document.querySelectorAll(".opcao");
			todasOpcoes.forEach(o => {
				o.classList.add("desativada");
				o.onclick = null;
			});

			const res = await fetch("/responder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ resposta: index })
			});

			const data = await res.json();
			const indiceCorreto = pergunta.correta;

			if (data.acertou) {
				// correta → verde imediato
				div.classList.add("correta");
				pontos++;

				// avança após 1s
				setTimeout(() => {
					if (data.fim) {
						mostrarResultado(data.acertos, data.total);
					} else {
						numeroPergunta++;
						atualizarTopBar();
						mostrarPergunta(data.pergunta);
					}
				}, 1000);

			} else {
				// errada → vermelho imediato
				div.classList.add("errada");

				// após 1s mostra a correta
				setTimeout(() => {
					todasOpcoes[indiceCorreto].classList.add("correta");
				}, 1000);

				//  após 2s avança
				setTimeout(() => {
					if (data.fim) {
						mostrarResultado(data.acertos, data.total);
					} else {
						numeroPergunta++;
						atualizarTopBar();
						mostrarPergunta(data.pergunta);
					}
				}, 2000);
			}
		};

		opcoesEl.appendChild(div);
	});
}


// ===== ATUALIZAR TOP BAR =====
function atualizarTopBar() {
	pontosEl.textContent = `★ ${pontos}`;
	progressoEl.textContent = `⦿ ${numeroPergunta}/${totalPerguntas}`;
}

// ===== RESULTADO FINAL =====
function mostrarResultado(acertos, total) {
	topBar.style.display = "none";
	quizContainer.style.display = "none";
	resultadoDiv.style.display = "block";

	let msg =
		acertos >= 8 ? "Excelente! 👏" :
			acertos >= 5 ? "Bom trabalho 👍" :
				"Precisas de estudar mais 🙂";

	resultadoTexto.textContent =
		`Tiveste ${acertos} / ${total} respostas certas\n${msg}`;
}
