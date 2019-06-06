// Utilizando o express
let express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http');

//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db('mydb');
});

//Utilziar metodo ObjectID do Mongo
let ObjectId = require('mongodb').ObjectID;

//carregando o css e imagens no servidor
app.use('/style', express.static(__dirname + '/style'));
app.use('/images', express.static(__dirname + '/images'));

//setando direotrio que está as views
app.set('views', path.join(__dirname, '/views'));

//Mandando configurações da View ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

//Redirecionamento para a página principal
app.get('/', (req, res) => {
    res.render("index.ejs");
});

//Redirecionamento para a página de cadastro
app.route('/cadastro_usuario')
.get((req, res) => {
    let data = req.body;
    res.render("cadastro_usuario.ejs", { data: "", mensagem: "" });
})
.post((req, res) => {
    let dados_preenchidos = req.body;

    res.render("cadastro_usuario.ejs", { data: dados_preenchidos, mensagem: "" });
});

//Fazendo cadastro de Usuario com o metodo POST
app.post('/get_usuario', (req, res) => {
    let User = new require('./user'),
        user_info = new User(req.body),
        mensagem  = User.verificaCampos(user_info);

        console.log(mensagem);

        if(mensagem==="Tudo Ok"){
            db.collection('user').insertOne(user_info, (err, result) => {
                if (err){
                    res.render('cadastro_usuario.ejs', { data: req.body, mensagem: "Username ou Email já cadastrado"});
                    return console.log(err);
                }else{
                    console.log(result);
                    res.redirect('/cadastro_sucesso');
                }
                
            });
        }else{
            res.render('cadastro_usuario.ejs', { data: req.body, mensagem: mensagem});
        }
});

//Se cadastro for efetuado com sucesso, é redirecionado para essa página
app.get('/cadastro_sucesso', (req, res)=>{
        res.render('cadastro_sucesso.ejs');
})



http.createServer(app).listen(3000, () => {
    console.log('Servidor na porta 3000...')
});
