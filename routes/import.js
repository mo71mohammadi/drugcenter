const Drug = require("../models/archive/drugs");
const UpToDate = require("../models/upToDate");
const MedScape = require("../models/medScape");
const Recommend = require("../models/archive/recommends");
const Insurance = require("../models/insurances");

const fs = require('fs');
const query = require('url');

exports.import = async (req, res) => {
	try {
		const params = query.parse(req.url, true).query;
		fs.readFile(`./temp/${params['file']}.json`,"utf8",async (err, data) => {
			if (err) throw err;
			let newData = data.replace(/"_id":{.*?},/g, '')
			let student = JSON.parse(newData)
			for (const record of student) {
				delete record._id
			}
			let colObj = {
				Recommend: Recommend,
				MedScape: MedScape,
				UpToDate: UpToDate,
				Drug: Drug,
				Insurance: Insurance
			}
			colObj[params['collection']].insertMany(student).then(result => {
				res.status(200).json(result.length)
			}).catch(err=>{
				res.status(200).json(err.message)
			})
		});
	} catch (e) {
		res.status(200).json({message: e.message})
	}
}