const Student = require("../models/Student");
const Class = require("../models/Class");
const AttendanceRecord = require("../models/AttendanceRecord");
const AttendanceSession = require("../models/AttendanceSession");
const FeeInvoice = require("../models/FeeInvoice");
const StudentMark = require("../models/StudentMark");
const ExamSubject = require("../models/ExamSubject");

const getAdminAnalytics = async (req, res) => {
    try {
        const institutionId = req.user.institutionId;

        /*
        ==========================================
        1. STUDENT ANALYTICS
        ==========================================
        */

        const studentAnalytics = await Student.aggregate([
            {
                $match: {
                    institutionId,
                    status: "active"
                }
            },
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "class"
                }
            },
            {
                $unwind: {
                    path: "$class",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$class._id",
                    className: {
                        $first: "$class.name"
                    },
                    section: {
                        $first: "$class.section"
                    },
                    studentCount: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    className: 1,
                    section: 1
                }
            }
        ]);

        const totalActiveStudents = await Student.countDocuments({
            institutionId,
            status: "active"
        });


        /*
        ==========================================
        2. ATTENDANCE ANALYTICS
        ==========================================
        */

        const attendanceAnalytics = await AttendanceRecord.aggregate([
            {
                $match: {
                    institutionId
                }
            },
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        let attendanceSummary = {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
        };

        attendanceAnalytics.forEach((item) => {
            attendanceSummary[item._id] = item.count;
            attendanceSummary.total += item.count;
        });

        const attendancePercentage =
            attendanceSummary.total > 0
                ? Number(
                      (
                          ((attendanceSummary.present +
                              attendanceSummary.late) /
                              attendanceSummary.total) *
                          100
                      ).toFixed(2)
                  )
                : 0;


        /*
        ==========================================
        3. FEE ANALYTICS
        ==========================================
        */

        const feeAnalytics = await FeeInvoice.aggregate([
            {
                $match: {
                    institutionId
                }
            },
            {
                $group: {
                    _id: null,

                    totalInvoices: {
                        $sum: 1
                    },

                    totalAmount: {
                        $sum: "$totalAmount"
                    },

                    paidAmount: {
                        $sum: "$paidAmount"
                    },

                    pendingAmount: {
                        $sum: {
                            $subtract: [
                                "$totalAmount",
                                "$paidAmount"
                            ]
                        }
                    }
                }
            }
        ]);

        const feeSummary = feeAnalytics[0] || {
            totalInvoices: 0,
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0
        };

        const collectionPercentage =
            feeSummary.totalAmount > 0
                ? Number(
                      (
                          (feeSummary.paidAmount /
                              feeSummary.totalAmount) *
                          100
                      ).toFixed(2)
                  )
                : 0;

        const overdueInvoices = await FeeInvoice.countDocuments({
            institutionId,
            status: "overdue"
        });


        /*
        ==========================================
        4. RESULT ANALYTICS
        ==========================================
        */

        const resultAnalytics = await StudentMark.aggregate([
            {
                $match: {
                    institutionId,
                    status: "present"
                }
            },
            {
                $lookup: {
                    from: "examsubjects",
                    localField: "examSubjectId",
                    foreignField: "_id",
                    as: "examSubject"
                }
            },
            {
                $unwind: "$examSubject"
            },
            {
                $group: {
                    _id: null,

                    totalMarks: {
                        $sum: "$marksObtained"
                    },

                    totalMaxMarks: {
                        $sum: "$examSubject.maxMarks"
                    },

                    averageMarks: {
                        $avg: "$marksObtained"
                    },

                    totalResults: {
                        $sum: 1
                    }
                }
            }
        ]);

        const resultSummary = resultAnalytics[0] || {
            totalMarks: 0,
            totalMaxMarks: 0,
            averageMarks: 0,
            totalResults: 0
        };

        const overallPercentage =
            resultSummary.totalMaxMarks > 0
                ? Number(
                      (
                          (resultSummary.totalMarks /
                              resultSummary.totalMaxMarks) *
                          100
                      ).toFixed(2)
                  )
                : 0;


        /*
        ==========================================
        FINAL RESPONSE
        ==========================================
        */

        res.status(200).json({
            success: true,

            data: {
                studentAnalytics: {
                    totalActiveStudents,
                    classWiseStudents: studentAnalytics
                },

                attendanceAnalytics: {
                    ...attendanceSummary,
                    attendancePercentage
                },

                feeAnalytics: {
                    totalInvoices: feeSummary.totalInvoices,
                    totalAmount: feeSummary.totalAmount,
                    paidAmount: feeSummary.paidAmount,
                    pendingAmount: feeSummary.pendingAmount,
                    overdueInvoices,
                    collectionPercentage
                },

                resultAnalytics: {
                    totalResults: resultSummary.totalResults,
                    totalMarks: resultSummary.totalMarks,
                    totalMaxMarks: resultSummary.totalMaxMarks,
                    averageMarks: Number(
                        resultSummary.averageMarks.toFixed(2)
                    ),
                    overallPercentage
                }
            }
        });

    } catch (error) {
        console.error("Admin analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch admin analytics"
        });
    }
};

module.exports = {
    getAdminAnalytics
};