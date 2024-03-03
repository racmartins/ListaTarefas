// Importar dependências
const express = require("express");
const connection = require("./database/database"); //módulo de conexão

// Criar uma instância do Express
const app = express();

// Configurar o EJS como view engine
app.set("view engine", "ejs");

// Configurar o middleware para analisar dados de formulário
app.use(express.urlencoded({ extended: false }));

// Rota principal - exibe a lista de tarefas
/* 
Nesta versão, estamos a usar um LEFT JOIN entre as tabelas tasks e users na BD. 
A consulta agora retorna os dados da tabela tasks juntamente com o nome do utilizador 
(como user_name) correspondente ao user_id na tabela users. De seguida, mapeamos os 
resultados para criar o array de tarefas com as informações necessárias, 
incluindo o nome do utilizador atribuído 
*/
app.get("/", (req, res) => {
  connection.query(
    "SELECT tasks.*, users.name AS user_name FROM tasks LEFT JOIN users ON tasks.user_id = users.id",
    (err, results) => {
      if (err) throw err;
      const tasks = results.map((task) => ({
        id: task.id,
        task: task.task,
        status: task.status, //pendente, completa
        user: {
          id: task.user_id,
          name: task.user_name,
        },
      }));

      // Mostra a lista de utilizadores
      connection.query("SELECT * FROM users", (err, users) => {
        if (err) throw err;
        res.render("index", { tasks, users });
      });
    }
  );
});

// Rota para adicionar uma nova tarefa
app.post("/add", (req, res) => {
  const { task, status, userId } = req.body;
  connection.query(
    "INSERT INTO tasks (task, status, user_id) VALUES (?, ?, ?)",
    [task, status, userId],
    (err, results) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});
// Rota para associar uma tarefa a um utilizador
app.post("/assign", (req, res) => {
  const { userId, taskId } = req.body;
  connection.query(
    "UPDATE tasks SET user_id = ? WHERE id = ?",
    [userId, taskId],
    (err, results) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});
