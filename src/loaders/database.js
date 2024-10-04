import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URL)
            .then(() => console.log('Database Connected!'));
        mongoose.set('debug', true)
    } catch (error) {
        console.log("error in database connection");
    }
}
export default connectToDatabase;


