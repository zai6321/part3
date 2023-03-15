require("dotenv").config();
const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

const errorHandler = (error, request, response, next) => {
	console.log("errorHandler called");

	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	}

	next(error);
};

app.use(errorHandler);

// create custome message in the middleweare s
morgan.token("ob", function (req, res) {
	return `${JSON.stringify(req.body)}`;
});

app.use(morgan(":method :url :status :response-time :req[header] :ob"));

app.post("/api/persons", (request, response) => {
	const body = request.body;
	// console.log(body)

	if (!body.name) {
		return response.status(400).json({
			error: "name missing",
		});
	}

	if (!body.phone) {
		return response.status(400).json({
			error: "phone missing",
		});
	}

	///
	Person.find({}).then((persons) => {
		console.log("persons: ", persons);

		if (persons.some((person) => person.name === body.name)) {
			console.log("name must be unique");
			return response.status(400).json({
				error: "name must be unique",
			});
		}

		let person = new Person({
			name: body.name,
			phone: body.phone,
		});
		// id: generateId(),

		// save in mongod DV
		person.save().then((savedPerson) => {
			console.log("savedPerson", savedPerson);
			response.json(savedPerson);
		});
	});
});

app.get("/api/persons", (req, res) => {
	Person.find({}).then((persons) => {
		console.log("get/api/persons", persons);
		res.json(persons.map((person) => person.toJSON()));
	});

	// Person.find({}).then(result => {
	//     res.json(result)
	// })
});

app.get("/api/info", (req, res) => {
	const utcDate1 = new Date(Date.now());
	let personsLength = 0;
	Person.find({}).then((persons) => {
		personsLength = persons.length;
		res.send(
			`<p> Phonebook has info for ${personsLength} people </p> <p> ${utcDate1.toUTCString()}</p>`
		);
	});
});

app.get("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	Person.findById(req.params.id)
		.then((person) => {
			res.json(person);
		})
		.catch((error) => res.status(404).end());
});

app.delete("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	console.log(id, typeof id);

	// persons = persons.filter(person => person.id != id)
	// res.status(204).end()
	Person.findByIdAndRemove(id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
	const body = request.body;
	const person = {
		number: body.number,
	};

	Person.findByIdAndUpdate(request.params.id, person, { new: true })
		.then((updatedPerson) => {
			response.json(updatedPerson);
		})
		.catch((error) => next(error));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
