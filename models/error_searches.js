const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create error searches schema and model
const ErrorSearchesSchema = new Schema({
    Keyword: {
        type: String,
        unique: true,
        required: [true, 'Keyword field is required']
    },
    Timestamp: {
        type: Date,
        required: [true, 'Timestamp field is required'],
        default: Date.now
    }
});

const ErrorSearches = mongoose.model('error_searches', ErrorSearchesSchema);

module.exports = ErrorSearches;
