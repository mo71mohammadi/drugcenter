const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
    drugStoreId: {},
    location:[
        {
            name: {type: String},
        }
    ]
});

module.exports = mongoose.model('storage', storageSchema);