const mongoose = require('mongoose');

const { Schema } = mongoose;

const DesignSchema = new Schema({
    skin_name: {
        type: String,
        required: true,
    },
    skin_price: {
        type: Number,
        required: true,
    }
});


module.exports = mongoose.model('Design', DesignSchema);
