//Importar o módulo express
const express = require("express");

//Importar o módulo mysql
const mysql = require("mysql");

//Criar uma instância de express
const app = express();

// Definição do motor de renderização ejs
app.set("view engine", "ejs");

// Define uma rota para o caminho raiz ('/')
app.get("/", function (req, res) {
  // Resposta à solicitação com a mensagem 'Lista de Tarefas!'
  res.send("Lista de Tarefas!");
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});
