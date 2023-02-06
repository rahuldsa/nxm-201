const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { connection } = require('./configs/db')
const { UserModel } = require('./models/user.model')
const { authenticate } = require('./middlewares/authenticate')
const { authorise } = require('./middlewares/authorise')

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
    res.send('base api endpoint')
})

app.post('/signup', (req, res) => {
    const { name, email, password, role } = req.body
    bcrypt.hash(password, 5, async function (err, hash) {
        const user = new UserModel({
            name,
            email: email,
            password: hash,
            role
        })
        await user.save()
        res.send('sign up successfull')
    })
    res.send('sign up in progress')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body
    const user = await UserModel.findOne({ email })
    if (!user) {
        res.send('please signup first')
    }
    const hashedpwd = user?.password
    bcrypt.compare(password, hashedpwd, function (err, result) {
        if (result) {
            const token = jwt.sign({ userID: user._id, role: user.role }, 'NORMAL_SECRET')
            const refresh_token = jwt.sign({ userID: user._id }, 'REFRESH_SECRET', { expiresIn: 300 })
            res.send({ msg: 'login successfull', token, refresh_token })
        }
        else {
            res.send('login failed')
        }
    })
})

app.post('/goldrate', authenticate, (req, res) => {
    res.send('goldrate')
})

app.get('/getnewtoken', (req, res) => {
    const refresh_token = req.headers.authorization?.split(' ')[1]
    if (!refresh_token) {
        res.send('login again')
    }
    else {
        jwt.verify(refresh_token, 'REFRESH_SECRET', function (err, decoded) {
            if (err) {
                res.send({ 'message': 'please login first', 'err': err.message })
            }
            else {
                const token = jwt.sign({ userID: decoded.userID }, 'NORMAL_SECRET', { expiresIn: 60 })
                res.send({ msg: 'login successfull', token })
            }
        })
    }
})

app.post('/userstats', (req, res) => {
    res.send('here are userstats')
})

const arr = []

app.get('/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    const blacklisteddata = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'))
    blacklisteddata.push(token)
    fs.writeFileSync('./blacklist.json', JSON.stringify(blacklisteddata))
    res.send('logout successfully')
})

app.listen(4500, async () => {
    try {
        await connection
        console.log('successfully connected to db');
    } catch (err) {
        console.log('connecting to db failed');
        console.log(err);
    }
    console.log('runs at port 4500');
})