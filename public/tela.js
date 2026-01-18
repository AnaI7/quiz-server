async function atualizarTop3() {
	const res = await fetch("/resposta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: "", pontuacao: 0 }) });
	const data = await res.json();
	const lista = document.getElementById("top3");
	lista.innerHTML = "";
	data.top3.forEach(item => {
		const li = document.createElement("li");
		li.textContent = `${item.nome}: ${item.pontuacao} pontos`;
		lista.appendChild(li);
	});
}

// Atualiza a cada 3 segundos
setInterval(atualizarTop3, 3000);
atualizarTop3();
