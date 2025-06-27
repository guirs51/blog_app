const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../Models/usuario");
const Usuario = mongoose.model("usuario");
const bcrypt = require("bcryptjs");

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

    if (req.body.senha !== req.body.senha2) {
        erros.push({ texto: "Sennhas diferentes" });
        console.log(req.body.senha , req.body.senha2);
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros });
    } else {
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash("err_msg", "Ja existe uma conta com iste e-mail no nosso sistema");
                res.redirect("/usuario/registro");
            } else {
                novoUser = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUser.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("err_msg", "Houve um erro durante o salvamento do user")
                        }
                        novoUser.senha = hash

                        novoUser.save().then(() => {
                            req.flash("success_msg", "Usuario criado com sucesso");
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("err_msg", "houve um erro ao criar o usuario, tente novamente");
                            res.redirect("/usuario/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("err_msg", "Houve um erro interno");
        })
    }
})


router.get("/login" , (req, res) => {
    res.render("usuarios/login");
})





module.exports = router