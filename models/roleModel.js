const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const RoleSchema = new mongoose.Schema({
    role: {type: String, required: true, unique: true, trim: true},
    extend: [{type: String}],
    permissions: [{
        resource: {type: String, required: true},
        action: {type: String, required: true},
        attributes: {type: String, default: '*'},
    }],
});

RoleSchema.plugin(uniqueValidator);
const Role = mongoose.model('role', RoleSchema);
module.exports = Role;