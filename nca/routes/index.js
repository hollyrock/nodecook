var express = require('express');
var router = express.Router();
var profiles = require('../profiles');

router.get('/', function(req, res) {
	res.render('index', { title: 'Profiles', profiles: profiles });
});

module.exports = router;
