const express = require('express');
const users = require('../model/user')
const router = express.Router();
const generalTools = require('../tools/general-tools');
const joiSchema = require('../tools/joiValidator')

router.get('/', generalTools.sessionChecker, (req, res) => {
    res.render('register', { session: req.session.user })
})


//VALIDATE CLIENT DATA AND CREAT NEW USER
router.post('/', async function(req, res, next) {
    if (req.body.role == 'admin') return res.status(400).send('bad request :(')
    try {
        let validate = await joiSchema.register.validateAsync(req.body);
        const checkUser = await users.findOne({ username: req.body.username });
        if (checkUser) return res.status(400).send('user already exist!')
        if (validate) {
            let saveUser = new users(req.body)
            saveUser = await saveUser.save()
            if (saveUser) return res.send({ "msg": "success" })
        }

    } catch (err) {
        if (err.stack.includes('ValidationError')) return res.status(400).send(err.details[0].message);
        if (err) return res.status(500).send(err);
    }
});

module.exports = router;