const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../config/database");

//Rotas de erros e sucesso
router.use((req, res, next) => {
  res.locals.errorMessage = req.flash("errorMessage");
  res.locals.successMessage = req.flash("successMessage");
  next();
});

// Rota inicial - Página de login
router.get("/", (req, res) => {
  res.render("login");
});

// Rota de autenticação (de login)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  try {
    const [users] = await db.query(sql, [username]);
    if (users.length > 0) {
      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.loggedIn = true;
        req.session.userId = user.id;
        req.session.username = username;
        res.redirect("/tasks");
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

// Rota de logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// Rota de registo de utilizadores (página de registo)
router.get("/register", (req, res) => {
  res.render("register");
});

// Rota de registo de utilizadores (ação de registar)
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = { username, password: hash };
  const sql = "INSERT INTO users SET ?";
  try {
    await db.query(sql, user);
    console.log("Novo usuário registrado");
    res.redirect("/");
  } catch (err) {
    console.error("Erro ao registar utilizador", err);
    res.status(500).send("Erro ao registar utilizador");
  }
});

// Incluir outras rotas conforme necessário...

// Rota de visualização das tarefas
router.get("/tasks", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/");
  }

  //const loggedIn = req.session.loggedIn;

  try {
    const [tasks] = await db.query("SELECT * FROM tasks"); // Removido o filtro por user_id
    const [users] = await db.query("SELECT * FROM users");

    res.render("tasks", {
      tasks,
      users,
      userId: req.session.userId,
      loggedIn: req.session.loggedIn,
      username: req.session.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

// Rota de adição de nova tarefa
router.post("/tasks/add", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/");
  }

  const { title, description, status } = req.body;
  const userId = req.session.userId;

  const checkSql = "SELECT * FROM tasks WHERE title = ? AND user_id = ?";

  try {
    const [existingTasks] = await db.query(checkSql, [title, userId]);

    if (existingTasks.length > 0) {
      req.flash("errorMessage", "A tarefa já existe.");
      return res.redirect("/tasks");
    }

    const task = { title, description, status, user_id: userId };
    const insertSql = "INSERT INTO tasks SET ?";
    await db.query(insertSql, task);

    req.flash("successMessage", "Tarefa adicionada com sucesso.");
    res.redirect("/tasks");
  } catch (err) {
    console.error("Erro ao adicionar tarefa:", err);
    res.status(500).send("Erro ao adicionar tarefa no servidor.");
  }
});

// Rota de edição de tarefa
router.get("/tasks/edit/:id", async (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }

  const taskId = req.params.id;
  const sql = "SELECT * FROM tasks WHERE id = ?";

  try {
    // Usando await para aguardar a consulta ao banco de dados.
    const [results] = await db.query(sql, [taskId]);
    if (results.length === 0) {
      res.redirect("/tasks");
      return;
    }
    const task = results[0];
    res.render("edit-task", { task });
  } catch (err) {
    console.error("Erro ao buscar tarefa:", err);
    res.status(500).send("Erro ao buscar tarefa no servidor.");
  }
});

// Rota de atualização de tarefa
router.post("/tasks/edit/:id", async (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }

  const taskId = req.params.id;
  const { title, description, status } = req.body;
  const sql =
    "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?";

  try {
    // Usando await para aguardar a execução da atualização no banco de dados.
    await db.query(sql, [title, description, status, taskId]);
    console.log("Tarefa atualizada com sucesso.");
    res.redirect("/tasks");
  } catch (err) {
    console.error("Erro ao atualizar tarefa:", err);
    res.status(500).send("Erro ao atualizar tarefa no servidor.");
  }
});

// Rota de exclusão de tarefa
router.get("/tasks/delete/:id", async (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }

  const taskId = req.params.id;
  const sql = "DELETE FROM tasks WHERE id = ?";

  try {
    // Usando await para aguardar a execução da exclusão no banco de dados.
    await db.query(sql, [taskId]);
    console.log("Tarefa excluída com sucesso.");
    res.redirect("/tasks");
  } catch (err) {
    console.error("Erro ao excluir tarefa:", err);
    res.status(500).send("Erro ao excluir tarefa no servidor.");
  }
});

// Após todas as outras rotas
/*router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo correu mal!");
});*/

module.exports = router;
