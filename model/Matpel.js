const mongoose = require('mongoose');

const matpelSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    }
})

module.exports = mongoose.model('Matpel', matpelSchema)