var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/songs');
  //normalement t'aurais du implementer ic la logique pour afficher les chansons avec les meilleures notes et
  //les trois derniers utilisateurs
});

module.exports = router;
