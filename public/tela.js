import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io();

//  usamos o MESMO botão e ID do aluno
const btnContinuar = document.getElementById("btn-continuar");

// usa o mesmo código de sala que os alunos
const codigoSala = "ABCD"; // depois pode ser dinâmico

// 🔹 Ativar botão quando houver pelo menos 1 aluno
socket.on("alunosAtualizados", alunos => {
	const total = Object.keys(alunos).length;

	console.log("Alunos ligados:", total);

	btnContinuar.disabled = total === 0;
});

// 🔹 Professor força início do quiz
btnContinuar.addEventListener("click", () => {
	console.log("Professor clicou em Continuar");
	socket.emit("forcarInicio", codigoSala);
});

// 🔹 Quando o quiz começa
socket.on("iniciarQuiz", () => {
	console.log("Quiz iniciado!");

	// aqui podes, por exemplo:
	// btnContinuar.style.display = "none";
	// mostrar a próxima fase do quiz
});
