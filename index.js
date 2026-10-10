const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

const mongoURL = "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoURL);

const databaseName = "studentDB";

let studentsCollection;

app.use(express.json());


async function connectDatabase() {
  try {
    await client.connect();

    const database = client.db(databaseName);
    studentsCollection = database.collection("students");

    console.log("Connected to MongoDB");
    console.log(`Database: ${databaseName}`);
    console.log("Collection: students");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}


app.post("/students", async (request, response) => {
  try {
    const { name, email, age, department } = request.body;

    if (!name || !email || !age || !department) {
      return response.status(400).json({
        error: "name, email, age and department are required",
      });
    }

    const student = {
      name: name,
      email: email,
      age: Number(age),
      department: department,
    };

    const result = await studentsCollection.insertOne(student);

    response.status(201).json({
      message: "Student added successfully",
      studentId: result.insertedId,
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      error: "Failed to add student",
    });
  }
});


app.get("/students", async (request, response) => {
  try {
    const students = await studentsCollection.find({}).toArray();

    response.status(200).json(students);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      error: "Failed to get students",
    });
  }
});


app.get("/students/:id", async (request, response) => {
  try {
    const id = request.params.id;

    if (!ObjectId.isValid(id)) {
      return response.status(400).json({
        error: "Invalid student ID",
      });
    }

    const student = await studentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!student) {
      return response.status(404).json({
        error: "Student not found",
      });
    }

    response.status(200).json(student);
  } catch (error) {
    console.error(error);

    response.status(500).json({
      error: "Failed to get student",
    });
  }
});


connectDatabase()
  .then(() => {
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((error) => {
    console.error("Failed to start application:", error);
    process.exit(1);
  });
