const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create product schema and model
const ProductSchema = new Schema({
    id: {
	type: String, 
	unique: true,
	required: [true, 'Id field is required']
    },
    Name: {
        type: String,
        required: [true, 'Name field is required']
    },
    Price: {
        type: String,
        required: [true, 'Price field is required']
    },
    Rating: {
        type: String,
        required: [true, 'Rating field is required']
    },
    Link: {
        type: String,
        required: [true, 'Link field is required']
    },
    ImgUrl: {
       type: String,
       required: [true, 'ImgUrl field is required']
    }
});

const Product = mongoose.model('product', ProductSchema);

module.exports = Product;
