//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db(config.db);

    //Garantindo unicidade da relação name e username
    db.collection('upload').createIndex(
        { name: 1, username: 1 },
        { unique: true });
});

module.exports  = class upload{
    constructor (name, username, tipo, privacidade, date){
        //nome
        this.name = name;
        //usuário
        this.username = username;
        //tipo - extensao
        this.tipo = tipo
        //publico ou privado
        this.privacidade = privacidade;
        //data da criação
        this.date = date;

    }
}