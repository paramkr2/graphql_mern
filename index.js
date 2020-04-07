const {ApolloServer, PubSub}  = require('apollo-server');
const mongo = require('mongoose')
    
const {MONGODB} = require('./config.js');
const {typeDefs} = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers') // if we just specify the folder then it will look for the indes.js file

const pubsub = new PubSub() ;
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => ({req , pubsub}) // this here to forword our req object to the query function , so we can access it there 
})

mongo.connect( MONGODB, {useNewUrlParser: true , useUnifiedTopology: true} )
.then( res => {
    console.log( 'Mongoose Database connected');
}).catch( err => {
    console.log( 'Error connecting to database');
})

server.listen( {port: '5000' })
    .then( res => {
        console.log( `Server running at ${res.url}`)
    })
