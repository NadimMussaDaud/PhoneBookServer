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

let contacts = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons',(request, response) => {
    response.json(contacts)
})
app.get('/info', (request, response) => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${contacts.length} people</p>
    <p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id
    contact = contacts.find( contact => contact.id === id)

    if(contact){
        res.json(contact)
    }else{
        res.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    
    //Tests
    if(!body.name === undefined || !body.number === undefined ){
        return response.status(400).json({
            error: 'name or number missing'
        })
    }
    //Ignored on exercise 3.14
    /*
    Contact.find({ name: body.name })
        .then(() => {
            return response.status(400).json({
                error: 'name must be unique'
            })
        })*/

    
    const contact = new Contact({
        id: generateID(),
        name: body.name,
        number: body.number,
    })
    contact.save().then(savedContact => {
        response.json(savedContact)
    })
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