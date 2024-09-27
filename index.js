require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contact')

app.use(express.static('dist'))
app.use(cors())


const MAX = 1000000
const MIN = 100
const improvedTiny = ':method :url :status :res[content-length] - :response-time ms :content'

morgan.token('content', function(req,res){
    return JSON.stringify(req['body'])
})

app.use(morgan(improvedTiny))

app.use(express.json())

const generateID = () => {
    return Math.floor(Math.random() * ( MAX - MIN + 1)) + MIN
}


app.get('/api/persons',(request, response, next) => {
    Contact.find({}).then( result => response.json(result))
})
app.get('/info', (request, response, next) => {
    const date = new Date()
    Contact.countDocuments({})
        .then( count => {
        response.send(`<p>Phonebook has info for ${count} people</p>
        <p>${date}</p>`)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {

    Contact.findById(req.params.id)
        .then(contact => {
            response.json(contact)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    
    //Tests
    if(!body.name === undefined || !body.number === undefined ){
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const contact = new Contact({
        id: generateID(),
        name: body.name,
        number: body.number,
    })
    contact.save().then(savedContact => {
        response.json(savedContact)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const contact = {
        id: generateID(),
        name: body.name,
        number: body.number
    }

    Contact.findByIdAndUpdate( request.params.id, contact, { new: true})
    .then( updatedContact => {
        response.json(updatedContact)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Contact.findByIdAndDelete(request.params.id)
        .then( result => {
            response.status(204).end()
        })
        .catch( error =>  next(error))
})


const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if(error.name === "CastError"){
        return response.status(400).send({ error: "malformatted id"})
    }

    next(error)

}

app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})