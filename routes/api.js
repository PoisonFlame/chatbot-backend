const express = require('express');
const Product = require('../models/product');
const Search = require('../models/search')
const Log = require('../models/logs')
const ErrorSearch = require('../models/error_searches')
const router = express.Router();
const {spawn} = require('child_process');

// get a list of products from the db
router.get('/products', function(req, res, next){
    Product.find({}).then(function(product){
        res.send(product);
    });
});

// get a filtered list of products from the db
router.get('/products/:target', function(req, res, next){
    const name = req.params.target;
    console.log(name);
    Product.find({ "Name": new RegExp(name,'i')}).limit(20)
    .exec()
    .then(doc => {
        console.log("From database",new RegExp(name,'i'), doc);
        const response = {
            products : doc.map(product => {
                return {
                    product
                }
            }),
            total_products: doc.length,
            status: 'Success'
        };
        if(doc){
            console.log(response);
            Search.create({Search: name}).then(function(product){
                console.log("Added to search schema");
            });
            res.status(201).json(response);
        }else{
            res.status(404).json({message: 'Products not found', status:'Fail', total_products: 0});
        }
    });
});

router.get('/products/add/:target', function(req,res,next){
    const keyword = encodeURIComponent(req.params.target);
    const python = spawn('python3',['/app/scripts/scrape.py', '-k',keyword]);
    Search.create({Search: name}).then(function(product){
        console.log("Added to search schema");
    });
    res.send('Success');
});

// *****************ERROR LOG STUFF STARTS********************

// Need Add Search, Get Search, Remove Search.

router.get('/errors/searchlog', function(req, res, next){
    ErrorSearch.find({}).then(function(product){
        res.send(product);
    });
});

router.post('/errors/searchlog/add_search', function(req,res,next){
        ErrorSearch.create({Keyword: req.body.Keyword}).then(function(keyword){
            res.send(keyword);
        }).catch(next);
});

router.delete('/errors/searchlog/delete/:keyword', function(req, res, next){
    ErrorSearch.findByIdAndRemove({Keyword: encodeURIComponent(req.params.keyword)}).then(function(product){
        res.send(product);
    });
});

router.get('/log/', function(req, res, next){
    Log.find({}).then(function(product){
        res.send(product);
    });
});

router.post('/log/add_log', function(req,res,next){
    //{User: req.body.User, Status: req.body.Status, Message: req.body.Message, Duration: req.body.Duration, Component}
        Log.create(req.body).then(function(keyword){
            res.send(keyword);
        }).catch(next);
});

router.delete('/log/delete/:id', function(req, res, next){
    Log.findByIdAndRemove({_id: req.params.id}).then(function(product){
        res.send(product);
    });
});

router.get('/errors/runScrape/:target', function(req,res,next){
    const keyword = encodeURIComponent(req.params.target);
    const python = spawn('python3',['/app/scripts/scrape.py', '-k',keyword]);
    res.send('Success');
});

// *****************ERROR LOG STUFF ENDS***********************

// add a new product to the db
router.post('/products', function(req, res, next){
    Product.create(req.body).then(function(product){
        res.send(product);
    }).catch(next);
});

// update a product in the db
router.put('/products/:id', function(req, res, next){
    Product.findByIdAndUpdate({_id: req.params.id}, req.body).then(function(){
        // get the updated entry
        Product.findOne({_id: req.params.id}).then(function(product){
            res.send(product);
        });
    });
});

// delete a product from the db
router.delete('/products/:id', function(req, res, next){
    Product.findByIdAndRemove({_id: req.params.id}).then(function(product){
        res.send(product);
    });
});

module.exports = router;
