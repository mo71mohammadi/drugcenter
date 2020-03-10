const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const roles = require('./roles');

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.profile = async (req, res, next) => {
    if (req.body) {
        console.log(req.body);
        const { username, contact, name, email, role } = req.body;
        return res.json({ user: req.user })
    } else return res.json({ user: req.user })

};

exports.signUp = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ username, email, password: hashedPassword, active: false, role: role || "basic" });
        newUser.accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        newUser.save(async (err, user) => {
            if (err) {
                let message = "";
                if (err.errors.username) message = `${err.errors.username} `;
                if (err.errors.email) message += `${err.errors.email} `;
                if (err.errors.password) message += `${err.errors.password}`;
                message = message.trim();
                return res.json({
                    success: false,
                    message
                })
            } else {
                return res.json({
                    success: true,
                    message: "User registrations is successful."
                })
            }
        });
    } catch (error) {
        next(error)
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ username });
        // if (!user) user = await User.findOne({username});
        if (!user) return res.status(401).json({ message: 'Username does not exist' });
        if (!user.active) return res.status(401).json({ message: 'User not activated' });
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return res.status(500).json({ message: 'Password is not correct' });
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, { accessToken });
        res.status(200).json({
            data: { email: user.email, role: user.role },
            accessToken
        })
    } catch (error) {
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        User.find({}).then(results => {
            const users = []
            for (let result of results) {
                user = {
                    _id: result._id,
                    username: result.username,
                    email: result.email,
                    role: result.role,
                    active: result.active,
                }
                users.push(user)
            }
            res.status(200).json({ users });
        });
    } catch (err) {

    }
};

exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        User.findById(userId).then(user => {
            if (!user) res.status(200).json({ message: "User does not exist" });
            else res.status(200).json({ data: user });
        }).catch(err => {
            res.status(401).json({
                message: "User does not exist"
            });
        });
    } catch (error) {
        next(error)
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { username, email, password, active, role } = req.body;
        let update = {active: active}
        if (username) update.username = username;
        if (email) update.email = email;
        if (active == undefined) update.active = active
        if (role) update.role = role

        const userId = req.params.userId;
        if (password) {
            const hashedPassword = await hashPassword(password);
            update = {
                ...update,
                password: hashedPassword,
                accessToken: jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: "1d" })
            };
        }
        if (Object.keys(update).length == 0) return res.status(200).json({ message: "No items selected" })
        await User.findByIdAndUpdate(userId, update).then(() => {
            // User.findById(userId).then((response) => {
            //     response = response.toObject();
            //     delete response.password;
            //     delete response.accessToken;
            //     delete response.__v;

            // });
            res.status(200).json({
                // data: response,
                success: true,
                message: 'User has been updated'
            });
        }).catch(err => {
            return res.json({
                success: false,
                err
            })
        });
    } catch (error) {
        next(error)
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        User.findByIdAndDelete(userId).then((response) => {
            if (response) res.status(200).json({ message: 'User has been deleted' });
            else res.status(200).json({ message: 'User Not Found!' });
        });
    } catch (error) {
        next(error)
    }
};

exports.grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            const permission = roles.roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            }
            next()
        } catch (error) {
            next(error)
        }
    }
};

exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};