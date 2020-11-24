const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create keyword schema and model
const SearchesSchema = new Schema({
    Search: {
        type: String,
        required: [true, 'Search field is required']
    },
    TimeOfSearch: {
        type: Date,
        required: [true, 'TimeOfSearch field is required'],
        default: Date.now
    }
});

const Search = mongoose.model('searches', SearchesSchema);

module.exports = Search;