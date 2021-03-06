const express = require('express');
const comments = require('../model/comment');
const articles = require('../model/article')
const views = require('../model/views')
const router = express.Router();
const generalTools = require('../tools/general-tools');
const fs = require('fs')
    // ALL ARTICLES
router.get('/', generalTools.loginChecker, (req, res) => {

        const query = req.query;

        let page = query.page;
        let size = query.size;

        if (!page) {
            page = 1;
        }
        if (!size) {
            size = 10;
        }
        let regexp = new RegExp(/\[0-9]/g);
        const limit = parseInt(size);
        const skip = (page - 1) * size;
        articles.find({}, (err, allArticles) => {
            if (err) return res.status(500).json({ msg: "Server Error :)", err: err.message })
            const pages = Math.ceil(allArticles.length / size)
            articles.find().populate('owner').limit(limit).skip(skip).sort({ createdAt: -1 }).exec((err, article) => {
                if (err) return res.status(500).json({ msg: "Server Error :)", err: err.message })
                if (article) return res.render('allArticles', { article: article, session: req.session.user, limit: limit, skip: skip, pages: pages, page: page })
            })
        })
    })
    // ARTICLES OF ONE BLOGGER
router.get('/myArticles/:id', generalTools.loginChecker, async(req, res) => {
        try {
            let page = req.query.page;
            let size = 10;

            if (!page) {
                page = 1;
            }
            const limit = parseInt(size);
            const skip = (page - 1) * size;
            const articlesLength = await articles.find({ owner: req.params.id });
            const article = await articles.find({ owner: req.params.id }).limit(limit).skip(skip).sort({ createdAt: -1 }).populate('owner')
            res.send({ article: article, length: articlesLength.length, page: page });

        } catch (err) {
            res.status(500).send('server error');
        }

    })
    // DETAILS OF ONE ARTICLE 
router.get('/article/:id', generalTools.loginChecker, (req, res) => {
    articles.findOne({ _id: req.params.id }).populate('owner', 'username').exec((err, article) => {
        if (err) return res.status(500).json({ msg: "Server Error :)", err: err.message })
        if (article) return res.send(article)

    })
})

// DETAILS OF ONE ARTICLE(WITH PAGE RENDERING)
router.get('/:id', generalTools.loginChecker, (req, res) => {;
    views.find({ article: req.params.id, viewer: req.session.user._id }, (err, view) => {
        if (err) return res.status(500).json({ msg: "Server Error :)", err: err.message })
        if (view.length === 0) {
            const newIp = new views({
                    viewer: req.session.user._id,
                    article: req.params.id
                }).save() //creat an ip if it's new
        }
        articles.findOne({ _id: req.params.id }).populate('owner', 'username').exec((err, article) => {
            if (err) return res.status(500).json({ msg: "Server Error :)", err: err.message })
            if (article) {
                comments.find({ article: req.params.id }).populate('owner').sort({ createdAt: -1 }).exec((err, comment) => {
                    if (err) return res.status(500).send('server error')
                    if (comment) {
                        views.find({ article: req.params.id }, (err, view) => {
                            if (err) return res.status(500).send('server error')
                            if (view) return res.status(200).render('article', { article: article, comments: comment, session: req.session, views: view })
                        })
                    }
                })
            }

        })
    })
})



// ADD NEW ARTICLE
router.post('/newArticle', generalTools.loginChecker, async(req, res) => {
    // if (!req.body.owner) return res.status(400).send('article must have an owner');
    const upload = generalTools.uploadArticle.single('avatar');
    upload(req, res, async(err) => {
        if (err) {
            res.status(500).send("server error")
        } else {
            if (req.file == undefined) {
                try {
                    let newArticle = new articles({
                        owner: req.session.user._id,
                        text: req.body.text,
                        title: req.body.title,
                        avatar: 'ArticleDefault.jpg'
                    })
                    newArticle = await newArticle.save()
                    if (newArticle) return res.send("New Article Created")
                } catch (err) {
                    if (err.stack.includes("Path `title` is required")) return res.status(400).send('title and text is required')
                    if (err.stack.includes("Path `text` is required")) return res.status(400).send('title and text is required')
                    if (err.stack.includes("is shorter than the minimum allowed length (3)")) return res.status(400).send(' title is shorter than the minimum allowed length (3)')
                    if (err.stack.includes("is shorter than the minimum allowed length (100)")) return res.status(400).send(' text minimum allowed length is (100)')
                    if (err.stack.includes("maximum allowed length")) return res.status(400).send(' text maximum allowed length is (100000)')
                }


            } else {

                try {
                    let newArticle = new articles({
                        owner: req.session.user._id,
                        text: req.body.text,
                        title: req.body.title,
                        avatar: req.file.filename
                    })
                    newArticle = await newArticle.save()
                    if (newArticle) return res.send("New Article Created")
                } catch (err) {
                    if (err.stack.includes("Path `title` is required")) return res.status(400).send('title is required')
                    if (err.stack.includes("Path `text` is required")) return res.status(400).send('text is required')
                    if (err.stack.includes("is shorter than the minimum allowed length (3)")) return res.status(400).send(' title is shorter than the minimum allowed length (3)')
                    if (err.stack.includes("is shorter than the minimum allowed length (100)")) return res.status(400).send(' text minimum allowed length is (100)')
                    if (err.stack.includes("maximum allowed length")) return res.status(400).send(' text maximum allowed length is (100000)')
                }
            }
        }



    })

})


//DELETE ARTICLE
router.get('/delete/:id', generalTools.loginChecker, async(req, res) => {
    if (req.session.user.role !== "admin") {
        articles.findOne({ _id: req.params.id, owner: req.session.user._id }, (err, article) => {
            if (err) return res.status(500).send('server error')
            if (!article) return res.status(403).send('acces denied!')
            articles.findByIdAndDelete({ _id: req.params.id }, (err) => {
                if (err) return res.status(500).send('server error')
                comments.remove({ article: req.params.id }, (err) => {
                    if (err) return res.status(500).send('server error')
                    return res.send('this article has been deleted!')
                })
            })
        })
    } else if (req.session.user.role === "admin") {
        articles.findByIdAndDelete(req.params.id, (err) => {
            if (err) return res.status(500).send('server error')
            comments.remove({ owner: req.params.id }, (err) => {
                if (err) return res.status(500).send('server error')
                return res.send('this article has been deleted!')
            })
        })
    }

})

//EDIT ARTICLE

//edit text and title of article
router.post('/article/:id', generalTools.loginChecker, (req, res) => {

    articles.findOne({ _id: req.params.id, owner: req.session.user._id }, (err, article) => {
        if (err) return res.status(500).send('server error')
        if (!article) return res.status(403).send('acces denied!')
        articles.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true }, (err, article) => {
            if (err) return res.status(500).send('server error')
            if (article) return res.send('article edited!')
        })
    })
})



//delete article avatar
router.delete('/deleteAvatar/:id', generalTools.loginChecker, (req, res) => {

    articles.findOne({ _id: req.params.id, owner: req.session.user._id }, (err, article) => {
        if (err) return res.status(500).send('server error')
        if (!article) return res.status(403).send('acces denied!')
        if (article.avatar === 'ArticleDefault.jpg') return res.status(400).send('this article don not have an avatar')
        fs.unlinkSync(`public/images/avatars/${article.avatar}`)
        articles.findByIdAndUpdate({ _id: req.params.id }, { avatar: 'ArticleDefault.jpg' }, { new: true }, (err, article) => {
            if (err) return res.status(500).send('server error')
            if (article) return res.send('avatar deleted!')
        })
    })
})



//add article avatar
router.post('/addAvatar/:id', generalTools.loginChecker, (req, res) => {

    articles.findOne({ _id: req.params.id, owner: req.session.user._id }, (err, article) => {
        if (err) return res.status(500).send('server error')
        if (!article) return res.status(403).send('acces denied!')
        const upload = generalTools.uploadAvatar.single('avatar');

        upload(req, res, (err) => {
            if (err) {
                res.status(500).send("server error")
            } else {
                if (req.file == undefined) {

                    res.status(400).send('No File Selected!')

                } else {

                    articles.findByIdAndUpdate(req.params.id, { avatar: req.file.filename }, { new: true }, (err, article) => {
                        if (err) return res.status(500).json({ msg: 'Server Error!' })
                        if (article) {
                            return res.send('avatar added')
                        }
                    });

                }
            }
        })

    })
})


module.exports = router;