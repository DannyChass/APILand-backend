var express = require('express');
var router = express.Router();

require('../models/connexion');
const Api = require('../models/apis');
const { checkBody } = require('../modules/checkBody')

router.post('/', (req, res) => {
    console.log(req.body)
    if (!req.body || !req.body.name || req.body.name === '') {
        res.json({ result: false, error: 'missing compulsory field' });
    } else {
        Api.findOne({ name: req.body.name }).then(data => {
            if (data) {
                return res.json({ result: false, error: 'Api already exist' })
            } else {
                const newApi = new Api({
                    name: req.body.name,
                    image: req.body.image,
                    description: req.body.description,
                    officialLink: req.body.officialLink,
                    category: req.body.category,
                    documentationLink: req.body.documentationLink,
                })
                newApi.save().then((apiData) => {
                    return res.json({ result: true, apiData: apiData })
                })
            }
        })

    }
});

module.exports = router;