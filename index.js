// ================= IMPORTAÇÕES =================
const express = require("express");
const path = require("path");

const perguntas = require("./perguntas"); // perguntas.js
const db = require("./db");               // db.js

// ================= APP =================
const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= ESTADO DO QUIZ =================
let quizAtual = null;

// ================= FUNÇÕES =================
function escolherPerguntasAleatorias(lista, quantidade) {
	return [...lista].sort(() => Math.random() - 0.5).slice(0, quantidade);
}

// ================= ROTAS =================

// Página inicial → aluno
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "aluno.html"));
});

// ---------------- INICIAR QUIZ ----------------
app.post("/iniciar", (req, res) => {
	const { nome } = req.body;

	if (!nome) {
		return res.status(400).json({ erro: "Nome obrigatório" });
	}

	const selecionadas = escolherPerguntasAleatorias(perguntas, 10);

	quizAtual = {
		nome,
		perguntas: selecionadas,
		atual: 0,
		acertos: 0
	};

	res.json({
		pergunta: quizAtual.perguntas[0]
	});
});

// ---------------- RESPONDER ----------------
app.post("/responder", (req, res) => {
	if (!quizAtual) {
		return res.status(400).json({ erro: "Quiz não iniciado" });
	}

	const { resposta } = req.body;
	const pergunta = quizAtual.perguntas[quizAtual.atual];

	const acertou = resposta === pergunta.correta;
	if (acertou) quizAtual.acertos++;

	quizAtual.atual++;

	// FIM DO QUIZ
	if (quizAtual.atual >= quizAtual.perguntas.length) {
		db.run(
			"INSERT INTO resultados (nome, acertos, total) VALUES (?, ?, ?)",
			[quizAtual.nome, quizAtual.acertos, quizAtual.perguntas.length]
		);

		return res.json({
			fim: true,
			acertos: quizAtual.acertos,
			total: quizAtual.perguntas.length,
			acertou
		});
	}

	// PRÓXIMA PERGUNTA
	res.json({
		fim: false,
		acertou,
		pergunta: quizAtual.perguntas[quizAtual.atual]
	});
});

// ================= SERVIDOR =================
app.listen(PORT, () => {
	console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
});
