const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create error log schema and model
const ErrorLogSchema = new Schema({
    Message: {
        type: String,
        required: [true, 'Message field is required']
    },
    Timestamp: {
        type: Date,
        required: [true, 'Timestamp field is required'],
        default: Date.now
    }
});

const ErrorLog = mongoose.model('error_log', ErrorLogSchema);

module.exports = ErrorLog;
