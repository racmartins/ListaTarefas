//Importar o módulo express
const express = require("express");

//Importar o módulo mysql2
const mysql = require("mysql2");

//Criar uma instância de express
const app = express();

// Definição do motor de renderização ejs
app.set("view engine", "ejs");

// Configurar o middleware para analisar dados de formulário
app.use(express.urlencoded({ extended: false }));

// Configurar conexão com a base de dados MySQL
const connection = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "task_manager",
});

// Rota principal - exibir lista de tarefas
app.get("/", (req, res) => {
  // Consultar tarefas na base de dados
  connection.query("SELECT * FROM tasks", (err, results) => {
    if (err) throw err;

    // Renderizar a página de lista de tarefas com os resultados da consulta
    res.render("index", { tasks: results });
  });
});

// Rota para adicionar uma nova tarefa
app.post("/add", (req, res) => {
  const { user, task } = req.body;
  // Inserir nova tarefa na base de dados
  connection.query(
    "INSERT INTO tasks (user, task) VALUES (?, ?)",
    [user, task],
    (err, results) => {
      if (err) throw err;

      // Redirecionar para a página principal
      res.redirect("/");
    }
  );
});

// Rota para exibir a página de edição da tarefa
app.get("/edit/:id", (req, res) => {
  const taskId = req.params.id;

  // Consultar a tarefa com base no ID fornecido
  connection.query(
    "SELECT * FROM tasks WHERE id = ?",
    [taskId],
    (err, results) => {
      if (err) throw err;

      // Renderizar a página de edição da tarefa com os detalhes da tarefa
      res.render("edit", { task: results[0] });
    }
  );
});

// Rota para atualizar a tarefa
app.post("/update/:id", (req, res) => {
  const taskId = req.params.id;
  const { user, task } = req.body;

  // Atualizar a tarefa na base de dados com base no ID fornecido
  connection.query(
    "UPDATE tasks SET user = ?, task = ? WHERE id = ?",
    [user, task, taskId],
    (err, results) => {
      if (err) throw err;

      // Redirecionar para a página principal após a atualização
      res.redirect("/");
    }
  );
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});
