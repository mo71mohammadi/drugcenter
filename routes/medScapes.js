const MedScape = require("../models/medScape");
const query = require('url');


exports.interactionChecker = async (req, res) => {
    try {
        const params = query.parse(req.url, true).query;
        const search = {};
        if (params['item'] === 'eRx' || "generic" || "gtn") search[params['item']] = {$in: params['values'].split(',')};
        else return res.status(500).json({massage: "parameter not correct!"});
        // if ("eRx" in params) search = {eRx: {$in: params.eRx.split(',')}};
        // else if ("generic" in params) search = {generic: {$in: params.generic.split(',')}};
        // else if ("gtn" in params) search = {gtn: {$in: params.gtn.split(',')}};
        // else return res.status(500).json({massage: "parameter not found"});
        MedScape.find(search).then(async drugs => {
            const interactions = [];
            const interactionList = [];
            drugs.forEach(obj => {
                const objId = [];
                obj["interactions"].forEach(val => {
                    objId.push(val.id)
                });
                interactions.forEach(item => {
                    item["interactions"].forEach(interaction => {
                        if (objId.includes(interaction.id)) {
                            const currentObj = {
                                // ERXs: item.drugId + ', ' + obj.drugId,
                                id: interaction.id,
                                subject: interaction.subject,
                                object: interaction.object,
                                text: interaction.text,
                                severity: interaction.severity
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

exports.addMedScape = async (req, res) => {
    try {
        const {drugId, eRx, interactions} = req.body;
        const newMedScape = new MedScape({drugId, eRx, interactions});
        newMedScape.save().then(medScape => {
            res.status(200).json({medScape})
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
