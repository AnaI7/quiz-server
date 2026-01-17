const express = require("express");
const app = express();
const port = 3000;

app.use(express.json()); // Para receber JSON
app.use(express.static("public")); // Servir arquivos HTML/JS/CSS

let resultados = []; // Aqui guardamos os resultados

// Rota para enviar respostas
app.post("/submit", (req, res) => {
	const { nome, pontuacao } = req.body;
	resultados.push({ nome, pontuacao });
	// Ordena do maior para o menor
	resultados.sort((a, b) => b.pontuacao - a.pontuacao);
	res.json({ top3: resultados.slice(0, 3) });
});

// Inicia servidor
app.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
