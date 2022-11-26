//To Find all the topics and tasks which are taught in the month of October
db.classdetails.find(
    {
        $and: [
            { class_date: { $gt: ISODate("2021-10-01"), $lt: ISODate("2021-10-31") } }
        ],
    },
    { topic: 1, task_name: 1 }
);

// Company drives which appeared between 15-oct and 31 oct
db.companydrives.find(
    {
        $and: [
            { drive_date: { $gt: ISODate("2020-10-15"), $lt: ISODate("2020-10-31") } }
        ]
    }
)

// All the company drives and students who are appeared for the placement
db.companydrives.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "attended_by",
            foreignField: "answered_by",
            as: "results",
        },
    },
    { $match: { userid: 1 } },
    { $project: { results: 1, _id: 0 } },
    { $project: { countp: { $size: "$results" } } },
])

// To Find the number of problems solved by the user in codekata.
db.users.aggregate([
    {
        $lookup: {
            from: "codekata",
            localField: "userid",
            foreignField: "answered_by",
            as: "results",
        },
    },
    { $match: { userid: 1 } },
    { $project: { results: 1, _id: 0 } },
    { $project: { countp: { $size: "results" } } },
])

// To find all the mentors with who has the mentee's count more than 15
db.mentors.find({ $expr: { $gt: [{ $size: "$mentees" }, 15] } });

// To find the number of users who are absent and task is not submitted  between 15 oct - 2020 and 31 - oct - 2020
let result = db.classdetails.aggregate([
    {
        $match: {
            $and: [
                { class_date: { $gt: ISODate("2020-10-15"), $lt: ISODate("2020-10-31") } }
            ]
        }
    },
    {
        $projects: {
            allvalues: { $setUnion: ["$attended_by", "$submitted_by"] },
        }
    },
    { $project: { allvalues: 1, _id: 0 } },
    { $unwind: "$allvalues" },
    { $group: { _id: 0, allvalues: { $addToSet: "$allvalues" } } },
    { $projects: { allvalues: 1, _id: 0 } },
]);

let { allvalues } = result;
db.users.find({ userid: { $in: allvalues } }.count());