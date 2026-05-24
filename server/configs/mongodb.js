import mongoose from "mongoose";

//connect to the Mongodb

const connectDB = async() => {
    mongoose.connection.on('connected', ()=> console.log('Database Connected'))

    await mongoose.connect(`${process.env.MONGO_URI}/lms`)

}

export default connectDB