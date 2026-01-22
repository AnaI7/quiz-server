const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("quiz.db");

db.serialize(() => {
	db.run(`
		CREATE TABLE IF NOT EXISTS resultados (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			nome TEXT,
			acertos INTEGER,
			total INTEGER,
			data DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);
});

module.exports = db;
