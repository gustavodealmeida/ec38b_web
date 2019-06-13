//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db('mydb');

    //Garantindo unicidade dos indices username e email
    db.collection('user').createIndex({ username: 1 }, { unique: true });
    db.collection('user').createIndex({email: 1 },{ unique: true});
});


module.exports  = class User{
    constructor(data) {
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.endereco = data.endereco;
        this.numero = data.numero;
        this.bairro = data.bairro;
        this.cidade = data.cidade;
        this.estado = data.estado;
        this.cep = data.cep;
    }

    static verificaCampos(User){
        if(User.username === ""){
            return "Campo Username Vazio"; 
        }
        if (User.email === "") {
            return "Campo Email Vazio";
        }
        if (User.password === "") {
            return "Campo password Vazio";
        }

        //== Campos de endereco ==
        if (User.endereco === "") {
            return "Campo ENDEREÇO Vazio";
        }
        if (User.bairro === "") {
            return "Campo BAIRRO Vazio";
        }
        if (User.numero === "") {
            return "Campo NUMERO Vazio";
        }
        if (User.cidade === "") {
            return "Campo CIDADE Vazio";
        }
        if (User.estado === "") {
            return "Campo ESTADO Vazio";
        }
        if (User.cep === "") {
            return "Campo CEP Vazio";
        }
        
        return "Tudo Ok";
    }
}