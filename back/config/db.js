
const mongoose = require('mongoose');
const dbURI = "mongodb+srv://dkgus731:EoGg1VgJJVne65N6@fitnessheroes.f24j2.mongodb.net/?retryWrites=true&w=majority&appName=FitnessHeroes";

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;