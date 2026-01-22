// ================= IMPORTAÇÕES =================
const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// ================= APP =================
const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= BASE DE DADOS =================
const db = new sqlite3.Database("quiz.db");

// cria tabela se não existir
db.run(`
	CREATE TABLE IF NOT EXISTS resultados (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		nome TEXT,
		acertos INTEGER,
		total INTEGER,
		data DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);

// ================= PERGUNTAS =================
const perguntas = [
	{
		pergunta: "Qual é a capital de Portugal?",
		opcoes: ["Lisboa", "Porto", "Coimbra", "Braga"],
		correta: 0
	},
	{
		pergunta: "Quantos continentes existem?",
		opcoes: ["5", "6", "7", "8"],
		correta: 2
	},
	{
		pergunta: "Quem escreveu 'Os Lusíadas'?",
		opcoes: ["Fernando Pessoa", "Eça de Queirós", "Luís de Camões", "Gil Vicente"],
		correta: 2
	},
	{
		pergunta: "Qual é o maior planeta do Sistema Solar?",
		opcoes: ["Terra", "Júpiter", "Saturno", "Marte"],
		correta: 1
	},
	{
		pergunta: "Qual é o símbolo químico da água?",
		opcoes: ["O2", "CO2", "H2O", "HO"],
		correta: 2
	},
	// 👉 adiciona até 20 perguntas
];

// ================= FUNÇÕES =================
function escolherPerguntasAleatorias(lista, quantidade) {
	return [...lista].sort(() => Math.random() - 0.5).slice(0, quantidade);
}

// ================= ESTADO DO QUIZ =================
let quizAtual = {};

// ================= ROTAS =================

// Página inicial → aluno
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "aluno.html"));
});

// Iniciar quiz
app.post("/iniciar", (req, res) => {
	const { nome } = req.body;

	const selecionadas = escolherPerguntasAleatorias(perguntas, 10);

	quizAtual = {
		nome,
		perguntas: selecionadas,
		atual: 0,
		acertos: 0
	};

	res.json({
		pergunta: selecionadas[0],
		index: 0
	});
});

// Responder pergunta
app.post("/responder", (req, res) => {
	const { resposta } = req.body;
	const atual = quizAtual.perguntas[quizAtual.atual];

	if (resposta === atual.correta) {
		quizAtual.acertos++;
	}

	quizAtual.atual++;

	// fim do quiz
	if (quizAtual.atual >= quizAtual.perguntas.length) {
		db.run(
			"INSERT INTO resultados (nome, acertos, total) VALUES (?, ?, ?)",
			[quizAtual.nome, quizAtual.acertos, quizAtual.perguntas.length]
		);

		return res.json({
			fim: true,
			acertos: quizAtual.acertos,
			total: quizAtual.perguntas.length
		});
	}

	// próxima pergunta
	res.json({
		fim: false,
		pergunta: quizAtual.perguntas[quizAtual.atual],
		index: quizAtual.atual
	});
});

// ================= SERVIDOR =================
app.listen(PORT, () => {
	console.log(`Servidor a correr em http://localhost:${PORT}`);
});
