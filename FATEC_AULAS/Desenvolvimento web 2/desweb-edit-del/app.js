    const express = require("express")
    const app = express()
    const handle = require("handlebars")
    const handlebars = require("express-handlebars").engine
    const bodyParser = require("body-parser")
    const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
    const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
    const {doc, updateDoc} = require('firebase/firestore')

    // config do handlebars
    app.engine("handlebars", handlebars({defaultLayout: "main"}))
    app.set("view engine", "handlebars")

    // firebase
    var serviceAccount = require("./projetoweb-bb192-firebase-adminsdk-6px47-b47a047120.json");

    initializeApp({
        credential: cert(serviceAccount)
    });

    const db = getFirestore();

    // body parser
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())

    // rotas
    app.get("/", function(req, res){
        res.render("primeira_pagina")
    })

    app.get("/consulta", async function(req, res){
        let result = await db.collection('clientes').get();
        
        let vetor = [];
        result.forEach(doc => {
            vetor.push({
                id: doc.id,
                nome: doc.data().nome, 
                telefone: doc.data().telefone, 
                data_contato: doc.data().data_contato, 
                observacao: doc.data().observacao
            })
        })
    
        res.render("consulta", {vetor})
    })
    
    app.get("/editar/:id", async function(req, res){
        let result = await db.collection('clientes').doc(req.params.id).get()
        
        if (result.exists) {
            let post = {
                id: result.id,
                nome: result.data().nome, 
                telefone: result.data().telefone, 
                data_contato: result.data().data_contato, 
                observacao: result.data().observacao
            }
            res.render("editar", {post})
        } else {
            res.redirect("/consulta")
        }
    })
    
    app.get("/excluir/:id", async function(req, res){
        await db.collection('clientes').doc(req.params.id).delete()
        res.redirect("/consulta")
    })
    
    app.post("/cadastrar", async function(req, res){
        try {
            await db.collection('clientes').add({
                nome: req.body.nome,
                telefone: req.body.telefone,
                data_contato: req.body.data_contato,
                observacao: req.body.observacao
            })
            console.log('cadastrado com sucesso')
            res.redirect("/")
        } catch (erro) {
            console.log('erro ao cadastrar: '+erro)
            res.send('Erro ao cadastrar')
        }
    })
    
    app.post("/atualizar", async function(req, res){
        try {
            await db.collection('clientes').doc(req.body.id).update({
                nome: req.body.nome,
                telefone: req.body.telefone,
                data_contato: req.body.data_contato,
                observacao: req.body.observacao
            })
            res.redirect('/consulta')
        } catch (erro) {
            console.log('erro ao atualizar dados: '+erro)
            res.send('Erro ao atualizar dados')
        }
    })
    

    app.listen(8081, function(){
        console.log("Servidor ativo!")
    })
