const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Cantinho do Maná funcionando!"
  });
});

app.get("/api/produtos", (req, res) => {
  res.json([
    {
      id: 1,
      nome: "Rei Davi",
      preco: 10,
      categoria: "Hambúrgueres"
    },
    {
      id: 2,
      nome: "Elias",
      preco: 11,
      categoria: "Hambúrgueres"
    }
  ]);
});

app.listen(3001, () => {
  console.log("API rodando em http://localhost:3001");
});