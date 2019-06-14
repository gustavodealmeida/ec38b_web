//Conexão com o MongoDB
let Mongoclient = require('mongodb').MongoClient;
let config = require('./configMongoDB');
Mongoclient.connect(config.uri, config.options, (err, client) => {
    if (err) return console.log(err);
    db = client.db(config.db);

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
            return "Username Empty"; 
        }
        if (User.email === "") {
            return "Email Empty";
        }
        if (User.password === "") {
            return "Password Empty";
        }

        //== Campos de endereco ==
        if (User.endereco === "") {
            return "Adress Empty";
        }
        if (User.bairro === "") {
            return "District Empty";
        }
        if (User.numero === "") {
            return "Number Empty";
        }
        if (User.cidade === "") {
            return "City Empty";
        }
        if (User.estado === "") {
            return "State Empty";
        }
        if (User.cep === "") {
            return "CEP Empty";
        }
        
        return "Tudo Ok";
    }
}