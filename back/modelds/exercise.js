const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExerciseSchema = new Schema({
    exe_id: {
        type: Number,
        required: true,
    },
    exe_name: {
        type: String,
        required: true,
    },
    exe_type: {
        type: String,
        required: true,
    },
    exe_strong: {
        type: Number,
        required: true,
    },
    exe_set: {
        type: Number,
        required: true,
    },
    exe_count: {
        type: Number,
        required: true,
    }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
