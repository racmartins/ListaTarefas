const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");

const app = express();
const port = 3000;

// Configuração da base de dados
const db = mysql.createConnection({
  host: "localhost",
  port: 8889,
  user: "root",
  password: "root",
  database: "task_manager",
});

// Configuração do express-session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Configuração do body-parser
app.use(express.urlencoded({ extended: false }));

// Configuração do EJS como mecanismo de visualização
app.set("view engine", "ejs");

// Rota inicial
app.get("/", (req, res) => {
  res.render("login");
});

// Rota de autenticação (de login)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      const user = result[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          throw err;
        }
        if (isMatch) {
          req.session.loggedIn = true;
          req.session.userId = user.id;
          req.session.username = username;
          res.redirect("/tasks");
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.redirect("/");
    }
  });
});

// Rota de logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    }
    res.redirect("/");
  });
});

// Rota de exibição do formulário de registo de utilizador
app.get("/register", (req, res) => {
  res.render("register");
});

// Rota de registo de utilizador
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      throw err;
    }
    const user = { username, password: hash };
    const sql = "INSERT INTO users SET ?";
    db.query(sql, user, (err, result) => {
      if (err) {
        throw err;
      }
      console.log("Novo utilizador registado:", result);
      res.redirect("/");
    });
  });
});

// Rota de visualização das tarefas
app.get("/tasks", (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  const userId = req.session.userId;
  const loggedIn = req.session.loggedIn;

  const sqlTasks = "SELECT * FROM tasks";
  const sqlUsers = "SELECT * FROM users";

  db.query(sqlTasks, (err, tasks) => {
    if (err) {
      throw err;
    }

    db.query(sqlUsers, (err, users) => {
      if (err) {
        throw err;
      }

      db.query("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) {
          throw err;
        }

        const username = user[0].username;

        res.render("tasks", {
          tasks: tasks,
          users: users,
          userId: userId, // Adicione esta linha
          username: username,
          loggedIn: loggedIn,
        });
      });
    });
  });
});

// Rota de adição de nova tarefa
app.post("/tasks/add", (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  const { title, description, status } = req.body;
  const task = { title, description, status, user_id: req.session.userId };
  const sql = "INSERT INTO tasks SET ?";
  db.query(sql, task, (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Nova tarefa adicionada:", result);
    res.redirect("/tasks");
  });
});

// Rota de edição de tarefa
app.get("/tasks/edit/:id", (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  const taskId = req.params.id;
  const sql = "SELECT * FROM tasks WHERE id = ?";
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      res.redirect("/tasks");
      return;
    }
    const task = result[0];
    res.render("edit-task", { task });
  });
});

// Rota de atualização de tarefa
app.post("/tasks/edit/:id", (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  const taskId = req.params.id;
  const { title, description, status } = req.body;
  const sql =
    "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?";
  db.query(sql, [title, description, status, taskId], (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Tarefa atualizada:", result);
    res.redirect("/tasks");
  });
});

// Rota de exclusão de tarefa
app.get("/tasks/delete/:id", (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
    return;
  }
  const taskId = req.params.id;
  const sql = "DELETE FROM tasks WHERE id = ?";
  db.query(sql, [taskId], (err, result) => {
    if (err) {
      throw err;
    }
    console.log("Tarefa excluída:", result);
    res.redirect("/tasks");
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor a executar em http://localhost:${port}`);
});
