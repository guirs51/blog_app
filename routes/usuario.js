const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../Models/usuario");
const Usuario = mongoose.model("usuario");

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
});

router.post("/registro", (req, res) => {
    let erros = []

    if (!req.body.nome || req.body.nome === null || req.body.nome === undefined) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.email || req.body.email === null || req.body.email === undefined) {
        erros.push({ texto: "E-mail invalido" })
    }

    if (!req.body.senha || req.body.senha === null || req.body.senha === undefined) {
        erros.push({ texto: "Senha invalido" })
    }

    if (req.body.senha.length < 4) {
        erros.push({ texto: "senha muito curta" })
    }

    if (!req.body.nome != req.body.senha2) {
        erros.push({ texto: "Sennhas diferentes" })
    }

    if (erros.length > 0) {
        res.render("usuarios/registro" , {erros: erros});
    } else {

    }
})




module.exports = router