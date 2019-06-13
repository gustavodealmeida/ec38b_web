// Utilizando o express
let express = require('express'),
    app = express(),
    path = require('path'),
    router = express.Router();
    http = require('http'),
    cookieParser = require('cookie-parser');
    multer  = require('multer');
    var upname;
    //, upusername = 1;

    //O upuser vai salvar o usuário cadastrado, para poder acessar
    //os arquivos referentes a ele..
    //No user.js, cria um static username(User){return User.username}
    //e fica upusername = User.username(user_info) no app.post
    // do get_usuario..

//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db(config.db);
});

//Utilziar metodo ObjectID do Mongo
//let ObjectId = require('mongodb').ObjectID;

//Inicizaliado o servidor
let porta = process.env.PORT || 3000; //Configurando a porta para upar para o Heroku
http.createServer(app).listen(porta);

//carregando o css e imagens no servidor
app.use('/style', express.static(__dirname + '/style'));
app.use('/images', express.static(__dirname + '/images'));

//setando direotrio que está as views
app.set('views', path.join(__dirname, '/views'));

//Mandando configurações da View ejs
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use('/tela_busca', indexRouter);
//app.use('/users', usersRouter);

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
                    res.render('cadastro_usuario.ejs', { data: user_info, mensagem: "Username ou Email já cadastrado"});
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
        //db.collection('user').drop();
        res.render('cadastro_sucesso.ejs');
})

//=========================== Funcoes de Login de Usuario =====================================
//Configurações padrão de cookies


app.get("/login", (req, res, next) =>{
    res.render('tela_login');
});

app.post('/login', function(req, res, next){
    let username = req.body.username,
        password = req.body.password;
    db.collection('user').findOne({username: username, password : password}, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }else if(!result) {
            res.status(403);
            res.write('<h1> Erro 403</h1>');
        }else{
            res.cookie('username', result.username);
            res.redirect('/tela_busca');
            return ;
        }

    });
});

app.get("/logout", (req, res, next) => {
    res.clearCookie('username');
    res.redirect('/login');
});

//=========================== FIM Funcoes de Login de Usuario =====================================

app.use('/public', express.static('public'))
//app.use(bodyParser.urlencoded({ extended: true}))

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
        upname = file.originalname;
        cb(null, file.originalname)
    }
  })
  
var upload = multer({ storage: storage })

app.post('/files', upload.single('uploadfile'), function(req, res, next)
{
    console.log(req.file);
    if(req.file == null)
        res.redirect('/tela_publicacao');

    else
    {
        let upload = new require('./upload'),
            upload_info = new upload(upname, req.cookies.username);

        db.collection('upload').insertOne(upload_info, (err, result) => 
        {
            if(err) return console.log(err);

            else
            {
                console.log(result);
                res.redirect('/tela_busca');
            }
        });
    }
});

app.get('/tela_busca', (req, res, next) =>
{
    if(req.cookies && req.cookies.username){
        console.log("-------------------------------");
        db.collection('upload').find({ username: req.cookies.username }).toArray((err, results) => {
            console.log(results);
            res.render('tela_busca.ejs', { data: results, username: req.cookies.username});
        });

        return ;
    }else{
        res.redirect('/login');
    }
    
    console.log("-------------------------------");
    //let teste = db.collection('upload').find({user : upusername});
    //arrumar o busca pra aparecer todos os files
    //res.render('tela_busca.ejs');//, {data: teste}
});

app.get('/tela_publicacao', (req, res) =>
{
    if (req.cookies && req.cookies.username) {
        res.render('tela_publicacao.ejs', { username: req.cookies.username });

        return;
    } else {
        res.redirect('/login');
    }
    
});

app.post('/busca', (req, res) =>
{
    let data = req.body;

    console.log("--------------------------------"+data.busca+"-----------------------------------")

    if(data.busca != "")
    {
        db.collection('upload').find({name: data.busca}).toArray((err, results) =>
        {
            if(!err) res.render('tela_busca.ejs', {data: results, username: req.cookies.username});//

            else console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&");
        });
    }

    else res.redirect('/tela_busca');
});

