import express from 'express'
import dotenv from 'dotenv';
dotenv.config();
import authChecker from './middleware/authChecker.js'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/protected', authChecker, (req, res) => {
    res.send('Protected Route')
  })

app.listen(process.env.SERVER_PORT, () => {
    console.log("App listening")
}) 