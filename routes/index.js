var express = require("express");
var router = express.Router();

/*GET Home page */
router.get('/', function(req, res) {
  res.sendFile('index');
});

module.exports = router;
