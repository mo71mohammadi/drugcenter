const UpToDate = require("../models/upToDate");
const query = require('url');


exports.interactionChecker = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        let search;
        if ("eRx" in params) search = {eRx: {$in: params.eRx.split(',')}};
        else if ("generic" in params) search = {generic: {$in: params.generic.split(',')}};
        else if ("gtn" in params) search = {gtn: {$in: params.gtn.split(',')}};
        else return res.status(500).json({massage: "parameter not found"});
        UpToDate.find(search).then(async drugs => {
            const interactions = [];
            const interactionList = [];
            drugs.forEach(obj => {
                interactions.forEach(item => {
                    item["interactions"].forEach(interaction => {
                        if (obj["interactions"].includes(interaction)) {
                            interaction = item["interactionHtmls"].find(o => o.id === interaction.split(', ')[2]);
                            const currentObj = {
                                // globalId: item.globalId + ', ' + obj.globalId,
                                interactionId: interaction.id,
                                subject: item.name,
                                object: obj.name,
                                riskRating: interaction.riskRating,
                                interactionHtml: interaction.text,
                            };
                            interactionList.push(currentObj)
                        }
                    })
                });
                interactions.push(obj)
            });
            return res.status(200).json({interactions: interactionList})
        });
    } catch (err) {
        return res.status(500).json({massage: err.message})
    }
};
exports.addUpToDate = async (req, res) => {
    try {
        const {id, name, globalId, eRx, interactions} = req.body;
        const newUpToDate = new UpToDate({id, name, globalId, eRx, interactions});
        newUpToDate.save().then(upToDate => {
            res.status(200).json({upToDate})
        }).catch(err => {
            res.status(400).json(err.message)
        })
    } catch (err) {
        res.status(400).json(err.message)
    }
};
exports.getMedScape = async (req, res, next) => {
    try {
        const params = query.parse(req.url, true).query;
        console.log(params);
        MedScape.findOne(params).then(interactions => {
            interactions = interactions.toObject().interactions;
            return res.status(200).json({interactions})
        }).catch(err => {
            res.status(500).json(err)
        })
    } catch (err) {
        next(err)
    }
};
exports.updateMedScape = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        const update = req.body;
        MedScape.findByIdAndUpdate(params.id, update).then(async () => {
            MedScape.findById(params.id).then(async result => {
                res.status(200).json(result)
            })
        }).catch(err => {
            res.status(500).json(err)
        })
    } catch (err) {

    }
};
exports.deleteMedScape = async (req, res, next) => {
    try {
        const medScapeId = req.params.id;
        MedScape.findByIdAndDelete(medScapeId).then(result => {
            if (result) result = null;
            else result = "ID Not Found!";
            res.status(200).json({
                data: result,
                message: 'MedScape has been deleted'
            });
        }).catch(error => {
            res.status(500).json(error.message)
        })
    } catch (err) {
        next(err)
    }
};

exports.name = async (req, res) => {
    try {
        UpToDate.aggregate([{
            "$group": {
                "_id": {
                    name: "$name",
                    globalId: "$globalId"
                }
            }
        }]).then(results => {
            const objs = [];
            for (const result of results) {
                objs.push(result._id)
            }
            res.status(200).json(objs)
        })
    }catch (err) {
        res.status(500).json(err.message)
    }
};
