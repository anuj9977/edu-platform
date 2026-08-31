const express=require('express');
const cors=require('cors');
require('dotenv').config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");
const classRoutes = require("./routes/classRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes.js");
const parentRoutes = require("./routes/parentRoutes.js"); 
const subjectRoutes = require("./routes/subjectRoutes.js");  
const classSubjectRoutes = require("./routes/classSubjectRoutes");
const examRoutes = require("./routes/examRoutes");
const markRoutes = require("./routes/markRoutes");
const resultRoutes = require("./routes/resultRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const feeRoutes = require("./routes/feeRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const notificationRoutes =
    require("./routes/notificationRoutes");
const app=express();

//connect to database
connectDB();

//middlewares
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/exams", examRoutes);
app.use(
    "/api/marks",
    markRoutes
);
app.use(
    "/api/class-subjects",
    classSubjectRoutes

);
// Add the dashboard routes
app.use(
    "/api/dashboard",
    dashboardRoutes
);
// Add the result routes
app.use("/api/results", resultRoutes);

// Add the fee routes
app.use("/api/fees", feeRoutes);

//Test route
app.get('/',(req,res)=>{
    res.send('API is running...');
}
);

// Add the attendance routes
app.use(
    "/api/attendance",
    attendanceRoutes
);
// Add the announcement routes
app.use(
    "/api/announcements",
    announcementRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);


const port=process.env.PORT || 5000;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});