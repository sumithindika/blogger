const mongoose =require('mongoose');
const config = require('config');
const db = config.get('mongoURI');


const connectDB = async ()=>{
try {
    //db connect
await mongoose.connect(db, {
useNewUrlParser: true,
//useCreateIndex:true

});
console.log('MongoDB connected ....');

} catch (err) {
    console.error(err.message);
    //exit process failure..
    process.exit(1);
}

}
module.exports = connectDB;