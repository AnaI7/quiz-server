const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 3000;

// 🔹 cria servidor HTTP
const server = http.createServer(app);

// 🔹 cria o io AQUI (antes de usar)
const io = new Server(server);

// ---------------- MIDDLEWARE ----------------
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

// ---------------- ROTAS HTTP ----------------
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "tela.html"));
});

// ---------------- DADOS ----------------
let salas = {}; // { CODIGO: { alunos, iniciada } }

// ---------------- SOCKET.IO ----------------
io.on("connection", socket => {
	console.log("Novo utilizador ligado:", socket.id);

	// 🧑‍🏫 PROFESSOR cria sala
	socket.on("criarSala", () => {
		const codigo = Math.random().toString(36)
			.substring(2, 6)
			.toUpperCase();

		salas[codigo] = {
			alunos: {},
			iniciada: false
		};

		socket.join(codigo); // 🔑 professor entra na sala
		socket.emit("salaCriada", codigo);

		console.log("Sala criada:", codigo);
	});

	// 👩‍🎓 ALUNO entra na sala
	socket.on("entrarSala", ({ codigo, nome, avatar }) => {
		const sala = salas[codigo];
		if (!sala || sala.iniciada) return;

		const total = Object.keys(sala.alunos).length;

		// limite 10 alunos
		if (total >= 10) {
			socket.emit("salaCheia");
			return;
		}

		sala.alunos[socket.id] = {
			nome,
			avatar,
			pontos: 0
		};

		socket.join(codigo);

		io.to(codigo).emit("alunosAtualizados", sala.alunos);

		// início automático aos 10
		if (Object.keys(sala.alunos).length === 10) {
			sala.iniciada = true;
			io.to(codigo).emit("iniciarQuiz");
		}
	});

	// 🧑‍🏫 PROFESSOR força início
	socket.on("forcarInicio", codigo => {
		const sala = salas[codigo];
		if (!sala || sala.iniciada) return;

		sala.iniciada = true;
		io.to(codigo).emit("iniciarQuiz");
	});
});

// ---------------- INICIAR SERVIDOR ----------------
server.listen(PORT, () => {
	console.log(`Servidor a correr em http://localhost:${PORT}`);
});
