const mongoose = require('mongoose');

const recommendSchema = new mongoose.Schema({
    // group: {type: String},
    // interaction: {
    //     medScape: {
    //         id: {type: String, required: false},
    //         name: {type: String, required: false},
    //     },
    //     upToDate: {
    //         id: {type: String, required: false},
    //         name: {type: String, required: false},
    //         golobal: {type: String, required: false},
    //     },
    // },
    atc: {
        levelOne: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        levelTwo: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        levelThree: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        levelFour: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        levelFive: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        ddd: [{
            admRoute: {type: String},
            dose: {type: String},
            unit: {type: String}
        }],
    },
    special: {
        specialId: {type: Number},
        name: {type: String},
    }
});

module.exports = mongoose.model('recommends', recommendSchema);
