const express = require("express");
const router = express.Router();
const Recommend = require("../models/recommend");

// Creating ATC
router.post('/atc/create', async (req, res) => {
    const atc = new Recommend({
        group: "atc",
        atc: {
            levelOne: req.body.levelOne,
            levelTwo: req.body.levelTwo,
            levelThree: req.body.levelThree,
            levelFour: req.body.levelFour,
            levelFive: req.body.levelFive,
            ddd: req.body.ddd,
        }
    });
    if (req.body.levelOne != null) {
        Recommend.find({group: "atc", "atc.levelOne.shortName": {$ne: null}}).then(async recommend => {
            console.log(recommend.length)
            try {
                atc.atc.levelOne.id = recommend.length + 1;
                if (req.body.levelOne.shortName != null && req.body.levelOne.name != null) {
                    const newatc = await atc.save();
                    res.json(newatc)
                } else {
                    res.json({message: "name and shortName is required"})
                }
            } catch (err) {
                res.status(500).json({massage: err.message})
            }
        });
    } else if (req.body.levelTwo != null) {
        Recommend.find({group: "atc", "atc.levelTwo.shortName": {$ne: null}}).then(async recommend => {
            const count = recommend.length;
            try {
                atc.atc.levelTwo.id = count + 1;
                if (req.body.levelTwo.shortName != null && req.body.levelTwo.name != null && req.body.levelTwo.levelOneId != null) {
                    const newatc = await atc.save();
                    res.json(newatc)
                } else {
                    res.json({message: "name and shortName and levelOneId is required"})
                }
            } catch (err) {
                res.status(500).json({massage: err.message})
            }
        });

    } else if (req.body.levelThree != null) {
        Recommend.find({group: "atc", "atc.levelThree.shortName": {$ne: null}}).then(async recommend => {
            try {
                atc.atc.levelThree.id = recommend.length + 1;
                if (req.body.levelThree.shortName != null && req.body.levelThree.name != null && req.body.levelThree.levelTwoId != null) {
                    const newatc = await atc.save();
                    res.json(newatc)
                } else {
                    res.json({message: "name and shortName and levelTwoId is required"})
                }
            } catch (err) {
                res.status(500).json({massage: err.message})
            }
        });

    } else if (req.body.levelFour != null) {
        Recommend.find({group: "atc", "atc.levelFour.shortName": {$ne: null}}).then(async recommend => {
            const count = recommend.length;
            try {
                atc.atc.levelFour.id = count + 1;
                if (req.body.levelFour.shortName != null && req.body.levelFour.name != null && req.body.levelFour.levelThreeId != null) {
                    const newatc = await atc.save();
                    res.json(newatc)
                } else {
                    res.json({message: "name and shortName and levelThreeId is required"})
                }
            } catch (err) {
                res.status(500).json({massage: err.message})
            }
        });

    } else if (req.body.levelFive != null) {
        Recommend.find({group: "atc", "atc.levelFive.shortName": {$ne: null}}).then(async recommend => {
            const count = recommend.length;
            try {
                atc.atc.levelFive.id = count + 1;
                if (req.body.levelFive.shortName != null && req.body.levelFive.name != null && req.body.levelFive.levelFourId != null) {
                    const newatc = await atc.save();
                    res.json(newatc)
                } else {
                    res.json({message: "name and shortName and levelFourId is required"})
                }
            } catch (err) {
                res.status(500).json({massage: err.message})
            }
        });

    } else if (req.body.ddd != null) {
        Recommend.find({group: "atc", "atc.ddd.admRoute": {$ne: null}}).then(async recommend => {
            try {
                atc.atc.ddd.id = recommend.length + 1;
                if (req.body.ddd.dose != null && req.body.ddd.admRoute != null && req.body.ddd.levelFiveId != null) {
                    const newatc = await atc.save();
                    res.json(newatc)
                } else {
                    res.json({message: "admRoute and dose and levelFiveId is required"})
                }
            } catch (err) {
                res.status(500).json({massage: err.message})
            }
        });

    } else {
        try {
            res.json({message: "Please fill in the required fields"})
        } catch (err) {
            res.status(500).json({massage: err.message})
        }
    }

});

// Getting ATC Level One
router.post("/atc/get", async (req, res) => {
    try {
        let page;
        let size;
        if (req.body.page < 0) page = 0;
        else if (!req.body.page) page = 0;
        else page = req.body.page;
        if (req.body.size < 1) size = 1;
        else if (!req.body.size) size = 1;
        else size = req.body.size;
        const filter = {...req.body};
        delete filter.page;
        delete filter.size;
        delete filter.level;
        let search = {};

        for (let item in filter) {
            if (filter[item]) search['atc.' + req.body.level + '.' + item] = filter[item]
        }
        let level = {};
        if (req.body.level === 'levelOne') {
            level = {group: "atc", "atc.levelOne.shortName": {$ne: null}};
        }
        if (req.body.level === 'levelTwo') {
            let relation;
            if (req.body.levelOneId) relation = req.body.levelOneId;
            else relation = {$ne: null};
            level = {group: "atc", "atc.levelTwo.levelOneId": relation}
        }
        if (req.body.level === 'levelThree') {
            let relation;
            if (req.body.levelTwoId) relation = req.body.levelTwoId;
            else relation = {$ne: null};
            level = {group: "atc", "atc.levelThree.levelTwoId": relation}
        }
        if (req.body.level === 'levelFour') {
            let relation;
            if (req.body.levelThreeId) relation = req.body.levelThreeId;
            else relation = {$ne: null};
            level = {group: "atc", "atc.levelFour.levelThreeId": relation}
        }
        if (req.body.level === 'levelFive') {
            let relation;
            if (req.body.levelFourId) relation = req.body.levelFourId;
            else relation = {$ne: null};
            level = {group: "atc", "atc.levelFive.levelFourId": relation}
        }
        if (req.body.level === 'ddd') {
            let relation;
            if (req.body.levelFiveId) relation = req.body.levelFiveId;
            else relation = {$ne: null};
            level = {group: "atc", "atc.ddd.levelFiveId": relation}
        }
        console.log({...search, ...level});
        Recommend.find({...search, ...level}).skip(size * page).limit(size).then(async recommend => {
            const count = await Recommend.countDocuments({...search, ...level});
            const newList = [];
            for (let item in recommend) {
                let obj = recommend[item].atc[req.body.level].toObject();
                obj['_id'] = recommend[item]['_id'];
                newList.push(obj)
            }
            res.status(200).json({count: count, data: newList})
        });
    } catch (err) {
        res.status(500).json({massage: err.message})
    }
});


router.post("/atc/delete", async (req, res) => {
    try {
        Recommend.findById(req.body.id).then(async recommend => {
            await recommend.remove();
            res.json({message: "product Delete Successfully"})
        }).catch(error => {
            res.status(401).json({message: "Product ID Not Found"})
        });
    }catch (err) {
        res.status(500).json({massage: err.message})
    }

});
// Getting UpToDate Interaction
router.post("/interact/upToDate", async (req, res) => {
    try {
        Recommend.find({group: "Interaction", "interaction.upToDate": {$ne: null}}).then(async UpToDate => {
            const newList = [];
            for (let item in UpToDate) {
                newList.push(UpToDate[item].interaction.upToDate)
            }
            res.json(newList)
        });
    } catch (err) {
        res.status(500).json({massage: err.message})

    }
});

// Getting medScape Interaction
router.post("/interact/medScape", async (req, res) => {
    try {
        Recommend.find({group: "Interaction", "interaction.medScape": {$ne: null}}).then(async medScape => {
            const newList = [];
            for (let item in medScape) {
                newList.push(medScape[item].interaction.medScape)
            }
            res.json(newList)
        });
    } catch (err) {
        res.status(500).json({massage: err.message})

    }
});

// Getting medScape Interaction
router.get("/insurance/special", async (req, res) => {
    try {
        Recommend.find({
            group: "special",
            "special.specialId": {$ne: null}
        }).sort({"special.specialId": 1}).then(async special => {
            const newList = [];
            for (let item in special) {
                if ((special[item].special.name)) {
                    console.log(special[item].special);
                    newList.push(special[item].special.specialId)
                }
                // if ((special[item].special.name).search('فلوشيپ')!=-1){
                //     console.log(special[item].special);
                //     newList.push(special[item].special.specialId)
                // }
                // newList.push(special[item].special)
            }
            res.json(newList)
        });
    } catch (err) {
        res.status(500).json({massage: err.message})
    }
});

module.exports = router;