const { text } = require("body-parser");
const { render, clearCache } = require("ejs");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../Models/categoria");
const Categoria = mongoose.model("categorias");
require("../Models/post");
const Postagem = mongoose.model("postagens");

router.get('/', (req, res) => {
    res.render('admin/index');
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({ data: "desc" }).then((categorias) => {
        res.render("admin/categorias", {
            categorias: categorias,
            success_msg: req.flash('success_msg'),
            err_msg: req.flash('err_msg')
        });
    }).catch((err) => {
        req.flash('err_msg', 'Erro ao carregar categorias');
        console.log("Erro: " + err);
        res.redirect('/admin');
    });
});

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {

    let erros = []

    if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({ texto: "nome não pode ser vazio" });
    }

    if (!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novacategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };

        new Categoria(novacategoria).save()
            .then(() => {
                req.flash("success_msg", "Categoria criada com sucesso")
                res.redirect('/admin/categorias')
            })
            .catch(() => {
                req.flash("err_msg", "ouve um erro ao salvar categoria, tente novamente")
                res.redirect('/admin')
            });
    }
});

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categorias) => {
        res.render('admin/editcategoria', { categorias: categorias });
    }).catch((err) => {
        console.log(err);
    })
});

router.post('/categorias/edit', (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        erros.push({ texto: "nome não pode ser vazio" });
    }

    if (!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (erros.length > 0) {
        res.render('admin/editcategoria', { erros: erros });
    } else {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso");
                res.redirect('/admin/categorias');
            }).catch((err) => {
                req.flash("err_msg", "Houve um erro ao editar a categoria");
                res.redirect('/admin/categorias');
            });
        }).catch((err) => {
            req.flash("err_msg", "Houve um erro ao encontrar a categoria");
            res.redirect('/admin/categorias');
        });
    }
});

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("err_msg", "Erro ao deletar categoria!!");
        res.redirect("/admin/categorias")
    })
});

router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort("desc").then((postagens) => {
        res.render("admin/postagens", { postagens: postagens });
    }).catch((err) => {
        req.flash("err_msg", "houve um erro ao listar postagem");
        res.redirect("/admin");
    })
});

router.get("/postagens/add", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias });
    }).catch((err) => {
        req.flash("err_msg", "Erro ao criar Categoria");
    })
})

router.post("/postagem/nova", (req, res) => {
    let erros = []

    if (req.body.categoria === "0") {
        erros.push({ texto: "categoria invalida, registre uma categoria" })
    }

    if (!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (!req.body.descricao || typeof req.body.descricao === undefined || req.body.descricao === null) {
        erros.push({ texto: "descricao não pode ser vazia" });
    }

    if (!req.body.conteudo || typeof req.body.conteudo === undefined || req.body.conteudo === null) {
        erros.push({ texto: "conteudo não pode ser invalido" });
    }

    if (!req.body.titulo || typeof req.body.titulo === undefined || req.body.conteudo === null) {
        erros.push({ texto: "titulo não pode ser vazio" });
    }

    if (erros.length > 0) {
        res.render("admin/addpostagens", { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("err_msg", "houve erro durante o carregamento da postagem");
            res.redirect("/admin/postagens");
        })

    }
})

router.get('/test-flash', (req, res) => {
    req.flash('success_msg', 'Mensagem de teste - sucesso!');
    req.flash('err_msg', 'Mensagem de teste - erro!');
    res.redirect('/admin/categorias');
});

router.get("/postagens/edit/:id", (req, res) => {
    Postagem.findOne({ _id: req.params.id }).then((postagens) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagens: postagens });
        }).catch((err) => {
            req.flash("err_msg", "houve uma erro ao listar as categorais")
            res.redirect("admin/postagens")
        })
    }).catch((err) => {
        req.flash("err_msg", "houve um erro ao editar postagem")
        res.redirect("admin/postagens")
    })
})

router.post("/postagem/edit", (req, res) => {

    Postagem.findOne({ _id: req.body.id }).then((postagens) => {
        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.conteudo = req.body.conteudo
        postagens.descricao = req.body.descricao
        postagens.categoria = req.body.categoria

        postagens.save().then(() => {
            req.flash("success_msg", "postagem editada com sucesso");
            res.redirect("/admin/postagens");
        }).catch((err) => {
            req.flash("err_msg", "erro ao atualizar postagem")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        console.log(err)
        req.flash("err_msg", "erro ao editar postagem")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagem/deletar/:id", (req, res) => {
    Postagem.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "postagem deletada com sucesso")
        res.redirect("/admin/postagens");
    }).catch((err) => {
        req.flash("err_msg", "houve uma erro interno");
    })
})

module.exports = router