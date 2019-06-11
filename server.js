let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    multer  = require('multer'),
    path = require('path'),
    http = require('http')
    var upname, upusername = 1;

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
db = client.db('mydb');
});

//Utilziar metodo ObjectID do Mongo
let ObjectId = require('mongodb').ObjectID;


app.set('view engine', 'ejs')
app.use('/style', express.static('style'))
app.use('/images', express.static('images'))
app.use('/public', express.static('public'))
app.use(bodyParser.urlencoded({ extended: true}))

app.listen(3000, function(){})

app.get('/', (req, res) =>
{
    db.dropDatabase();
    res.render('tela_publicacao.ejs');
    console.log('drop');
})

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
            upload_info = new upload(upname, upusername);

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

app.get('/tela_busca', (req, res) =>
{
    console.log("-------------------------------");
    db.collection('upload').find({user: 1}).toArray((err, results) =>
    {
        console.log(results);
        res.render('tela_busca.ejs', {data: results});//
    });
    console.log("-------------------------------");
    //let teste = db.collection('upload').find({user : upusername});
    //arrumar o busca pra aparecer todos os files
    //res.render('tela_busca.ejs');//, {data: teste}
});

app.get('/tela_publicacao', (req, res) =>
{
    res.render('tela_publicacao.ejs');
});

app.post('/busca', (req, res) =>
{
    let data = req.body;

    console.log("--------------------------------"+data.busca+"-----------------------------------")

    if(data.busca != "")
    {
        db.collection('upload').find({name: data.busca}).toArray((err, results) =>
        {
            if(!err) res.render('tela_busca.ejs', {data: results});//

            else console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&");
        });
    }

    else res.redirect('/tela_busca');
});

