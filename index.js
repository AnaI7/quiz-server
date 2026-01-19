io.on("connection", socket => {
	console.log("Novo utilizador ligado:", socket.id);

	// Professor cria sala
	socket.on("criarSala", () => {
		const codigo = Math.random().toString(36).substring(2, 6).toUpperCase();
		salas[codigo] = { alunos: {}, iniciada: false };
		socket.join(codigo);
		socket.emit("salaCriada", codigo);
	});

	// Aluno entra na sala
	socket.on("entrarSala", ({ codigo, nome, avatar }) => {
		const sala = salas[codigo];
		if (!sala || sala.iniciada) return;

		const totalAntes = Object.keys(sala.alunos).length;

		// Limite de 10 jogadores
		if (totalAntes >= 10) {
			socket.emit("salaCheia");
			return;
		}

		sala.alunos[socket.id] = {
			nome,
			avatar,
			pontos: 0
		};

		socket.join(codigo);

		const totalDepois = Object.keys(sala.alunos).length;

		// Atualiza professor
		io.to(codigo).emit("alunosAtualizados", sala.alunos);

		// ✅ Se chegaram a 10 alunos → começa automaticamente
		if (totalDepois === 10) {
			sala.iniciada = true;
			io.to(codigo).emit("iniciarQuiz");
		}
	});

	// Professor força início
	socket.on("forcarInicio", codigo => {
		const sala = salas[codigo];
		if (!sala || sala.iniciada) return;

		sala.iniciada = true;
		io.to(codigo).emit("iniciarQuiz");
	});

	// Aluno responde
	socket.on("resposta", ({ codigo, correta }) => {
		if (correta && salas[codigo]?.alunos[socket.id]) {
			salas[codigo].alunos[socket.id].pontos += 10;
		}
	});
});
