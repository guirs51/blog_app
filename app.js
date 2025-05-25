// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const admin = require("./routes/admin");
const mongoose = require('mongoose');

// Configurações
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
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Arquivos estáticos (descomente se necessário)
 app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use('/admin', admin);

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