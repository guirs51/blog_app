const { render } = require("ejs");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../Models/categoria");
const Categoria = mongoose.model("categorias");

router.get('/', (req, res) => {
    res.render('admin/index');
})

router.get('/post', (req, res) => {
    res.send("Pagina de post")
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({data: "desc"}).then((categorias) => {
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
    Categoria.findOne({_id: req.params.id}).then((categorias) => {
        res.render('admin/editcategoria' , {categorias: categorias});
    })
    //  res.render('admin/editcategoria');
     
});

// router.get('/test-flash', (req, res) => {
//     req.flash('success_msg', 'Mensagem de teste - sucesso!');
//     req.flash('err_msg', 'Mensagem de teste - erro!');
//     res.redirect('/admin/categorias');
// });

module.exports = router