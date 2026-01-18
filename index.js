const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 3000;

// cria servidor HTTP (necessário para o Socket.IO)
const server = http.createServer(app);
const io = new Server(server);

// Dados da turma
let resultados = [];
let salas = {}; // salas do quiz (tipo Kahoot)

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

/* ---------------- ROTAS HTTP (mantidas) ---------------- */

// Rota principal
app.get("/", (req, res) => {
	console.log("A rota / foi acedida");
	res.sendFile(path.join(__dirname, "public", "tela.html"), err => {
		if (err) {
			console.error("Erro ao enviar tela.html:", err);
			res.status(500).send("Erro ao carregar a página");
		}
	});
});

// Submissão tradicional (continua a funcionar)
app.post("/submit", (req, res) => {
	const { nome, pontuacao } = req.body;

	resultados.push({ nome, pontuacao });
	resultados.sort((a, b) => b.pontuacao - a.pontuacao);

	res.json({ top3: resultados.slice(0, 3) });
});

/* ---------------- SOCKET.IO (tempo real) ---------------- */

io.on("connection", socket => {
	console.log("Novo utilizador ligado:", socket.id);

	// Professor cria sala
	socket.on("criarSala", () => {
		const codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
		salas[codigo] = { alunos: {} };
		socket.join(codigo);
		socket.emit("salaCriada", codigo);
	});

	// Aluno entra na sala
	socket.on("entrarSala", ({ codigo, nome }) => {
		const sala = salas[codigo];
		if (!sala) return;

		// 🔹 Limite de 10 jogadores
		const numAlunos = Object.keys(sala.alunos).length;
		if (numAlunos >= 10) {
			socket.emit("salaCheia");
			return;
		}

		// adiciona o aluno
		sala.alunos[socket.id] = {
			nome,
			pontos: 0
		};
		socket.join(codigo);

		// envia lista atualizada de alunos para todos na sala
		io.to(codigo).emit("alunosAtualizados", sala.alunos);
	});

	// Aluno responde (para usar depois)
	socket.on("resposta", ({ codigo, correta }) => {
		if (correta && salas[codigo]?.alunos[socket.id]) {
			salas[codigo].alunos[socket.id].pontos += 10;
		}
	});
});

/* ---------------- INICIAR SERVIDOR ---------------- */

server.listen(PORT, () => {
	console.log(`Servidor a correr em http://localhost:${PORT}`);
});
