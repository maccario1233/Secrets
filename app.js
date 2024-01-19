//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// const secret = "Thisisourlittlesecret.";


userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User",userSchema);



app.get("/", function(req,res){
    res.render("home.ejs");
});

app.get("/login", function(req,res){
    res.render("login.ejs");
});

app.get("/register", function(req,res){
    res.render("register.ejs");
});

app.post("/register",function(req,res){
    const email = req.body.username
    const password = req.body.password

    const newUser = new User({
        email: email,
        password: password
    })

    newUser.save()
    .then(result => {res.render("secrets.ejs")})
    .catch(err => {console.log(err)})
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const foundResult = await User.findOne({ email: username });

        if (foundResult && foundResult.password === password) {
            res.render("secrets.ejs");
        } else {
            // Handle incorrect username or password
            res.status(401).send("Invalid username or password");
        }
    } catch (err) {
        console.error(err);
        // Handle other errors
        res.status(500).send("Internal Server Error");
    }
});


app.listen(3000, function(){
    console.log("Server running in port 3000!")
})