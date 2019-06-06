const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const MongoClient = require('mongodb').MongoClient 
const uri = "mongodb+srv://luscadb:12345@cluster0-1ysln.mongodb.net/test?retryWrites=true&w=majority"

app.set('view engine', 'ejs')
app.use('/style', express.static('style'))
app.use('/images', express.static('images'))
app.use(bodyParser.urlencoded({ extended: true}))
/*
MongoClient.connect(uri, (err, client) => {
    if(err) return console.log(err)

    db = client.db('testdb')

    app.listen(3000, function()
    {
        console.log('Runando..')
    })
})
*/
app.listen(3000, function(){})

app.get('/', (req, res) =>
{
    res.render('tela_publicacao.ejs')
})

app.post('/show', (req, res) =>
{
    console.log(req.body);
})