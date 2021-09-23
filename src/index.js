const { response } = require('express');
const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json())

const getBalance = (statement) => {
  const balance = statement.reduce((sum, current) =>
  current.type === 'credit' ? sum + current.amount : sum - current.amount
  , 0)

  return balance
}

const verifyIfExistsAccountCPF = (request, response, next) => {
  const {cpf} = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) return response.json({error: "Nenhum usuário encontrado"})

  request.customer = customer;

  return next()


}

const customers = [];


app.post('/account', (request, response) => {
  const {cpf, name} = request.body;
  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

   if (customerAlreadyExists){
    response.status(400).json({error: "Este usuário já existe!"})
   }

    customers.push({id: uuidv4(), name, cpf, statement: []});

  return response.status(201).send()
})

app.get('/account',verifyIfExistsAccountCPF, ( request, response) => {
  const {customer} = request
  return (response.status(200).json(customer))
})


app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const {description, amount} = request.body;
  const {customer} = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }
  customer.statement.push(statementOperation)

  return response.json({message: "Depósito realizado com sucesso!"})

})

app.get("/balance", verifyIfExistsAccountCPF, (request, response) => {
  const {customer} = request
  const wealthy = getBalance(customer.statement)
  return(response.status(200).json({wealthy: `Você tem R$${wealthy}`}))
})

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const {customer} = request
  const {amount, description} = request.body
  const wealthy = getBalance(customer.statement)

  if (amount > wealthy){
    return response.json({error: "Saldo insuficiente"})
  }


    customer.statement.push(statementOperation)

  return(response.status(200).json({message: `Saque de ${amount} realizado com sucesso!`}))
})

app.listen('3333');
