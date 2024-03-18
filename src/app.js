const express = require("express");
const flash = require("connect-flash");

const app = express();
const port = 3000;

// Importando as rotas
const routes = require("./routes/index");

// Importando configurações de sessão e banco de dados
const sessionConfig = require("./config/session");
const db = require("./config/database");

// Configuração da sessão
app.use(sessionConfig);

// Configuração do connect-flash
app.use(flash());

// Para analisar dados de formulário com codificação urlencoded
app.use(express.urlencoded({ extended: true }));

// Configurando EJS como mecanismo de visualização
app.set("view engine", "ejs");

// Assegure-se de que este caminho esteja correto
app.set("views", "./views");

// Usando as rotas definidas
app.use("/", routes);

// Inicializando o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor a executar em http://localhost:${port}`);
});

module.exports = app;
