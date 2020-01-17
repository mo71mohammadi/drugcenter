const mongoose = require('mongoose');

const recommendSchema = new mongoose.Schema({
    group: {type: String},
    interaction: {
        medScape: {
            id: {type: String, required: false},
            name: {type: String, required: false},
        },
        upToDate: {
            id: {type: String, required: false},
            name: {type: String, required: false},
            golobal: {type: String, required: false},
        },
    },
    atc: {
        levelOne: {
            id: {},
            name: {},
            shortName: {},
        },
        levelTwo: {
            id: {},
            levelOneId: {},
            name: {},
            shortName: {},
        },
        levelThree: {
            id: {},
            levelTwoId: {},
            name: {},
            shortName: {},
        },
        levelFour: {
            id: {},
            levelThreeId: {},
            name: {},
            shortName: {},
        },
        levelFive: {
            id: {},
            levelFourId: {},
            name: {},
            shortName: {},
        },
        ddd: {
            id: {},
            levelFiveId: {},
            admRoute: {},
            dose: {},
            unit: {}
        },
    },
    special: {
        specialId: {type: Number},
        name: {type: String},
    }
});

module.exports = mongoose.model('recommends', recommendSchema);
