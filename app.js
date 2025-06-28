// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const admin = require("./routes/admin");
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const { render } = require('ejs');
require("./Models/post");
const Postagem = mongoose.model("postagens");
require("./Models/categoria");
const Categorias = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require('passport');
require("./config/auth")(passport);

// Configurações
//session
app.use(session({
    secret: "blogapp",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

//Middleware
// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.err_msg = req.flash("err_msg");
    res.locals.error = req.flash("error"); // Para mensagens do Passport
    res.locals.success = req.flash("success"); // Para mensagens de sucesso do Passport
    res.locals.user = req.user || null; // Adicione isso também para ter acesso ao usuário autenticado
    next();
});

// Template Engine
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'view'));


//Mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    console.log("conectado ao mongo")
}).catch((err) => {
    console.log("erro ao se conectar ao mongo: " + err)
})

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Arquivos estáticos (descomente se necessário)
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.get("/", (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens });
    }).catch((err) => {
        req.flash("err_msg", "Houve um erro ao carregar as postagens");
        res.redirect("/404");
    });
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).then((postagens) => {
        if (postagens) {
            res.render("postagem/index", { postagens: postagens });
        } else {
            req.flash("err_msg", "Esta postagem não existe");
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("err_msg ", "houve um erro interno");
        res.redirect("/")
    })
})

app.get("/categorias", (req, res) => {
    Categorias.find().then((categorias) => {
        res.render("categorias/index", { categorias: categorias });
    }).catch((err) => {
        req.flash("err_msg", "Houve um erro interno");
        res.redirect("/")
    })
})


app.get("/categorias/:slug", (req, res) => {
    Categorias.findOne({ slug: req.params.slug }).then((categorias) => {
        if (categorias) {

            Postagem.find({ categoria: categorias.id }).then((postagens) => {
                res.render("categorias/postagens", { postagens: postagens, categorias: categorias })
            }).catch((err) => {
                req.flash("err_msg", "Houve um erro ao renderixar")
                res.redirect("/");
            }
            )
        } else {
            req.flash("err_msg", "Essa categoria não existe")
            res.redirect("/")
        }

    }).catch((err) => {
        req.flash("err_msg", "houve um erro interno ao listar categorias");
        res.redirect("/")
    })
})

app.use('/admin', admin);
app.use('/usuario', usuarios)

// Rota 404 (opcional)
app.use((req, res) => {
    res.status(404).send('Página não encontrada');
});


// Tratamento de erros (opcional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ocorreu um erro!');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}/admin`);
});