const express = require('express');
const users = require('../model/user');
const articles = require('../model/article');
const comments = require('../model/comment');
const router = express.Router();
const generalTools = require('../tools/general-tools');
const bcrypt = require('bcrypt');
const JoiSchema = require('../tools/joiValidator')
const fs = require('fs')

//GET DASHBOARD PAGE
router.get('/', generalTools.loginChecker, (req, res) => {
    res.render('dashboard', { session: req.session.user })
});

//LOGOUT FUNCTION !
router.get('/logout', (req, res) => {
    res.clearCookie("user_sid");
    res.redirect('/api/login')

})

// *****USER CRUD*****
//ALL USERS FOR ADMIN
router.get('/getAll', generalTools.loginChecker, async(req, res) => {
    if (req.session.user.role !== 'admin') return res.status(403).send('acces denied!')
    try {
        let page = req.query.page;
        let size = 4;

        if (!page) {
            page = 1;
        }
        const limit = parseInt(size);
        const skip = (page - 1) * size;
        const usersLength = await users.find({ role: { $ne: 'admin' } });
        const allUsers = await users.find({ role: { $ne: 'admin' } }).limit(limit).skip(skip).sort({ createdAt: -1 }).populate('owner')
        res.send({ users: allUsers, usersLength: usersLength.length, page: page });

    } catch (err) {
        res.status(500).send('server error');
    }

})


//PROFILE EDIT
router.post('/edit', generalTools.loginChecker, async(req, res) => {
    if (req.body.role == 'admin') return res.status(400).send('bad request :(')
    try {
        if (req.session.user.username === req.body.username) {
            let validate = await JoiSchema.editDashboard.validateAsync(req.body);
            if (validate) {
                const Updated = await users.findOneAndUpdate({ username: req.body.username }, req.body, { new: true }).exec();
                res.clearCookie("user_sid");
                return res.send({ "msg": "success" })
            }
        }
        let validate = await JoiSchema.editDashboard.validateAsync(req.body);
        const checkUser = await users.findOne({ username: req.body.username });
        if (checkUser) return res.status(400).send('user already exist!')
        if (validate) {
            saveUser = await users.findOneAndUpdate({ username: req.session.user.username }, req.body, { new: true })
            res.clearCookie("user_sid");
            return res.send({ "msg": "success" })
        }
    } catch (err) {
        if (err.stack.includes('ValidationError')) return res.status(400).send(err.details[0].message);
        if (err) return res.status(500).send(err);
    }
})

//CHANGE PASSWORD
router.post('/password', generalTools.loginChecker, (req, res) => {
    if (!req.body.password) return res.status(400).send('old password input is empty')
    if (!req.body.new_password) return res.status(400).send('new password input is empty')
    if (req.session.user._id !== req.body._id) return res.status(403).send('acces denied!')

    users.findOne({ _id: req.body._id }, function(err, user) {
        if (err) return res.status(500).send({ "msg": "server error " })
        if (user) {
            bcrypt.compare(req.body.password, user.password, function(err, respoonse) {
                if (err) return res.status(500).send({ "msg": "server error " })
                if (respoonse) {
                    users.findOneAndUpdate({ _id: req.body._id }, { password: req.body.new_password }, { new: true }, function(err, user) {
                        if (err) return res.status(500).send({ "msg": "server error " })
                        res.clearCookie("user_sid");
                        if (user) res.send({ "msg": "sucsses" })
                    });
                } else {

                    return res.status(401).send('wrong password');
                }
                if (!user) return re.status(404).send("user not found")
            });
        }
    })
})


//RESET PASSWORD
router.get('/resetPassword/:id', (req, res) => {
    if (req.session.user.role !== "admin") return res.status(403).send('acces denied!')
    users.findOne({ _id: req.params.id }, (err, user) => {
        if (err) return res.status(500).send('server error')
        if (user) {
            users.findOneAndUpdate({ _id: user.id }, { password: user.mobile }, (err, user1) => {
                if (err) return res.status(500).send('server error')
                if (user1) return res.send(`password changed to ${user.mobile}`)
            })
        }
    })
})

//DELETE ACCOUNT
router.post('/delete', generalTools.loginChecker, async(req, res) => {
    if (req.session.user.username !== req.body.username) return res.status(403).send('acces denied!')
    if (!req.body.password) return res.status(400).send('password input is empty')
    users.findOne({ username: req.body.username }, (err, user) => {
        if (err) return res.status(500).send('server error')
        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, data) => {
                if (err) return res.status(500).send('server error :(')
                if (data) {
                    users.remove({ _id: user._id }, (err) => {
                        if (err) return res.status(500).send('server error :((')
                        articles.remove({ owner: req.params.id }, (err) => {
                            if (err) return res.status(500).send('server error')
                            comments.remove({ owner: req.params.id }, (err) => {
                                if (err) return res.status(500).send('server error')
                                res.clearCookie("user_sid");
                                res.send('deleted')
                            })
                        })
                    })
                } else if (!data) return res.status(400).send('wrong password')
            })
        } else if (!user) return res.status(400).send('user not found')
    })

})



//ADMIN DELETE USERS
router.get('/delete/:id', (req, res) => {
    if (req.session.user.role !== 'admin') return res.status(403).send('acces denied!')
    users.remove({ _id: req.params.id }, (err) => {
        if (err) return res.status(500).send('server error :((')
        articles.remove({ owner: req.params.id }, (err) => {
            if (err) return res.status(500).send('server error')
            comments.remove({ owner: req.params.id }, (err) => {
                if (err) return res.status(500).send('server error')
                res.send('deleted')
            })
        })
    })
})



//**UPLOAD AVATAR**/
router.post('/avatar', generalTools.loginChecker, (req, res) => {
    const upload = generalTools.uploadAvatar.single('avatar');

    upload(req, res, (err) => {
        if (err) {
            res.status(500).send(err)
        } else {
            if (req.file == undefined) {

                res.status(400).send('No File Selected!')

            } else {

                users.findByIdAndUpdate(req.session.user._id, { avatar: req.file.filename }, { new: true }, (err, user) => {
                    if (err) return res.status(500).json({ msg: 'Server Error!' })
                    if (user) {
                        req.session.user = user
                        return res.send('avatar added')
                    }
                });

            }
        }



    })
})



//DELETE AVATAR 
router.delete('/deleteAvatar', generalTools.loginChecker, (req, res) => {
    if (req.session.user.avatar == 'default.png') return res.status(400).send("You Don't Have An Avatar")
    users.findOneAndUpdate({ _id: req.session.user._id }, { avatar: 'default.png' }, { new: true }, (err, data) => {
        if (err) return res.status(500).send('server error')
        fs.unlinkSync(`public/images/avatars/${req.session.user.avatar}`)
        req.session.user = data
        if (data) return res.send('Avatar deleted')
    })
})





module.exports = router;