const tabLogin = document.getElementById("tab-login");
const tabRegisto = document.getElementById("tab-registo");
const btnSubmit = document.getElementById("btn-submit");
const mensagem = document.getElementById("mensagem");

let modo = "login"; // login | registo

tabLogin.onclick = () => {
	modo = "login";
	tabLogin.classList.add("active");
	tabRegisto.classList.remove("active");
	btnSubmit.textContent = "Entrar";
	mensagem.textContent = "";
};

tabRegisto.onclick = () => {
	modo = "registo";
	tabRegisto.classList.add("active");
	tabLogin.classList.remove("active");
	btnSubmit.textContent = "Registar";
	mensagem.textContent = "";
};

btnSubmit.onclick = async () => {
	const username = document.getElementById("username").value.trim();
	const password = document.getElementById("password").value.trim();

	if (!username || !password) {
		mensagem.textContent = "Preenche todos os campos.";
		return;
	}

	const endpoint = modo === "login" ? "/login" : "/register";

	const res = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password })
	});

	const data = await res.json();

	if (!res.ok) {
		mensagem.textContent = data.erro || "Erro";
		return;
	}

	if (modo === "registo") {
		mensagem.style.color = "green";
		mensagem.textContent = "Registo efetuado com sucesso!";
	} else {
		window.location.href = "/";
	}
};

