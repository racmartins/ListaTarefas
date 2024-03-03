// Importar dependências
const express = require("express"); //módulo express
const connection = require("./database/database"); //módulo de conexão

// Criar uma instância do Express
const app = express();

// Configurar o EJS como view engine
app.set("view engine", "ejs");

// Configurar o middleware para analisar dados de formulário
app.use(express.urlencoded({ extended: false }));

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
// Rota para remover a tarefa
app.post("/delete/:id", (req, res) => {
  const taskId = req.params.id;

  // Remover a tarefa da base de dados com base no ID fornecido
  connection.query(
    "DELETE FROM tasks WHERE id = ?",
    [taskId],
    (err, results) => {
      if (err) throw err;

      // Redirecionar para a página principal após a remoção
      res.redirect("/");
    }
  );
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});
