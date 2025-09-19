const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'profuturo_db'
});

async function atualizarSenhas() {
  const [rows] = await db.promise().query("SELECT id_usuario, senha FROM usuarios");

  for (const row of rows) {
    const hash = await bcrypt.hash(row.senha, 10); 
    await db.promise().query("UPDATE usuarios SET senha = ? WHERE id_usuario = ?", [hash, row.id_usuario]);
    console.log(`Senha do usuário ${row.id_usuario} atualizada com hash.`);
  }

  db.end();
}

atualizarSenhas();
