require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const routes = require('./routes/route');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require('./swagger.json');

var user = encodeURIComponent('medrep');
var password = encodeURIComponent('Zxcv4194!@#$');

mongoose.connect(`mongodb://localhost/drugCenter`, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log("Connected to Datebase"));

var allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type Authorization');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type,Authorization, Accept');
	next();
};

app.use(allowCrossDomain);

// Extended:
const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'EHRS API',
			description: "ehrs API Information",
			contact: {
				name: "Amazing Developer"
			},
			servers: ["http://localhost:5000"]
		}
	},
	// [".routes/*.js"]
	apis: ["swagger.js"]
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)

app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument))


app.use(express.json());
// app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: false}));
app.use(async (req, res, next) => {
	if (req.headers["authorization"]) {
		const accessToken = req.headers["authorization"];
		jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded) => {
			if (err && err.message) return res.status(401).json({error: `${err.message}, please login to obtain a new one`});
				// const user = await User.findById(decoded.userId);
			// if (user.accessToken !== accessToken) return res.status(401).json({error: `jwt expired, please login to obtain a new one`});
			else res.locals.loggedInUser = await User.findById(decoded.userId);
			next();
		});
	} else {
		next();
	}
});
app.use(express.static(__dirname + '/uploads'));

app.use('/api', routes);

const Port = 5000;
app.listen(Port, () => console.log('Server Started', Port));