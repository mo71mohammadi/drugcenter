const express = require('express');
const query = require('url')
const excel = require('xlsx')
const mongoExcel = require('mongo-xlsx')
const fs = require('fs')
const Product = require("../models/products")
const Category = require("../models/categorys")
const request = require('../await-request');


exports.getAll = async (req, res) => {
	try {
		// const group1 = {_id: "$L1.shortName", name: {$addToSet: {$concat: ["$L1.name"]}}};
		// const group2 = {_id: "$L2.shortName", name: {$addToSet: {$concat: ["$L1.name", "-", "$L2.name"]}}};
		// const group3 = {_id: "$L3.shortName", name: {$addToSet: {$concat: ["$L1.name", "-", "$L2.name", "$L3.name"]}}};
		// const group4 = {
		// 	_id: "$L4.shortName",
		// 	name: {$addToSet: {$concat: ["$L1.name", "-", "$L2.name", "$L3.name", "$L4.name"]}}
		// };
		// const match = {};
		//
		// const L1 = await Category.aggregate([{$match: match}, {$group: group1}, {$sort: {"_id.shortName": 1}}])
		// const L2 = await Category.aggregate([{$match: match}, {$group: group2}, {$sort: {"_id.shortName": 1}}])
		// const L3 = await Category.aggregate([{$match: match}, {$group: group3}, {$sort: {"_id.shortName": 1}}])
		// const L4 = await Category.aggregate([{$match: match}, {$group: group4}, {$sort: {"_id.shortName": 1}}])
		// const L = L1.concat(L2, L3, L4)
		// const LArray = []
		// for (const l of L) LArray.push({shortName: l._id, name: l.name[0]})
		// res.status(200).json({count: LArray.length, data: LArray})
		Category.find({}).then(results => {
			return res.status(200).json({count: results.length, data: results})
		})
	} catch (err) {
		res.status(500).json(err.message)

	}
};

exports.getOne = async (req, res) => {
	try {
		// const {level, shortName} = req.body;
		// const match = {};
		// if (!level) {
		// 	console.log(shortName);
		// 	if (shortName.length === 6) match["L4.shortName"] = shortName;
		// 	else if (shortName.length === 4) match["L3.shortName"] = shortName;
		// 	else if (shortName.length === 3) match["L2.shortName"] = shortName;
		// 	else if (shortName.length === 1) match["L1.shortName"] = shortName;
		// 	else return res.status(200).json("parameter is not Correct!");
		// 	await Category.findOne(match).then(result => {
		// 		let response = result.toObject();
		// 		delete response.__v
		// 		if (shortName.length === 1) response = {L1: response.L1}
		// 		else if (shortName.length === 3) response = {L1: response.L1, L2: response.L2}
		// 		else if (shortName.length === 4) response = {L1: response.L1, L2: response.L2, L3: response.L3}
		// 		else if (shortName.length === 6) delete response._id
		// 		return res.status(200).json(response)
		// 	})
		// } else {
		// 	const group = {_id: "$" + level.trim()};
		// 	// const group = {_id: "$L1"};
		// 	if (level === 'L2') match['L1.shortName'] = shortName;
		// 	if (level === 'L3') match['L2.shortName'] = shortName;
		// 	if (level === 'L4') match['L3.shortName'] = shortName;
		// 	Category.aggregate([
		// 		{$match: match},
		// 		{$group: group},
		// 		{$sort: {"_id.shortName": 1}}
		// 	]).then(async results => {
		// 		const objs = [];
		// 		for (let result of results) {
		// 			objs.push(result._id)
		// 		}
		// 		res.status(200).json({count: objs.length, data: objs})
		// 	});
		// }
		let {level, prevId} = req.body
		if (level === "L1") prevId = "";
		if (level === "L2" && prevId.length !== 1) return res.status(401).json({message: "prevId not correct!"});
		if (level === "L3" && prevId.length !== 3) return res.status(401).json({message: "prevId not correct!"});
		if (level === "L4" && prevId.length !== 4) return res.status(401).json({message: "prevId not correct!"});

		const regex = new RegExp(`^${prevId}`);
		Category.find({id: {$regex: regex}, level: level}).then(results => {
			res.status(200).json({count: results.length, data: results})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.create = async (req, res) => {
	try {
		// let shortName
		// const {L1, L2, L3, L4} = req.body;
		// const Alphabet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
		// const catObj = {
		// 	L1: {name: L1, shortName: ""},
		// 	L2: {name: L2, shortName: ""},
		// 	L3: {name: L3, shortName: ""},
		// 	L4: {name: L4, shortName: ""}
		// }
		//
		// Category.findOne({"L1.name": L1, "L2.name": L2, "L3.name": L3, "L4.name": L4}).then(result => {
		// 	if (!result) {
		// 		Category.find({"L1.name": L1, "L2.name": L2, "L3.name": L3}).then(result => {
		// 			if (result.length > 0) {
		// 				shortName = result[0].L3.shortName
		// 				const L4List = []
		// 				for (const item of result) L4List.push(parseInt(item.L4.shortName.slice(4, 6)))
		// 				catObj.L1.shortName = shortName.slice(0, 1)
		// 				catObj.L2.shortName = shortName.slice(0, 3)
		// 				catObj.L3.shortName = shortName.slice(0, 4)
		// 				catObj.L4.shortName = (L4List.length + 1).toString()
		// 				if (catObj.L4.shortName.length < 2) catObj.L4.shortName = shortName.slice(0, 4) + '0' + catObj.L4.shortName;
		// 				else catObj.L4.shortName = shortName.slice(0, 4) + catObj.L4.shortName
		// 				Category.create(catObj).then(result => res.status(200).json(result))
		// 			} else {
		// 				Category.find({"L1.name": L1, "L2.name": L2}).then(result => {
		// 					if (result.length > 0) {
		// 						shortName = result[0].L2.shortName
		// 						const L3List = []
		// 						for (const item of result) L3List.push(parseInt(item.L4.shortName.slice(3, 4)))
		// 						catObj.L1.shortName = shortName.slice(0, 1)
		// 						catObj.L2.shortName = shortName.slice(0, 3)
		// 						catObj.L3.shortName = shortName.slice(0, 3) + Alphabet[L3List.length + 1]
		// 						catObj.L4.shortName = catObj.L3.shortName + "01"
		// 						Category.create(catObj).then(result => res.status(200).json(result))
		// 					} else {
		// 						Category.find({"L1.name": L1}).then(result => {
		// 							if (result.length > 0) {
		// 								shortName = result[0].L1.shortName
		// 								const L2List = []
		// 								for (const item of result) L2List.push(parseInt(item.L4.shortName.slice(1, 3)))
		// 								catObj.L1.shortName = shortName.slice(0, 1)
		// 								catObj.L2.shortName = catObj.L1.shortName + (L2List.length + 1).toString()
		// 								if (catObj.L2.shortName.length < 2) catObj.L2.shortName = catObj.L1.shortName + '0' + catObj.L2.shortName;
		// 								catObj.L3.shortName = catObj.L2.shortName + "A"
		// 								catObj.L4.shortName = catObj.L3.shortName + "01"
		// 								Category.create(catObj).then(result => res.status(200).json(result))
		// 							} else {
		// 								Category.find({}).distinct("L1.name").then(result => {
		// 									catObj.L1.shortName = Alphabet[result.length]
		// 									catObj.L2.shortName = catObj.L1.shortName + "01"
		// 									catObj.L3.shortName = catObj.L2.shortName + "A"
		// 									catObj.L4.shortName = catObj.L3.shortName + "01"
		// 									Category.create(catObj).then(result => res.status(200).json(result))
		// 								})
		// 							}
		// 						})
		// 					}
		// 				})
		// 			}
		// 		})
		// 	} else res.status(200).json("Category exist!")
		// })
		let regex
		let {level, name, prevId} = req.body
		name = name.replace(/ {2,}/g, ' ').trim();
		let obj = {level: level, id: '', name: name, fullName: ""}
		if (level === "L1") {
			prevId = "";
			obj.fullName = name
		} else if (["L2", "L3", "L4"].includes(level)) {
			const prevObj = await Category.findOne({id: prevId})
			if (!prevObj) return res.status(401).json({message: "This prevId not exist!"})
			else obj.fullName = prevObj.fullName + " - " + name
		} else return res.status(401).json({message: "level is not exist!"})
		const alphabet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
		const number = [...Array(100).keys()];
		regex = new RegExp(`^${prevId}`);
		Category.find({id: {$regex: regex}, level: level}).then(results => {
			for (const result of results) {
				if (level === "L1") alphabet.splice(alphabet.indexOf(result.id), 1)
				if (level === "L2") number.splice(number.indexOf(parseInt(result.id.slice(1, 3))), 1)
				if (level === "L3") alphabet.splice(alphabet.indexOf(result.id.slice(3, 4)), 1)
				if (level === "L4") number.splice(number.indexOf(parseInt(result.id.slice(4, 6))), 1)
			}
			if (level === "L1" || level === "L3") obj.id = prevId + alphabet[0]
			if (level === "L2" || level === "L4") {
				if (number[1].toString().length < 2) obj.id = prevId + "0" + number[1]
				else obj.id = prevId + number[1]
			}
			Category.create(obj).then(result => {
				res.status(200).json(result)
			}).catch(err => {
				res.status(200).json(err.message)
			})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.update = async (req, res) => {
	try {
		let {id, name} = req.body
		let fullName = ''
		if (id.length === 1) fullName = name;
		else {
			let pervId = ""
			if (id.length === 3) pervId = id.slice(0, 1)
			if (id.length === 4) pervId = id.slice(0, 3)
			if (id.length === 6) pervId = id.slice(0, 4)
			const prevObj = await Category.findOne({id: pervId})
			fullName = prevObj.fullName + "-" + name
		}
		await Category.findOne({id: id}).then(result => {
			const regex = new RegExp(`${result.name}-`);
			Category.find({fullName: {$regex: regex}}).then(results => {
				results.forEach(item => {
					item.fullName = item.fullName.replace(result.name, name)
					item.save()
				})
			})
		})
		Category.updateOne({id: id}, {$set: {name: name, fullName: fullName}}).then(result => {
			return res.status(200).json({message: result})
		}).catch(err => {
			return res.status(401).json({message: err.message})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.delete = async (req, res) => {
	try {
		let {id} = req.body
		const regex = new RegExp(`^${id}`);
		Category.deleteMany({id: {$regex: regex}}).then(result => {
			return res.status(200).json({message: result})
		}).catch(err => {
			return res.status(401).json({message: err.message})
		})
	} catch (err) {
		res.status(500).json(err.message)
	}
};

exports.import = async (req, res) => {
	try {
		let regex
		const url = 'http://api.ehrs.ir/api/products/category/create'
		// const url = 'http://localhost:5000/api/products/category/create'
		req.connection.setTimeout(1000 * 60 * 10);
		if (req.files) {
			const wb = excel.read(req.files.category.data, {cellDates: true});
			const ws = wb.Sheets['Sheet1'];
			const jsonFile = excel.utils.sheet_to_json(ws);
			// if (jsonFile[0].hasOwnProperty('level')) {
			// 	const level = jsonFile.level.split('-')
			// 	console.log(level)
			// }
			const levelOne = []
			for (const item of jsonFile) {
				let index = jsonFile.indexOf(item);
				if (jsonFile[index].hasOwnProperty('level')) {
					item.L1 = item.level.split(' - ')[0].replace(/ {2,}/g, ' ').trim()
				}
				if (levelOne.includes(item.L1)) {
					continue
				} else levelOne.push(item.L1)
				await Category.findOne({level: "L1", name: item.L1}).then(async result => {
					if (!result) {
						let newObj = await request({
							url: url,
							method: 'POST',
							json: {level: "L1", name: item.L1}
						})
						jsonFile[index].L1 = newObj.id
					} else {
						jsonFile[index].L1 = result.id
					}
				})
			}
			const levelTwo = []
			for (const item of jsonFile) {
				let index = jsonFile.indexOf(item);
				if (jsonFile[index].hasOwnProperty('level')) {
					item.L2 = item.level.split(' - ')[1].replace(/ {2,}/g, ' ').trim()
				}
				if (levelTwo.includes(item.L2)) {
					continue
				} else levelTwo.push(item.L2)

				regex = new RegExp(`^${item.L1}`);
				await Category.findOne({id: {$regex: regex}, level: "L2", name: item.L2}).then(async result => {
					if (!result) {
						let newObj = await request({
							url: url,
							method: 'POST',
							json: {prevId: item.L1, level: "L2", name: item.L2}
						})
						jsonFile[index].L2 = newObj.id
					} else {
						jsonFile[index].L2 = result.id
					}
				})
			}
			const levelThree = []
			for (const item of jsonFile) {
				let index = jsonFile.indexOf(item);
				if (jsonFile[index].hasOwnProperty('level')) {
					item.L3 = item.level.split(' - ')[2].replace(/ {2,}/g, ' ').trim()
				}
				if (levelThree.includes(item.L2)) {
					continue
				} else levelThree.push(item.L2)

				regex = new RegExp(`^${item.L2}`);
				await Category.findOne({id: {$regex: regex}, level: "L3", name: item.L3}).then(async result => {
					if (!result) {
						let newObj = await request({
							url: url,
							method: 'POST',
							json: {prevId: item.L2, level: "L3", name: item.L3}
						})
						jsonFile[index].L3 = newObj.id
					} else {
						jsonFile[index].L3 = result.id
					}
				})
			}
			const levelFour = []
			for (const item of jsonFile) {
				let index = jsonFile.indexOf(item);
				if (jsonFile[index].hasOwnProperty('level')) {
					item.L4 = item.level.split(' - ')[3].replace(/ {2,}/g, ' ').trim()
				}
				if (levelFour.includes(item.L2)) {
					continue
				} else levelFour.push(item.L2)
				regex = new RegExp(`^${item.L3}`);

				await Category.findOne({id: {$regex: regex}, level: "L4", name: item.L4}).then(async result => {
					if (!result) {
						let newObj = await request({
							url: url,
							method: 'POST',
							json: {prevId: item.L3, level: "L4", name: item.L4}
						})
						jsonFile[index].L4 = newObj.id
					} else {
						jsonFile[index].L4 = result.id
					}
				})
			}
			res.status(200).json({message: 'import categories successfully!'})
		} else {
			res.status(401).json({message: 'File Not Found!'})
		}
	} catch (err) {
		res.status(500).json(err.message)

	}
};

