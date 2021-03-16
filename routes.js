const express = require('express');
const puppeteer = require('puppeteer');
var admin = require("firebase-admin");
const firebase = require("firebase-admin");
require('./firebase/base')
const {Storage} = require('@google-cloud/storage');
var fs = require('fs');
const os = require('os');

// Creates a client
const storage = new Storage();

const databaseName = 'membros';

const routes = express.Router();

const db = firebase.firestore();

// ------------------------- Membros ------------------------------

routes.post('/membro/create', async (req, res) => {
    const {
        nome, 
        cargo,
        congregacao, 
        naturalidade, 
        rg, 
        cpf,
        estado_civil,
        data_batismo,
        data_nascimento,
        data_membro,
        rua,
        numero,
        bairro,
        cidade
    } = req.body;

      var membrosRes = []; //Array com todos os membros cadastrados
      let id = 0; // Variavel de Id do membro

      // Requisição ao banco de dados, buscar os membros cadastrados
      const snapshot = await db.collection(databaseName).get();
      // Colocando os dados retornados dentro de um array
      snapshot.forEach(doc => {
        membrosRes.push(doc.data());
      });
      // Essa variavel busca um objeto em branco e retorna a posição dele
      const emptyIndex = membrosRes.findIndex((obj) => Object.keys(obj).length === 0);
      // Variavel de id do membro

      if(emptyIndex > -1){
        membrosRes.splice(emptyIndex, 1);
      }
      // Gambiarra de id auto increment
      id = membrosRes.length + 1
      

    const data = {
        id: id,
        key: id,
        nome: nome,
        cargo: cargo, 
        congregacao: congregacao, 
        naturalidade: naturalidade, 
        rg: rg, 
        cpf: cpf,
        estado_civil: estado_civil,
        data_batismo: data_batismo,
        data_nascimento: data_nascimento,
        data_membro: data_membro,
        endereco: {
            rua: rua,
            numero: numero,
            bairro: bairro,
            cidade: cidade
        }
      };

      try {
        // Adicionando um novo membro
        const resp = await db.collection(databaseName).doc(`${nome} - ${id}`).set(data); 
      } catch (err) {
        return res.json(err);
      }

      return res.json("Cadastro Feito Com Sucesso!"); 
});

routes.get('/membro', async (req, res) => {
    var membrosRes = []; //Array com todos os membros cadastrados

    try {
        // Requisição ao banco de dados, buscar os membros cadastrados
        const snapshot = await db.collection(databaseName).get();
        // Colocando os dados retornados dentro de um array
        snapshot.forEach(doc => {
            membrosRes.push(doc.data());
        });
    } catch (err) {
        return res.json(err);
    }

    return res.json(membrosRes);
});

routes.delete('/membro/delete/:id', async (req, res) => {
    const id = req.params.id;
    let nameIDMembro = ''; // Variavel armazena o nome do documento que será deletado
    // Requisição ao banco de dados procurando especificamente pelo id informado
    const snapshot = await db.collection(databaseName).where('id', '==', Number(id)).get();

    if (snapshot.empty) {
        return res.json("Erro: Nenhum Documento foi Encontrado!!");
    }
      
    snapshot.forEach(doc => {
        nameIDMembro = doc.id
    });

    try {
        const resp = await db.collection(databaseName).doc(nameIDMembro).delete();
    } catch (err) {
        return res.json(err);
    }
    return res.json("Membro Deletado com Sucesso!");
});

routes.put('/membro/edit/:id', async (req, res) => {
    const id = req.params.id;
    let nameIDMembro = ''; // Variavel armazena o nome do documento que será deletado
    // Requisição ao banco de dados procurando especificamente pelo id informado
    const snapshot = await db.collection(databaseName).where('id', '==', Number(id)).get();

    if (snapshot.empty) {
        return res.json("Erro: Nenhum Documento foi Encontrado!!");
    }
      
    snapshot.forEach(doc => {
        nameIDMembro = doc.id;
    });
    const {
        nome, 
        cargo,
        congregacao, 
        naturalidade, 
        rg, 
        cpf,
        estado_civil,
        data_batismo,
        data_nascimento,
        data_membro,
        rua,
        numero,
        bairro,
        cidade
    } = req.body;

    const data = {
        id: Number(id),
        key: Number(id),
        nome: nome,
        cargo: cargo, 
        congregacao: congregacao, 
        naturalidade: naturalidade, 
        rg: rg, 
        cpf: cpf,
        estado_civil: estado_civil,
        data_batismo: data_batismo,
        data_nascimento: data_nascimento,
        data_membro: data_membro,
        endereco: {
            rua: rua,
            numero: numero,
            bairro: bairro,
            cidade: cidade
        }
      };

    try {
        const resp = await db.collection(databaseName).doc(nameIDMembro).update(data);
    } catch (err) {
        return res.json(err);
    }
    return res.json("Membro Alterado com Sucesso!");
});

routes.get('/membro/:id', async (req, res) => {
    const id = req.params.id;
    var membrosRes = []; // Array com o membro pesquisado

    // Requisição ao banco de dados procurando especificamente pelo id informado
    const snapshot = await db.collection(databaseName).where('id', '==', Number(id)).get();

    if (snapshot.empty) {
        return res.json("Erro: Nenhum Documento foi Encontrado!!");
    }
      
    snapshot.forEach(doc => {
        membrosRes.push(doc.data());
    });

    return res.json(membrosRes);
});

// ----------------------- Congregações ------------------------------

routes.get('/congregacao', async (req, res) => {
    var congregacoesRes = []; //Array com todos os membros cadastrados

    try {
        // Requisição ao banco de dados, buscar os membros cadastrados
        const snapshot = await db.collection('congregacoes').get();
        // Colocando os dados retornados dentro de um array
        snapshot.forEach(doc => {
            congregacoesRes.push(doc.data());
        });
    } catch (err) {
        return res.json(err);
    }

    return res.json(congregacoesRes);
});

routes.post('/congregacao/create', async (req, res) => {
    const {
        nome_congregacao,
        cidade
    } = req.body;

      var congregacoesRes = []; //Array com todos os membros cadastrados
      let id = 0; // Variavel de Id do membro

      // Requisição ao banco de dados, buscar os membros cadastrados
      const snapshot = await db.collection('congregacoes').get();
      // Colocando os dados retornados dentro de um array
      snapshot.forEach(doc => {
        congregacoesRes.push(doc.data());
      });
      // Essa variavel busca um objeto em branco e retorna a posição dele
      const emptyIndex = congregacoesRes.findIndex((obj) => Object.keys(obj).length === 0);
      // Variavel de id do membro

      if(emptyIndex > -1){
        congregacoesRes.splice(emptyIndex, 1);
      }
      // Gambiarra de id auto increment
      id = congregacoesRes.length + 1
      

    const data = {
        id: id,
        nome_congregacao: nome_congregacao,
        cidade: cidade
      };

      try {
        // Adicionando um novo membro
        const resp = await db.collection('congregacoes').doc(`${nome_congregacao} - ${id}`).set(data); 
      } catch (err) {
        return res.json(err);
      }

      return res.json("Cadastro Feito Com Sucesso!"); 
});

routes.delete('/congregacao/delete/:id', async (req, res) => {
    const id = req.params.id;
    let nameIDMembro = ''; // Variavel armazena o nome do documento que será deletado
    // Requisição ao banco de dados procurando especificamente pelo id informado
    const snapshot = await db.collection('congregacoes').where('id', '==', Number(id)).get();

    if (snapshot.empty) {
        return res.json("Erro: Nenhum Documento foi Encontrado!!");
    }
      
    snapshot.forEach(doc => {
        nameIDMembro = doc.id
    });

    try {
        const resp = await db.collection('congregacoes').doc(nameIDMembro).delete();
    } catch (err) {
        return res.json(err);
    }
    return res.json("Congregação Deletada com Sucesso!");
});

// ----------------------- Fazendo as Imagens ------------------------------

routes.post('/carteira/create', async (req, res) => {
    const {membros} = req.body;
    const bucket = storage.bucket('cad-membros.appspot.com');
    var membrosRes = []; //Array com todos os membros cadastrados
    var ids = [];
    var nomes = [];
    var arquivos = [];

    try {
        // Requisição ao banco de dados, buscar os membros cadastrados
        const snapshot = await db.collection(databaseName).get();
        // Colocando os dados retornados dentro de um array
        snapshot.forEach(doc => {
            membrosRes.push(doc.data());
        });
    } catch (err) {
        return res.json(err);
    }

    membrosRes.map(res => {
        ids.push(res.id);
        nomes.push(res.nome);
    });

        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            ignoreDefaultArgs: ['--disable-extensions'],
            headless: true
          });

    for (let index = 0; index < membros.length; index++) {
        let nomeIndex = membros[index] - 1;
        const page = await browser.newPage();
        await page.setDefaultTimeout(10000000); 
        await page.setViewport({width: 1210, height: 395}) 
        await page.goto(`${process.env.URL_FRONTEND}/preview/${membros[index]}`);
        
        var image = await page.screenshot({omitBackground: true});
        console.log(image);
        await page.close(); 
        fs.writeFile(`${os.tmpdir()}/carteira-${membros[index]}-${nomes[nomeIndex]}.png`, image, function(err) {
            if (err) throw err;
        });
        await bucket.upload(`${os.tmpdir()}/carteira-${membros[index]}-${nomes[nomeIndex]}.png`, { 
            destination: `carteiras/carteira-${membros[index]}-${nomes[nomeIndex]}.png`,
          });
          fs.unlink(`${os.tmpdir()}/carteira-${membros[index]}-${nomes[nomeIndex]}.png`, (err) => {
            if (err) {
              console.error(err)
              return
            }
          
            //file removed
          })
        arquivos.push(`carteira-${membros[index]}-${nomes[nomeIndex]}.png`);
    }
    await browser.close();
    
    return res.json(arquivos);
});

module.exports = routes;