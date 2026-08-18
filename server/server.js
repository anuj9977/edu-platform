const express=require('express');
const cors=require('cors');
require('dotenv').config();
const connectDB = require("./config/db");

const app=express();

//connect to database
connectDB();

//middlewares
app.use(cors());
app.use(express.json());

//Test route
app.get('/',(req,res)=>{
    res.send('API is running...');
}
);
const port=process.env.PORT || 5000;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});