const express = require('express');
const Product = require('../models/product');
const Search = require('../models/search')
const Log = require('../models/logs')
const ErrorSearch = require('../models/error_searches')
const router = express.Router();
const {
    spawn
} = require('child_process');

// get a list of products from the db
router.get('/products', function (req, res, next) {
    Product.find({}).then(function (product) {
        res.send(product);
    });
});

// get a filtered list of products from the db
router.get('/products/:target', function (req, res, next) {
    const name = req.params.target;
    console.log(name);
    Product.find({
            "Name": new RegExp(name, 'i')
        }).limit(20)
        .exec()
        .then(doc => {
            console.log("From database", new RegExp(name, 'i'), doc);
            const response = {
                products: doc.map(product => {
                    return {
                        product
                    }
                }),
                total_products: doc.length,
                status: 'Success'
            };
            if (doc) {
                console.log(response);
                Search.create({
                    Search: name
                }).then(function (product) {
                    console.log("Added to search schema");
                });
                res.status(201).json(response);
            } else {
                res.status(404).json({
                    message: 'Products not found',
                    status: 'Fail',
                    total_products: 0
                });
            }
        });
});

router.get('/products/add/:target', function (req, res, next) {
    const keyword = encodeURIComponent(req.params.target);
    const python = spawn('python3', ['/app/scripts/scrape.py', '-k', keyword]);
    Search.create({
        Search: name
    }).then(function (product) {
        console.log("Added to search schema");
    });
    res.send('Success');
});

// *****************ERROR LOG STUFF STARTS********************

// Need Add Search, Get Search, Remove Search.

router.get('/errors/searchlog', function (req, res, next) {
    ErrorSearch.find({}).then(function (product) {
        res.send(product);
    });
});

router.post('/errors/searchlog/add_search', function (req, res, next) {
    ErrorSearch.create({
        Keyword: req.body.Keyword
    }).then(function (keyword) {
        res.send(keyword);
    }).catch(next);
});

router.delete('/errors/searchlog/delete/:keyword', function (req, res, next) {
    ErrorSearch.findByIdAndRemove({
        Keyword: encodeURIComponent(req.params.keyword)
    }).then(function (product) {
        res.send(product);
    });
});

router.get('/log/', function (req, res, next) {
    Log.find({}).then(function (product) {
        res.send(product);
    });
});

router.get('/log/filter/status/:sts', function (req, res, next) {
    if (req.params.sts.toLowerCase() === 'success' || req.params.sts.toLowerCase() === 'fail') {
        const val = req.params.sts.charAt(0).toUpperCase() + req.params.sts.slice(1)
        Log.find({
            Status: val
        }).then(function (logs) {
            res.send(logs);
        });
    } else {
        res.status(500).send({
            'Error': 'Status code not set to either success or fail. Found ' + req.params.sts
        });
    }
});


router.get('/log/filter/component/:cmp', function (req, res, next) {
    const val = req.params.cmp;
    Log.find({
        Component: val
    }).collation({
        locale: 'en',
        strength: 1
    }).then(function (logs) {
        if (logs.length === 0) {
            res.send({
                "Message": "No results found for component " + val
            });
        } else {
            res.send(logs);
        }
    });
});

router.get('/log/filter/component/:cmp/status/:sts', function (req, res, next) {
    const val = req.params.cmp;
    const sts_val = req.params.sts.charAt(0).toUpperCase() + req.params.sts.slice(1)
    if (req.params.sts.toLowerCase() === 'success' || req.params.sts.toLowerCase() === 'fail') {
        Log.find({
            Component: val,
            Status: sts_val
        }).collation({
            locale: 'en',
            strength: 1
        }).then(function (logs) {
            if (logs.length === 0) {
                res.send({
                    "Message": "No results found for component " + val
                });
            } else {
                res.send(logs);
            }
        });
    } else {
        res.status(500).send({
            'Error': 'Status code not set to either success or fail. Found ' + req.params.sts
        });
    }
});

router.get('/log/filter/error-codes/:msg', function (req, res, next) {
    const val = req.params.msg;
    Log.find({
        Additional_Info: new RegExp(val, 'i')
    }).collation({
        locale: 'en',
        strength: 1
    }).then(function (logs) {
        if (logs.length === 0) {
            res.send({
                "Message": "No results found for error code " + val
            });
        } else {
            res.send(logs);
        }
    });
});

router.post('/log/add_log', function (req, res, next) {
    Log.create(req.body).then(function (keyword) {
        res.send(keyword);
    }).catch(next);
});

router.delete('/log/delete/:id', function (req, res, next) {
    Log.findByIdAndRemove({
        _id: req.params.id
    }).then(function (product) {
        res.send(product);
    });
});

router.get('/errors/runScrape/:target', function (req, res, next) {
    const keyword = encodeURIComponent(req.params.target);
    const python = spawn('python3', ['/app/scripts/scrape.py', '-k', keyword]);
    res.send('Success');
});

// *****************ERROR LOG STUFF ENDS***********************

// add a new product to the db
router.post('/products', function (req, res, next) {
    Product.create(req.body).then(function (product) {
        res.send(product);
    }).catch(next);
});

// update a product in the db
router.put('/products/:id', function (req, res, next) {
    Product.findByIdAndUpdate({
        _id: req.params.id
    }, req.body).then(function () {
        // get the updated entry
        Product.findOne({
            _id: req.params.id
        }).then(function (product) {
            res.send(product);
        });
    });
});

// delete a product from the db
router.delete('/products/:id', function (req, res, next) {
    Product.findByIdAndRemove({
        _id: req.params.id
    }).then(function (product) {
        res.send(product);
    });
});

module.exports = router;