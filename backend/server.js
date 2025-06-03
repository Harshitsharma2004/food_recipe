const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/connectionDB');
const cors = require('cors')
const app = express();
const profileRoute = require('./routes/profile');

const themeRoutes = require('./routes/theme');

const otpRoutes = require('./routes/otpRoutes')

const PORT = process.env.PORT || 3000;
connectDB();
app.use(express.json())
app.use(cors())
app.use(express.static("public"))



app.use('/',require('./routes/user'))
app.use('/recipe',require('./routes/recipe'));
app.use('/profile', profileRoute);
app.use('/theme', themeRoutes);

app.use("/otp-verification", otpRoutes);

app.listen(PORT,(err)=>{
    console.log(`App is listening on ${PORT}`);
})