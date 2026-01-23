const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("quiz.db");

db.serialize(() => {
	// Utilizadores
	db.run(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE,
			password TEXT
		)
	`);

	// Resultados
	db.run(`
		CREATE TABLE IF NOT EXISTS resultados (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			acertos INTEGER,
			total INTEGER,
			data DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)
	`);
});

module.exports = db;
