const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const recommendSchema = new mongoose.Schema({
    atc: {
        L1: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        L2: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        L3: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        L4: {
            enName: {type: String},
            faName: {type: String},
            shortName: {type: String},
        },
        L5: {
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

module.exports = mongoose.model('recommend', recommendSchema);
