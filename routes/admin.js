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
    res.render('admin/categorias');
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {
    const novacategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    };
    
    new Categoria(novacategoria).save()
        .then(() => {
            console.log("Categoria salva com sucesso");
            res.send("Categoria salva com sucesso"); // Adicione uma resposta ao cliente
        })
        .catch((err) => {
            console.log("Erro ao salvar categoria: " + err);
            res.status(400).send("Erro ao salvar categoria: " + err); // Adicione uma resposta de erro
        });
});

module.exports = router