const express = require("express");
const cors = require("cors");

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());

/* =========================
   DADOS TEMPORÁRIOS
========================= */

const produtos = [{
        id: 1,
        nome: "Rei Davi",
        preco: 10,
        categoria: "Hambúrgueres",
    },
    {
        id: 2,
        nome: "Elias",
        preco: 11,
        categoria: "Hambúrgueres",
    },
];

const clientes = [];

const pedidos = [];

/* =========================
   INÍCIO
========================= */

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Cantinho do Maná funcionando!",
    });
});

/* =========================
   PRODUTOS
========================= */

app.get("/api/produtos", (req, res) => {
    res.json(produtos);
});

/* =========================
   ADMINISTRADOR
========================= */

app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;

    if (password !== "C@nt1nho") {
        return res.status(401).json({
            error: "Código de acesso incorreto.",
        });
    }

    res.json({
        token: "admin-logado-cantinho",
    });
});

/* =========================
   CADASTRO DE CLIENTE
========================= */

app.post("/api/client/register", (req, res) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({
            error: "Preencha nome, e-mail e senha.",
        });
    }

    const emailExistente = clientes.find(
        (cliente) =>
        cliente.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExistente) {
        return res.status(409).json({
            error: "Este e-mail já está cadastrado.",
        });
    }

    const cliente = {
        id: Date.now(),
        nome,
        email: email.toLowerCase(),
        password,
    };

    clientes.push(cliente);

    res.status(201).json({
        token: `cliente-${cliente.id}`,
        cliente: {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
        },
    });
});

/* =========================
   LOGIN DE CLIENTE
========================= */

app.post("/api/client/login", (req, res) => {
    const { email, password } = req.body;

    const cliente = clientes.find(
        (item) =>
        item.email === email.toLowerCase() &&
        item.password === password
    );

    if (!cliente) {
        return res.status(401).json({
            error: "E-mail ou senha incorretos.",
        });
    }

    res.json({
        token: `cliente-${cliente.id}`,
        cliente: {
            id: cliente.id,
            nome: cliente.nome,
            email: cliente.email,
        },
    });
});

/* =========================
   PEDIDOS
========================= */

app.post("/api/pedidos", (req, res) => {
    const { itens, total } = req.body;

    if (!itens || !total) {
        return res.status(400).json({
            error: "Pedido inválido.",
        });
    }

    const pedido = {
        id: Date.now(),
        itens,
        total,
        data: new Date().toLocaleString("pt-BR"),
    };

    pedidos.push(pedido);

    res.status(201).json(pedido);
});

app.get("/api/pedidos", (req, res) => {
    res.json(pedidos);
});

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API rodando na porta ${PORT}`);
});