//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db('mydb');
});

module.exports  = class User{
    constructor (data){
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.endereco_completo = {   endereco  : data.endereco,
                            numero : data.numero,
                            bairro  : data.bairro,
                            cidade : data.cidade,
                            estado : data.estado,
                            cep : data.cep
                        };
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
        if (User.endereco_completo.endereco === "") {
            return "Campo ENDEREÇO Vazio";
        }
        if (User.endereco_completo.bairro === "") {
            return "Campo BAIRRO Vazio";
        }
        if (User.endereco_completo.numero === "") {
            return "Campo NUMERO Vazio";
        }
        if (User.endereco_completo.cidade === "") {
            return "Campo CIDADE Vazio";
        }
        if (User.endereco_completo.estado === "") {
            return "Campo ESTADO Vazio";
        }
        if (User.endereco_completo.cep === "") {
            return "Campo CEP Vazio";
        }

        return this.verificaUnicidade(User);
    }

    static verificaUnicidade(User){
        let mensagem = "Tudo Ok";

       if (db.collection('user').findOne({ username : this.username})){
           return "Username Indisponivel";
       }
/*
       if (db.collection('user').find({ username : this.username})){
           return "Username Indisponivel";
       }
        db.collection('user').find({ username: User.username }).toArray((err, result) => {
            console.log(result);
            if (result != []) {
                mensagem = "Username já cadastrado";
            }
        });

        /*db.collection('user').find({ email: User.email }, (err, result) => {
            if (result != []) {
                mensagem = "Email já cadastrado";
            }
        });*/

        return mensagem;
    }

    
}