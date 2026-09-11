require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();

/* =====================================================
   CONFIGURAÃ‡Ã•ES
===================================================== */

const PORT = Number(process.env.PORT || 3001);

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "cantinho-mana-segredo-local";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const resetTransporter = SMTP_HOST && SMTP_USER && SMTP_PASSWORD ? nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } }) : null;

/* =====================================================
   MIDDLEWARES
===================================================== */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json({
        limit: "10mb"
    })
);

/* =====================================================
   CONEXÃƒO COM MYSQL
===================================================== */

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cantinho_mana",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/* =====================================================
   TESTAR BANCO
===================================================== */

async function testarBanco() {
    try {
        const conexao = await db.getConnection();

        await conexao.query("SELECT 1");

        conexao.release();

        console.log(
            "âœ… MySQL conectado com sucesso!"
        );
    } catch (erro) {
        console.error(
            "âŒ Erro ao conectar ao MySQL:"
        );

        console.error(erro.message);
    }
}

/* =====================================================
   JWT
===================================================== */

function gerarToken(usuario) {
    return jwt.sign({
            id: usuario.id,
            tipo: usuario.tipo
        },
        JWT_SECRET, {
            expiresIn: "7d"
        }
    );
}

function obterToken(req) {
    const authorization =
        req.headers.authorization;

    if (!authorization ||
        !authorization.startsWith(
            "Bearer "
        )
    ) {
        return null;
    }

    return authorization.substring(7);
}

/* =====================================================
   AUTENTICAÃ‡ÃƒO DO CLIENTE
===================================================== */

function autenticarCliente(
    req,
    res,
    next
) {
    const token = obterToken(req);

    if (!token) {
        return res.status(401).json({
            erro: "NÃ£o autenticado."
        });
    }

    try {
        const usuario =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.usuario = usuario;

        next();
    } catch (erro) {
        return res.status(401).json({
            erro: "Token invÃ¡lido ou expirado."
        });
    }
}

/* =====================================================
   AUTENTICAÃ‡ÃƒO DO ADMIN
===================================================== */

function autenticarAdmin(
    req,
    res,
    next
) {
    const token = obterToken(req);

    if (!token) {
        return res.status(401).json({
            erro: "NÃ£o autenticado."
        });
    }

    try {
        const usuario =
            jwt.verify(
                token,
                JWT_SECRET
            );

        if (
            usuario.tipo !== "admin"
        ) {
            return res.status(403).json({
                erro: "Acesso permitido somente para administradores."
            });
        }

        req.usuario = usuario;

        next();
    } catch (erro) {
        return res.status(401).json({
            erro: "Token invÃ¡lido ou expirado."
        });
    }
}

/* =====================================================
   ROTA PRINCIPAL
===================================================== */

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Cantinho do ManÃ¡ funcionando!",
        status: "online"
    });
});

/* =====================================================
   TESTE DO BANCO
===================================================== */

app.get(
    "/api/teste-banco",
    async(req, res) => {
        try {
            const [resultado] =
            await db.query(
                "SELECT 1 AS teste"
            );

            res.json({
                conectado: true,
                mensagem: "MySQL funcionando!",
                resultado
            });
        } catch (erro) {
            console.error(
                "Erro no teste do banco:",
                erro.message
            );

            res.status(500).json({
                conectado: false,
                erro: erro.message
            });
        }
    }
);

/* =====================================================
   CLIENTE - CADASTRO
===================================================== */

app.post(
    "/client/register",
    async(req, res) => {
        let conexao = null;

        try {
            const {
                nome,
                email,
                senha,
                password
            } = req.body;

            const senhaFinal =
                senha || password;

            if (!nome ||
                !email ||
                !senhaFinal
            ) {
                return res.status(400).json({
                    erro: "Nome, email e senha sÃ£o obrigatÃ³rios."
                });
            }

            const nomeLimpo =
                String(nome).trim();

            const emailLimpo =
                String(email)
                .trim()
                .toLowerCase();

            if (
                nomeLimpo.length === 0
            ) {
                return res.status(400).json({
                    erro: "Digite seu nome."
                });
            }

            if (
                senhaFinal.length < 6
            ) {
                return res.status(400).json({
                    erro: "A senha deve ter pelo menos 6 caracteres."
                });
            }

            const [existentes] =
            await db.query(
                `
                    SELECT id
                    FROM usuarios
                    WHERE email = ?
                    LIMIT 1
                    `, [emailLimpo]
            );

            if (
                existentes.length > 0
            ) {
                return res.status(409).json({
                    erro: "Este email jÃ¡ estÃ¡ cadastrado."
                });
            }

            const senhaHash =
                await bcrypt.hash(
                    senhaFinal,
                    10
                );

            conexao =
                await db.getConnection();

            await conexao.beginTransaction();

            const [usuario] =
            await conexao.query(
                `
                    INSERT INTO usuarios
                    (
                        nome,
                        email,
                        senha_hash,
                        tipo
                    )
                    VALUES (?, ?, ?, 'cliente')
                    `, [
                    nomeLimpo,
                    emailLimpo,
                    senhaHash
                ]
            );

            await conexao.query(
                `
                INSERT INTO clientes
                (
                    id
                )
                VALUES (?)
                `, [
                    usuario.insertId
                ]
            );

            await conexao.commit();

            const cliente = {
                id: usuario.insertId,
                nome: nomeLimpo,
                email: emailLimpo
            };

            const token =
                gerarToken({
                    id: usuario.insertId,
                    tipo: "cliente"
                });

            return res.status(201).json({
                mensagem: "Cliente cadastrado com sucesso!",
                token,
                cliente
            });

        } catch (erro) {
            if (conexao) {
                try {
                    await conexao.rollback();
                } catch {}
            }

            console.error(
                "Erro no cadastro:",
                erro.message
            );

            return res.status(500).json({
                erro: "Erro interno ao cadastrar cliente."
            });
        } finally {
            if (conexao) {
                conexao.release();
            }
        }
    }
);

/* =====================================================
   CLIENTE - LOGIN
===================================================== */

app.post(
    "/client/login",
    async(req, res) => {
        try {
            const {
                email,
                senha,
                password
            } = req.body;

            const senhaFinal =
                senha || password;

            if (!email ||
                !senhaFinal
            ) {
                return res.status(400).json({
                    erro: "Email e senha sÃ£o obrigatÃ³rios."
                });
            }

            const emailLimpo =
                String(email)
                .trim()
                .toLowerCase();

            const [usuarios] =
            await db.query(
                `
                    SELECT
                        id,
                        nome,
                        email,
                        senha_hash,
                        tipo
                    FROM usuarios
                    WHERE email = ?
                    AND tipo = 'cliente'
                    LIMIT 1
                    `, [emailLimpo]
            );

            if (
                usuarios.length === 0
            ) {
                return res.status(401).json({
                    erro: "Email ou senha invÃ¡lidos."
                });
            }

            const usuario =
                usuarios[0];

            if (!usuario.senha_hash) {
                return res.status(401).json({
                    erro: "Esta conta nÃ£o possui senha local."
                });
            }

            const senhaCorreta =
                await bcrypt.compare(
                    senhaFinal,
                    usuario.senha_hash
                );

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro: "Email ou senha invÃ¡lidos."
                });
            }

            const cliente = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            };

            const token =
                gerarToken({
                    id: usuario.id,
                    tipo: usuario.tipo
                });

            return res.json({
                mensagem: "Login realizado com sucesso!",
                token,
                cliente
            });

        } catch (erro) {
            console.error(
                "Erro no login:",
                erro.message
            );

            return res.status(500).json({
                erro: "Erro interno ao fazer login."
            });
        }
    }
);

/* =====================================================
   CLIENTE - RECUPERAÃ‡ÃƒO DE SENHA
===================================================== */

async function garantirTabelaRecuperacao() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS tokens_recuperacao (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            token_hash CHAR(64) NOT NULL UNIQUE,
            expira_em DATETIME NOT NULL,
            usado TINYINT(1) NOT NULL DEFAULT 0,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_tokens_usuario (usuario_id),
            INDEX idx_tokens_expira (expira_em),
            CONSTRAINT fk_tokens_usuario
                FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        )
    `);
}

app.post("/client/forgot-password", async(req, res) => {
    try {
        const email = String(req.body ?.email || "").trim().toLowerCase();
        if (!email) return res.status(400).json({ erro: "Informe seu e-mail." });
        if (!resetTransporter) return res.status(503).json({ erro: "A recuperaÃ§Ã£o de senha ainda nÃ£o estÃ¡ configurada no servidor." });
        const [usuarios] = await db.query(`SELECT id, nome, email FROM usuarios WHERE email = ? AND tipo = 'cliente' LIMIT 1`, [email]);
        if (usuarios.length === 0) return res.json({ mensagem: "Se o e-mail estiver cadastrado, vocÃª receberÃ¡ as instruÃ§Ãµes de recuperaÃ§Ã£o." });
        const usuario = usuarios[0];
        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const expiraEm = new Date(Date.now() + 30 * 60 * 1000);
        await db.query(`DELETE FROM tokens_recuperacao WHERE usuario_id = ? OR expira_em < NOW()`, [usuario.id]);
        await db.query(`INSERT INTO tokens_recuperacao (usuario_id, token_hash, expira_em) VALUES (?, ?, ?)`, [usuario.id, tokenHash, expiraEm]);
        const link = `${CLIENT_URL}/?resetToken=${encodeURIComponent(token)}`;
        await resetTransporter.sendMail({
            from: SMTP_FROM,
            to: usuario.email,
            subject: "RecuperaÃ§Ã£o de senha - Cantinho do ManÃ¡",
            text: `OlÃ¡, ${usuario.nome}.\n\nUse este link para redefinir sua senha:\n${link}\n\nO link expira em 30 minutos.`,
            html: `<p>OlÃ¡, ${String(usuario.nome).replace(/[<>&"]/g, "") }.</p><p>Clique no botÃ£o para redefinir sua senha:</p><p><a href="${link}">Redefinir minha senha</a></p><p>O link expira em 30 minutos.</p>`
        });
        return res.json({ mensagem: "Se o e-mail estiver cadastrado, vocÃª receberÃ¡ as instruÃ§Ãµes de recuperaÃ§Ã£o." });
    } catch (erro) {
        console.error("Erro na recuperaÃ§Ã£o de senha:", erro.message);
        return res.status(500).json({ erro: "NÃ£o foi possÃ­vel iniciar a recuperaÃ§Ã£o de senha." });
    }
});

app.post("/client/reset-password", async(req, res) => {
    let conexao = null;
    try {
        const token = String(req.body ?.token || "").trim();
        const novaSenha = String(req.body ?.senha || req.body ?.password || "");
        if (!token || !novaSenha) return res.status(400).json({ erro: "Token e nova senha sÃ£o obrigatÃ³rios." });
        if (novaSenha.length < 6) return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres." });
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const [tokens] = await db.query(`SELECT id, usuario_id FROM tokens_recuperacao WHERE token_hash = ? AND usado = 0 AND expira_em > NOW() LIMIT 1`, [tokenHash]);
        if (tokens.length === 0) return res.status(400).json({ erro: "Link de recuperaÃ§Ã£o invÃ¡lido ou expirado." });
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        conexao = await db.getConnection();
        await conexao.beginTransaction();
        await conexao.query(`UPDATE usuarios SET senha_hash = ? WHERE id = ? AND tipo = 'cliente'`, [senhaHash, tokens[0].usuario_id]);
        await conexao.query(`UPDATE tokens_recuperacao SET usado = 1 WHERE id = ?`, [tokens[0].id]);
        await conexao.commit();
        return res.json({ mensagem: "Senha redefinida com sucesso! FaÃ§a login novamente." });
    } catch (erro) {
        if (conexao) { try { await conexao.rollback(); } catch {} }
        console.error("Erro ao redefinir senha:", erro.message);
        return res.status(500).json({ erro: "NÃ£o foi possÃ­vel redefinir a senha." });
    } finally { if (conexao) conexao.release(); }
});

/* =====================================================
   CLIENTE - DADOS DA CONTA
===================================================== */

app.get(
    "/client/me",
    autenticarCliente,
    async(req, res) => {
        try {
            const [usuarios] =
            await db.query(
                `
                    SELECT
                        id,
                        nome,
                        email,
                        tipo
                    FROM usuarios
                    WHERE id = ?
                    LIMIT 1
                    `, [req.usuario.id]
            );

            if (
                usuarios.length === 0
            ) {
                return res.status(404).json({
                    erro: "Cliente nÃ£o encontrado."
                });
            }

            res.json({
                cliente: {
                    id: usuarios[0].id,
                    nome: usuarios[0].nome,
                    email: usuarios[0].email
                }
            });
        } catch (erro) {
            res.status(500).json({
                erro: "Erro ao buscar cliente."
            });
        }
    }
);

/* =====================================================
   PRODUTOS - BUSCAR
===================================================== */

async function buscarProdutos() {
    const [produtos] =
    await db.query(
        `
            SELECT
                produtos.id,
                produtos.nome,
                produtos.descricao,
                produtos.preco,
                produtos.imagem,
                produtos.categoria_id,
                categorias.nome AS categoria
            FROM produtos
            LEFT JOIN categorias
                ON produtos.categoria_id =
                   categorias.id
            ORDER BY produtos.id ASC
            `
    );

    return produtos;
}

app.get(
    "/produtos",
    async(req, res) => {
        try {
            const produtos =
                await buscarProdutos();

            res.json(produtos);
        } catch (erro) {
            console.error(
                "Erro ao buscar produtos:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao buscar produtos."
            });
        }
    }
);

app.get(
    "/api/produtos",
    async(req, res) => {
        try {
            const produtos =
                await buscarProdutos();

            res.json(produtos);
        } catch (erro) {
            console.error(
                "Erro ao buscar produtos:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao buscar produtos."
            });
        }
    }
);

/* =====================================================
   PRODUTOS - CRIAR
===================================================== */

async function criarProduto(
    req,
    res
) {
    try {
        const {
            nome,
            descricao,
            preco,
            imagem,
            categoria,
            categoria_id
        } = req.body;

        if (!nome ||
            preco === undefined ||
            preco === null ||
            Number.isNaN(Number(preco))
        ) {
            return res.status(400).json({
                erro: "Nome e preÃ§o sÃ£o obrigatÃ³rios."
            });
        }

        let categoriaId =
            categoria_id || null;

        if (!categoriaId &&
            categoria
        ) {
            const [categorias] =
            await db.query(
                `
                    SELECT id
                    FROM categorias
                    WHERE nome = ?
                    LIMIT 1
                    `, [categoria]
            );

            if (
                categorias.length > 0
            ) {
                categoriaId =
                    categorias[0].id;
            }
        }

        const [resultado] =
        await db.query(
            `
                INSERT INTO produtos
                (
                    nome,
                    descricao,
                    preco,
                    imagem,
                    categoria_id
                )
                VALUES (?, ?, ?, ?, ?)
                `, [
                String(nome).trim(),
                descricao || "",
                Number(preco),
                imagem || "",
                categoriaId
            ]
        );

        const [produtos] =
        await db.query(
            `
                SELECT
                    produtos.id,
                    produtos.nome,
                    produtos.descricao,
                    produtos.preco,
                    produtos.imagem,
                    produtos.categoria_id,
                    categorias.nome AS categoria
                FROM produtos
                LEFT JOIN categorias
                    ON produtos.categoria_id =
                       categorias.id
                WHERE produtos.id = ?
                LIMIT 1
                `, [resultado.insertId]
        );

        res.status(201).json(
            produtos[0]
        );

    } catch (erro) {
        console.error(
            "Erro ao criar produto:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao criar produto."
        });
    }
}

app.post(
    "/produtos",
    autenticarAdmin,
    criarProduto
);

app.post(
    "/api/produtos",
    autenticarAdmin,
    criarProduto
);

/* =====================================================
   PRODUTOS - EDITAR
===================================================== */

async function editarProduto(
    req,
    res
) {
    try {
        const id =
            req.params.id;

        const {
            nome,
            descricao,
            preco,
            imagem,
            categoria,
            categoria_id
        } = req.body;

        if (!nome ||
            preco === undefined ||
            preco === null ||
            Number.isNaN(Number(preco))
        ) {
            return res.status(400).json({
                erro: "Nome e preÃ§o sÃ£o obrigatÃ³rios."
            });
        }

        let categoriaId =
            categoria_id || null;

        if (!categoriaId &&
            categoria
        ) {
            const [categorias] =
            await db.query(
                `
                    SELECT id
                    FROM categorias
                    WHERE nome = ?
                    LIMIT 1
                    `, [categoria]
            );

            if (
                categorias.length > 0
            ) {
                categoriaId =
                    categorias[0].id;
            }
        }

        await db.query(
            `
            UPDATE produtos
            SET
                nome = ?,
                descricao = ?,
                preco = ?,
                imagem = ?,
                categoria_id = ?
            WHERE id = ?
            `, [
                String(nome).trim(),
                descricao || "",
                Number(preco),
                imagem || "",
                categoriaId,
                id
            ]
        );

        const [produtos] =
        await db.query(
            `
                SELECT
                    produtos.id,
                    produtos.nome,
                    produtos.descricao,
                    produtos.preco,
                    produtos.imagem,
                    produtos.categoria_id,
                    categorias.nome AS categoria
                FROM produtos
                LEFT JOIN categorias
                    ON produtos.categoria_id =
                       categorias.id
                WHERE produtos.id = ?
                LIMIT 1
                `, [id]
        );

        if (
            produtos.length === 0
        ) {
            return res.status(404).json({
                erro: "Produto nÃ£o encontrado."
            });
        }

        res.json(
            produtos[0]
        );

    } catch (erro) {
        console.error(
            "Erro ao editar produto:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao editar produto."
        });
    }
}

app.put(
    "/produtos/:id",
    autenticarAdmin,
    editarProduto
);

app.put(
    "/api/produtos/:id",
    autenticarAdmin,
    editarProduto
);

/* =====================================================
   PRODUTOS - EXCLUIR
===================================================== */

async function excluirProduto(
    req,
    res
) {
    try {
        const id =
            req.params.id;

        await db.query(
            `
            DELETE FROM produtos
            WHERE id = ?
            `, [id]
        );

        res.json({
            mensagem: "Produto removido com sucesso."
        });
    } catch (erro) {
        console.error(
            "Erro ao excluir produto:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao excluir produto."
        });
    }
}

app.delete(
    "/produtos/:id",
    autenticarAdmin,
    excluirProduto
);

app.delete(
    "/api/produtos/:id",
    autenticarAdmin,
    excluirProduto
);

/* =====================================================
   CATEGORIAS - BUSCAR
===================================================== */

async function buscarCategorias() {
    const [categorias] =
    await db.query(
        `
            SELECT
                id,
                nome
            FROM categorias
            ORDER BY id ASC
            `
    );

    return categorias;
}

app.get(
    "/categorias",
    async(req, res) => {
        try {
            res.json(
                await buscarCategorias()
            );
        } catch (erro) {
            console.error(
                "Erro ao buscar categorias:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao buscar categorias."
            });
        }
    }
);

app.get(
    "/api/categorias",
    async(req, res) => {
        try {
            res.json(
                await buscarCategorias()
            );
        } catch (erro) {
            console.error(
                "Erro ao buscar categorias:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao buscar categorias."
            });
        }
    }
);

/* =====================================================
   CATEGORIAS - CRIAR
===================================================== */

async function criarCategoria(
    req,
    res
) {
    try {
        const {
            nome
        } = req.body;

        if (!nome ||
            !String(nome).trim()
        ) {
            return res.status(400).json({
                erro: "Nome da categoria Ã© obrigatÃ³rio."
            });
        }

        const nomeLimpo =
            String(nome).trim();

        const [resultado] =
        await db.query(
            `
                INSERT INTO categorias
                (
                    nome
                )
                VALUES (?)
                `, [nomeLimpo]
        );

        res.status(201).json({
            id: resultado.insertId,
            nome: nomeLimpo
        });

    } catch (erro) {
        if (
            erro.code ===
            "ER_DUP_ENTRY"
        ) {
            return res.status(409).json({
                erro: "Essa categoria jÃ¡ existe."
            });
        }

        console.error(
            "Erro ao criar categoria:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao adicionar categoria."
        });
    }
}

app.post(
    "/categorias",
    autenticarAdmin,
    criarCategoria
);

app.post(
    "/api/categorias",
    autenticarAdmin,
    criarCategoria
);

/* =====================================================
   CATEGORIAS - EXCLUIR
===================================================== */

async function excluirCategoria(
    req,
    res
) {
    try {
        const id =
            req.params.id;

        const [produtos] =
        await db.query(
            `
                SELECT id
                FROM produtos
                WHERE categoria_id = ?
                LIMIT 1
                `, [id]
        );

        if (
            produtos.length > 0
        ) {
            return res.status(400).json({
                erro: "Essa categoria possui produtos. Altere os produtos antes de removÃª-la."
            });
        }

        await db.query(
            `
            DELETE FROM categorias
            WHERE id = ?
            `, [id]
        );

        res.json({
            mensagem: "Categoria removida com sucesso."
        });

    } catch (erro) {
        console.error(
            "Erro ao excluir categoria:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao remover categoria."
        });
    }
}

app.delete(
    "/categorias/:id",
    autenticarAdmin,
    excluirCategoria
);

app.delete(
    "/api/categorias/:id",
    autenticarAdmin,
    excluirCategoria
);

/* =====================================================
   AVISOS - BUSCAR
===================================================== */

async function buscarAvisos() {
    const [avisos] =
    await db.query(
        `
            SELECT
                id,
                texto,
                criado_em
            FROM avisos
            ORDER BY id DESC
            `
    );

    return avisos;
}

app.get(
    "/avisos",
    async(req, res) => {
        try {
            res.json(
                await buscarAvisos()
            );
        } catch (erro) {
            console.error(
                "Erro ao buscar avisos:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao buscar avisos."
            });
        }
    }
);

app.get(
    "/api/avisos",
    async(req, res) => {
        try {
            res.json(
                await buscarAvisos()
            );
        } catch (erro) {
            console.error(
                "Erro ao buscar avisos:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao buscar avisos."
            });
        }
    }
);

/* =====================================================
   AVISOS - CRIAR
===================================================== */

async function criarAviso(
    req,
    res
) {
    try {
        const {
            texto
        } = req.body;

        if (!texto ||
            !String(texto).trim()
        ) {
            return res.status(400).json({
                erro: "O texto do aviso Ã© obrigatÃ³rio."
            });
        }

        const textoLimpo =
            String(texto).trim();

        const [resultado] =
        await db.query(
            `
                INSERT INTO avisos
                (
                    texto
                )
                VALUES (?)
                `, [textoLimpo]
        );

        res.status(201).json({
            id: resultado.insertId,
            texto: textoLimpo
        });

    } catch (erro) {
        console.error(
            "Erro ao criar aviso:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao adicionar aviso."
        });
    }
}

app.post(
    "/avisos",
    autenticarAdmin,
    criarAviso
);

app.post(
    "/api/avisos",
    autenticarAdmin,
    criarAviso
);

/* =====================================================
   AVISOS - EXCLUIR
===================================================== */

async function excluirAviso(
    req,
    res
) {
    try {
        const id =
            req.params.id;

        await db.query(
            `
            DELETE FROM avisos
            WHERE id = ?
            `, [id]
        );

        res.json({
            mensagem: "Aviso removido com sucesso."
        });

    } catch (erro) {
        console.error(
            "Erro ao excluir aviso:",
            erro.message
        );

        res.status(500).json({
            erro: "Erro ao remover aviso."
        });
    }
}

app.delete(
    "/avisos/:id",
    autenticarAdmin,
    excluirAviso
);

app.delete(
    "/api/avisos/:id",
    autenticarAdmin,
    excluirAviso
);

/* =====================================================
   PEDIDOS - CRIAR
===================================================== */

app.post(
    "/pedidos",
    autenticarCliente,
    async(req, res) => {
        let conexao = null;

        try {
            const {
                itens,
                total
            } = req.body;

            if (!Array.isArray(itens) ||
                itens.length === 0
            ) {
                return res.status(400).json({
                    erro: "O pedido precisa ter itens."
                });
            }

            conexao =
                await db.getConnection();

            await conexao.beginTransaction();

            const [pedido] =
            await conexao.query(
                `
                    INSERT INTO pedidos
                    (
                        cliente_id,
                        total,
                        status
                    )
                    VALUES (?, ?, 'recebido')
                    `, [
                    req.usuario.id,
                    Number(total || 0)
                ]
            );

            for (
                const item of itens
            ) {
                const produtoId =
                    item.produtoId ||
                    item.id;

                const quantidade =
                    Number(
                        item.quantidade || 1
                    );

                const preco =
                    Number(
                        item.preco || 0
                    );

                if (!produtoId) {
                    throw new Error(
                        "Produto invÃ¡lido no pedido."
                    );
                }

                await conexao.query(
                    `
                    INSERT INTO itens_pedido
                    (
                        pedido_id,
                        produto_id,
                        quantidade,
                        preco
                    )
                    VALUES (?, ?, ?, ?)
                    `, [
                        pedido.insertId,
                        produtoId,
                        quantidade,
                        preco
                    ]
                );
            }

            await conexao.commit();

            res.status(201).json({
                mensagem: "Pedido salvo com sucesso!",
                pedidoId: pedido.insertId
            });

        } catch (erro) {
            if (conexao) {
                try {
                    await conexao.rollback();
                } catch {}
            }

            console.error(
                "Erro ao salvar pedido:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao salvar pedido."
            });
        } finally {
            if (conexao) {
                conexao.release();
            }
        }
    }
);

/* =====================================================
   PEDIDOS - HISTÃ“RICO
===================================================== */

app.get(
    "/pedidos",
    autenticarCliente,
    async(req, res) => {
        try {
            const [pedidos] =
            await db.query(
                `
                    SELECT
                        id,
                        total,
                        status,
                        criado_em
                    FROM pedidos
                    WHERE cliente_id = ?
                    ORDER BY criado_em DESC
                    `, [req.usuario.id]
            );

            const resultado = [];

            for (
                const pedido of pedidos
            ) {
                const [itens] =
                await db.query(
                    `
                        SELECT
                            itens_pedido.produto_id,
                            itens_pedido.quantidade,
                            itens_pedido.preco,
                            produtos.nome
                        FROM itens_pedido
                        INNER JOIN produtos
                            ON itens_pedido.produto_id =
                               produtos.id
                        WHERE itens_pedido.pedido_id = ?
                        ORDER BY itens_pedido.id ASC
                        `, [pedido.id]
                );

                resultado.push({
                    _id: String(
                        pedido.id
                    ),

                    total: Number(
                        pedido.total
                    ),

                    status: pedido.status,

                    createdAt: pedido.criado_em,

                    itens: itens.map(
                        (item) => ({
                            produtoId: item.produto_id,

                            nome: item.nome,

                            quantidade: item.quantidade,

                            preco: Number(
                                item.preco
                            )
                        })
                    )
                });
            }

            res.json(resultado);

        } catch (erro) {
            console.error("=================================");
            console.error("âŒ ERRO AO SALVAR PEDIDO");
            console.error("CÃ³digo:", erro.code);
            console.error("Mensagem:", erro.message);
            console.error("SQL:", erro.sqlMessage);
            console.error("=================================");

            return res.status(500).json({
                erro: erro.sqlMessage ||
                    erro.message ||
                    "Erro ao salvar pedido."
            });
        }
    }
);

/* =====================================================
   PEDIDOS - EXCLUIR
===================================================== */

app.delete(
    "/pedidos/:id",
    autenticarCliente,
    async(req, res) => {
        try {
            await db.query(
                `
                DELETE FROM pedidos
                WHERE id = ?
                AND cliente_id = ?
                `, [
                    req.params.id,
                    req.usuario.id
                ]
            );

            res.json({
                mensagem: "Pedido excluÃ­do com sucesso."
            });

        } catch (erro) {
            console.error(
                "Erro ao excluir pedido:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro ao excluir pedido."
            });
        }
    }
);

/* =====================================================
   ADMIN - LOGIN
===================================================== */

app.post(
    "/admin/login",
    async(req, res) => {
        try {
            const {
                email,
                senha,
                password
            } = req.body;

            const senhaFinal =
                senha || password;

            if (!senhaFinal) {
                return res.status(400).json({
                    erro: "CÃ³digo de acesso Ã© obrigatÃ³rio."
                });
            }

            let usuarios = [];

            if (email) {
                const [resultado] =
                await db.query(
                    `
                        SELECT
                            id,
                            nome,
                            email,
                            senha_hash,
                            tipo
                        FROM usuarios
                        WHERE email = ?
                        AND tipo = 'admin'
                        LIMIT 1
                        `, [
                        String(email)
                        .trim()
                        .toLowerCase()
                    ]
                );

                usuarios =
                    resultado;
            } else {
                const [resultado] =
                await db.query(
                    `
                        SELECT
                            id,
                            nome,
                            email,
                            senha_hash,
                            tipo
                        FROM usuarios
                        WHERE tipo = 'admin'
                        ORDER BY id ASC
                        LIMIT 1
                        `
                );

                usuarios =
                    resultado;
            }

            if (
                usuarios.length === 0
            ) {
                return res.status(401).json({
                    erro: "Administrador nÃ£o encontrado."
                });
            }

            const usuario =
                usuarios[0];

            if (!usuario.senha_hash) {
                return res.status(401).json({
                    erro: "Administrador nÃ£o possui senha."
                });
            }

            const senhaCorreta =
                await bcrypt.compare(
                    senhaFinal,
                    usuario.senha_hash
                );

            if (!senhaCorreta) {
                return res.status(401).json({
                    erro: "CÃ³digo de acesso invÃ¡lido."
                });
            }

            const token =
                gerarToken({
                    id: usuario.id,
                    tipo: "admin"
                });

            res.json({
                mensagem: "Login de administrador realizado!",
                token,
                admin: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });

        } catch (erro) {
            console.error(
                "Erro no login admin:",
                erro.message
            );

            res.status(500).json({
                erro: "Erro interno no login administrativo."
            });
        }
    }
);

/* =====================================================
   ERRO 404
===================================================== */

app.use(
    (req, res) => {
        res.status(404).json({
            erro: "Rota nÃ£o encontrada.",
            rota: req.method +
                " " +
                req.originalUrl
        });
    }
);

/* =====================================================
   INICIAR SERVIDOR
===================================================== */

app.listen(
    PORT,
    async() => {
        console.log(
            `ðŸš€ API rodando em http://localhost:${PORT}`
        );

        await testarBanco();
        try {
            await garantirTabelaRecuperacao();
            console.log("âœ… Tabela de recuperaÃ§Ã£o de senha pronta!");
        } catch (erro) { console.error("âŒ Erro ao preparar recuperaÃ§Ã£o de senha:", erro.message); }
    }
);
