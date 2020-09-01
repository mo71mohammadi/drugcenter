const DrugInfo = require("../models/drugsInfo");
const query = require('url');


exports.search = async (req, res) => {
	try {
		let {q, limit} = query.parse(req.url, true).query;
		if (!limit || limit > 50) limit = 50
		let regex = new RegExp(q, 'i');
		DrugInfo.find({
			$or: [{enName: regex}, {faName: regex}]
		}, {_id: 1, enName: 1, enRoute: 1, enForm: 1, volume: 1, strength: 1}).limit(parseInt(limit)).then(result => {
			// console.log(result)
			res.status(200).json({count: result.length, data: result})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
}

