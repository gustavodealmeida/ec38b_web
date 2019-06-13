//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db('mydb');

    //Garantindo unicidade dos indices username e email
    db.collection('upload').createIndex();
});

module.exports  = class upload{
    constructor (name, username, tipo){
        //nome == caminho
        this.name = name;
        //usuário
        this.username = username;
        //tipo - extensao
        this.tipo = tipo
    }
}