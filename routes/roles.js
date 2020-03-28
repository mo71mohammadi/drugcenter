const AccessControl = require("accesscontrol");
const Role = require('../models/roleModel');


const getGrants = function () {
    let grantList = [];
    Role.find({}).then(async roless => {
        roless.forEach(role => {
            role.permissions.forEach(perms => {
                grantList.push({
                    role: role.role,
                    extend: role["extend"],
                    resource: perms.resource,
                    action: perms.action,
                    attributes: perms.attributes,
                })
            })
        });
        exports.roles = roles = new AccessControl(grantList)
    });
};

// getGrants();

exports.addRole = async (req, res, next) => {
    try {
        const {role, extend, permissions} = req.body;
        const newRole = new Role({role, extend, permissions});
        newRole.save().then(role => {
            res.status(200).json({role});
            // getGrants();
        }).catch(err => {
            res.status(400).json(err.message)
        });
    } catch (err) {
        next(err.message);
    }
};

exports.getRoles = async (req, res, next) => {
    const users = await Role.find({});
    res.status(200).json({
        data: users
    });
};

exports.getRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        Role.findById(roleId).then(role => {
            res.status(200).json({
                data: role
            });
        }).catch(err => {
            res.status(401).json({
                message: "Role does not exist"
            });
        });
    } catch (error) {
        next(error)
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const update = req.body;
        const roleId = req.params.roleId;
        Role.findByIdAndUpdate(roleId, update).then(async result => {
            const role = await Role.findById(roleId);
            res.status(200).json({
                success: true,
                message: 'Role has been updated'
            });
            getGrants();
        }).catch(error => {
            res.status(500).json(error.message)
        });
    } catch (error) {
        next(error)
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        const roleId = req.params.roleId;
        await Role.findByIdAndDelete(roleId);
        res.status(200).json({
            data: null,
            message: 'Role has been deleted'
        });
        getGrants();
    } catch (error) {
        next(error)
    }
};

