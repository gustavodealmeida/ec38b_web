let express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    multer  = require('multer');

var upname, //Para armazenar o nome do arquivo no upload
    aux = 0,
    auxLogin = 0; //Variável para verificar de onde a página publicação está sendo chamada

//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');

Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db(config.db);

    //Inicializando o servidor
    let porta = process.env.PORT || 3000; //Configurando a porta para upar para o Heroku
    http.createServer(app).listen(porta, () => {
        console.log('Servidor na porta ' + porta + '...');
    });
});

//Carregando o css e as imagens necessárias no servidor
app.use('/style', express.static(__dirname + '/style'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/public', express.static(__dirname + '/public'));

//Setando diretório que estão as views
app.set('views', path.join(__dirname, '/views'));

//Configurações da View ejs
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Redirecionamento para a página principal
app.get('/', (req, res) => {
    if (req.cookies && req.cookies.username) {  //Verifica o cookie, se tiver,
        res.redirect('/tela_busca');            //manda direto para a tela de busca..

        return;
    } else {
        res.render("index.ejs"); //Se não tiver, manda para a página inicial..
    }
    //db.dropDatabase(); //Para limpar o bd, quando preciso
    //console.log("Drop");
});

//=========================== Funções de Cadastro de Usuario =====================================

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
                    res.render('cadastro_usuario.ejs', { data: user_info, mensagem: "Username or Email already exists"});
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

//Se o cadastro for efetuado com sucesso, é redirecionado para essa página
app.get('/cadastro_sucesso', (req, res)=>{
        res.render('cadastro_sucesso.ejs');
})

//=========================== Funções de Login de Usuario =====================================

//Mostra tela de login
app.get("/login", (req, res, next) =>{
    if(auxLogin == 1) 
    {
        auxLogin = 0;
        res.render('tela_login', {message: "Incorrect username or password"});
    }
    
    else res.render('tela_login', {message: ""});
});

//Realiza as verficações do login, e conecta (ou não)
app.post('/login', function(req, res, next){
    let username = req.body.username,
        password = req.body.password;
    db.collection('user').findOne({username: username, password : password}, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }else if(!result) {
            auxLogin = 1;
            res.redirect('/login');
        }else{
            res.cookie('username', result.username);
            res.redirect('/tela_busca');
            return ;
        }
    });
});

//Fazer logout
app.get("/logout", (req, res, next) => {
    res.clearCookie('username');
    res.redirect('/login');
});

//=========================== Funções de Publicação de Conteúdo =====================================

//Determinando a pasta onde ficarão salvos os uploads e o nome do arquivo
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload') //Pasta que ficarão os uploads
    },
    filename: function (req, file, cb) {
        upname = file.originalname; //Nome do arquivo, upname salva o nome para ser usado daqui a pouco
        cb(null, file.originalname)
    }
  })
  
var upload = multer({ storage: storage })

//Upload do arquivo
app.post('/files', upload.single('uploadfile'), function(req, res, next)
{
    console.log(req.file);
    if(req.file == null) //Tentar upar nenhum arquivo
    {
        aux = 2;
        res.redirect('/tela_publicacao'); //Recarrega a tela
    }

    else
    {
        let upload = new require('./upload'),
            upload_info,
            tipo;

        tipo = upname.substring(upname.lastIndexOf(".") + 1, upname.length); //Pega só a extensão
        upname = upname.substring(0, upname.lastIndexOf(".")); //Pega só o nome

        upload_info = new upload(upname, req.cookies.username, tipo)

        db.collection('upload').insertOne(upload_info, (err, result) => //Joga no banco
        {
            if(err) 
            {
                aux = 1; //Gera o erro de já ter um arquivo com o mesmo nome
                res.redirect('/tela_publicacao'); //Recarrega a página
                return console.log(err);
            }

            else
            {
                console.log(result);
                res.redirect('/tela_busca');//Quando dá certo, volta pra tela de busca
            }
        });
    }
});

//Tela de publicação
app.get('/tela_publicacao', (req, res) =>
{
    if (req.cookies && req.cookies.username) {

        if(aux === 1){ //Se já existe algum arquivo com o mesmo nome no banco, manda um aviso ao recarregar a página
            aux = 0;
            res.render('tela_publicacao.ejs', { username: req.cookies.username, message: "Already exists a file with the same name"});
        }

        else if(aux === 2){ //Se nenhum arquivo foi selecionado, manda um aviso ao recarregar a página
            aux = 0; 
            res.render('tela_publicacao.ejs', { username: req.cookies.username, message: "No file selected"});
        }

        else{ //Quando é chamada pela tela de busca, não mostra nenhuma mensagem
            res.render('tela_publicacao.ejs', { username: req.cookies.username, message: ""});
        }

        return;
    } else {
        res.redirect('/login');
    }  
});

//=========================== Funções de Busca de Conteúdo =====================================

//Tela de busca
app.get('/tela_busca', (req, res, next) =>
{
    if(req.cookies && req.cookies.username){ //se tem um cookie, carrrega os arquivos referentes ao username

        db.collection('upload').find({ username: req.cookies.username }).toArray((err, results) => {
            console.log(results);
            res.render('tela_busca.ejs', { data: results, username: req.cookies.username, message: ""});
        });

        return ;
    }else{ //Caso contrário, manda pra tela de login
        res.redirect('/login');
    }
});

//Função de busca
app.post('/busca', (req, res) =>
{
    let data = req.body;

    if(data.busca != "")
    {
        db.collection('upload').find({name: data.busca}).toArray((err, results) =>
        {
            let messageBusca;

            if(results == "") messageBusca = "No results";

            else messageBusca = "";

            if(!err) res.render('tela_busca.ejs', {data: results, username: req.cookies.username, message: messageBusca});//

            else console.log("ERRO");
        });
    }

    else res.redirect('/tela_busca');
});

