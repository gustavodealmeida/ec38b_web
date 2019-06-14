//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db(config.db);

    //Garantindo unicidade do indice name
    db.collection('upload').createIndex({name: 1 },{ unique: true});
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