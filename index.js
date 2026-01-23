// ================= IMPORTAÇÕES =================
const express = require("express");
const path = require("path");
const session = require("express-session");

const perguntas = require("./perguntas"); // perguntas.js
const db = require("./db");               // db.js

// ================= APP =================
const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
	secret: "quiz-secret",
	resave: false,
	saveUninitialized: false
}));

// ================= ESTADO DO QUIZ =================
// (1 quiz ativo por utilizador – suficiente para o projeto)
let quizAtual = null;

// ================= FUNÇÕES =================
function escolherPerguntasAleatorias(lista, quantidade) {
	return [...lista].sort(() => Math.random() - 0.5).slice(0, quantidade);
}

// ================= ROTAS =================

/* ---------- PÁGINA INICIAL ---------- */
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------- LOGIN ---------- */
app.get("/login.html", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* ---------- QUIZ (PROTEGIDO) ---------- */
app.get("/aluno.html", (req, res) => {
	if (!req.session.userId) {
		return res.redirect("/login.html");
	}

	res.sendFile(path.join(__dirname, "public", "aluno.html"));
});

/* ---------- REGISTO ---------- */
app.post("/register", (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).json({ erro: "Dados em falta" });
	}

	db.run(
		"INSERT INTO users (username, password) VALUES (?, ?)",
		[username, password],
		function (err) {
			if (err) {
				return res.status(400).json({ erro: "Utilizador já existe" });
			}
			res.json({ sucesso: true });
		}
	);
});

/* ---------- LOGIN ---------- */
app.post("/login", (req, res) => {
	const { username, password } = req.body;

	db.get(
		"SELECT * FROM users WHERE username = ? AND password = ?",
		[username, password],
		(err, user) => {
			if (!user) {
				return res.status(401).json({ erro: "Credenciais inválidas" });
			}

			req.session.userId = user.id;
			req.session.username = user.username;

			res.json({ sucesso: true });
		}
	);
});

/* ---------- LOGOUT ---------- */
app.post("/logout", (req, res) => {
	req.session.destroy(() => {
		res.json({ sucesso: true });
	});
});

/* ---------- INICIAR QUIZ ---------- */
app.post("/iniciar", (req, res) => {
	if (!req.session.userId) {
		return res.status(401).json({ erro: "Não autenticado" });
	}

	const selecionadas = escolherPerguntasAleatorias(perguntas, 10);

	quizAtual = {
		userId: req.session.userId,
		perguntas: selecionadas,
		atual: 0,
		acertos: 0
	};

	res.json({
		fim: false,
		pergunta: quizAtual.perguntas[0]
	});
});

/* ---------- RESPONDER ---------- */
app.post("/responder", (req, res) => {
	if (!quizAtual || !quizAtual.perguntas) {
		return res.status(400).json({ erro: "Quiz não iniciado" });
	}

	const { resposta } = req.body;
	const perguntaAtual = quizAtual.perguntas[quizAtual.atual];

	const acertou = resposta === perguntaAtual.correta;
	if (acertou) quizAtual.acertos++;

	quizAtual.atual++;

	// ===== FIM DO QUIZ =====
	if (quizAtual.atual >= quizAtual.perguntas.length) {
		db.run(
			"INSERT INTO resultados (user_id, acertos, total) VALUES (?, ?, ?)",
			[quizAtual.userId, quizAtual.acertos, quizAtual.perguntas.length]
		);

		return res.json({
			fim: true,
			acertos: quizAtual.acertos,
			total: quizAtual.perguntas.length,
			acertou
		});
	}

	// ===== PRÓXIMA PERGUNTA =====
	res.json({
		fim: false,
		acertou,
		pergunta: quizAtual.perguntas[quizAtual.atual]
	});
});

/* ---------- ESTATÍSTICAS ---------- */
app.get("/estatisticas", (req, res) => {
	if (!req.session.userId) {
		return res.status(401).json({ erro: "Não autenticado" });
	}

	db.all(
		"SELECT acertos, total, data FROM resultados WHERE user_id = ?",
		[req.session.userId],
		(err, rows) => {
			res.json(rows);
		}
	);
});

// ================= SERVIDOR =================
app.listen(PORT, () => {
	console.log(`✅ Servidor a correr em http://localhost:${PORT}`);
});
