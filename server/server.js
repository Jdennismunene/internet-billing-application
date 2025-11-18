import express from 'express'

const app = express();

app.get('/', (req, res) => {
    console.log("Welcome to internet billing system")
})

app.listen(() => {
    console.log("Server is running on http://localhost:5000")
})

export default app