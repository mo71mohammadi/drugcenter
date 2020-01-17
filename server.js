require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const genericsRouter = require('./routes/generics');
const recommendsRouter = require('./routes/recommends');
const insurancesRouter = require('./routes/insurances');
const productsRouter = require('./routes/products');
const routes = require('./routes/route');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify:false});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Connected to Datebase"));

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type Authorization');
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type,Authorization, Accept');
    next();
};

app.use(allowCrossDomain);

app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api', genericsRouter);
app.use('/api', recommendsRouter);
app.use('/api', insurancesRouter);
app.use('/api', productsRouter);
app.use('/api', routes);

const Port = 5000;
app.listen(Port, () => console.log('Server Started', Port));
