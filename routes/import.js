'use strict';
const Drug = require("../models/drugs");
const UpToDate = require("../models/upToDate");
const MedScape = require("../models/medScape");
const Recommend = require("../models/recommends");

const fs = require('fs');
const query = require('url');

exports.import = async (req, res) => {
	try {
				res.status(200).json("result.length")

		// const params = query.parse(req.url, true).query;
		// fs.readFile(`./temp/${params['file']}.json`,"utf8",async (err, data) => {
		// 	if (err) throw err;
		// 	let newData = data.replace(/"_id":{.*?},/g, '')
		// 	let student = JSON.parse(newData)
		// 	for (const record of student) {
		// 		delete record._id
		// 	}
		// 	let colObj = {
		// 		Recommend: Recommend,
		// 		MedScape: MedScape,
		// 		UpToDate: UpToDate,
		// 		Drug: Drug
		// 	}
		// 	colObj[params['collection']].insertMany(student).then(result => {
		// 		res.status(200).json(result.length)
		// 	})
		// });
	} catch (e) {
		res.status(200).json({message: e.message})
	}
}