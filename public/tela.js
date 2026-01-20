const socket = io();
const btnContinuar = document.getElementById("btn-continuar");
const codigoEl = document.getElementById("codigo-sala");

let codigoSala = "";

// professor cria a sala
socket.emit("criarSala");

socket.on("salaCriada", codigo => {
	codigoSala = codigo;
	codigoEl.textContent = `Código da sala: ${codigo}`;
});

// ativa botão quando houver ≥1 aluno
socket.on("alunosAtualizados", alunos => {
	const total = Object.keys(alunos).length;
	btnContinuar.disabled = total === 0;
});

// professor inicia
btnContinuar.addEventListener("click", () => {
	socket.emit("forcarInicio", codigoSala);
});
