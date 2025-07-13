import mongoose from 'mongoose';

//function to connect to the mongo db database

export const connectDB = async () => {

    try{
        mongoose.connection.on('connected', () => console.log('database connected successfully')
    )
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app` )

    }catch (error){
        console.log('Error connecting to the database:', error);

    }


}