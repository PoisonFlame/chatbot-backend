const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create error log schema and model
const LogSchema = new Schema({
    User: {
        type: String,
        requred: [true, 'User field is required']
    },
    Status : {
        type: String,
        required: [true, 'Status field is required']
    },
    Message: {
        type: String,
        required: [true, 'Message field is required']
    },
    Duration: {
        type: String,
        required: [true, 'Duration field is required']
    },
    Timestamp: {
        type: Date,
        required: [true, 'Timestamp field is required'],
        default: Date.now
    },
    Component: {
        type: String,
        required: [true, 'Component field is required']
    },
    Additional_Info: {
        type: String
    }
});

const Log = mongoose.model('logs', LogSchema);

module.exports = Log;
