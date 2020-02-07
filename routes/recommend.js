const Recommend = require("../models/recommends");
const xlsx = require('xlsx');
const query = require('url');


exports.importATC = async (req, res) => {
    try {
        if (req.files) {
            const wb = xlsx.read(req.files.products.data, {cellDates: true});
            const ws = wb.Sheets['TOTAL'];
            const jsonData = xlsx.utils.sheet_to_json(ws);
            console.log(jsonData.length);
            for (const item of jsonData) {
                item['L5.enName'] = item['L5.enName'].slice(0, -10);
                item['L4.enName'] = item['L4.enName'].slice(0, -8);
                item['L3.enName'] = item['L3.enName'].slice(0, -7);
                item['L2.enName'] = item['L2.enName'].slice(0, -6);
                item['L1.enName'] = item['L1.enName'].slice(0, -4);
                if (item['ddd.admRoute']) item.ddd = [{admRoute: item['ddd.admRoute'], dose: item['ddd.dose'], unit: item['ddd.unit']}];
                else item.ddd = [];
                await Recommend.findOne({"atc.L5.shortName": item['L5.shortName']}).then(async result => {
                    if (!result) {
                        await Recommend.create({atc: item})
                    } else {
                        await Recommend.updateOne({
                            "atc.L5.shortName": item['L5.shortName'],
                            "atc.ddd.admRoute": {$ne: item['ddd.admRoute']}
                        }, {$addToSet: {"atc.ddd": item.ddd[0]}})
                    }
                })
            }
            res.status(200).json({message: 'item import successfully!'})
        } else res.status(401).json({message: 'File Not Found!'})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
};
exports.atc = async (req, res) => {
    try {
        const {level, shortName} = query.parse(req.url, true).query;
        const group = {_id: "$atc." + level.trim()};
        const match = {};
        if (level === 'L2') match['atc.L1.shortName'] = shortName;
        if (level === 'L3') match['atc.L2.shortName'] = shortName;
        if (level === 'L4') match['atc.L3.shortName'] = shortName;
        if (level === 'L5') match['atc.L4.shortName'] = shortName;
        if (level === 'ddd') match['atc.L5.shortName'] = shortName;

        Recommend.aggregate([
            {$match: match},
            {$group: group},
            {$sort: {"_id.shortName": 1}}
        ]).then(async results => {
            const objs = [];
            for (let result of results) {
                objs.push(result._id)
            }
            if (level === 'ddd') res.status(200).json({count: objs.length, data: objs[0]});
            else res.status(200).json({count: objs.length, data: objs})
        });
    } catch (err) {
        res.status(500).json({message: err.message})
    }
};