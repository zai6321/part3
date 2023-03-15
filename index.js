require("dotenv").config();
const express = require("express");
const app = express();
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

morgan.token("ob", function (req, res) {
	return `${JSON.stringify(req.body)}`;
});
app.use(morgan(":method :url :status :response-time :req[header] :ob"));
const errorHandler = (error, request, response, next) => {
	console.log("errorHandler called");
	console.log(error.message, "test");
	if (error.name === "CastError") {
		return response.status(400).send({ error: "malformatted id" });
	} else if (error.name === "ValidationError") {
		return response.status(400).json({ error: error.message });
	}
	next(error);
};

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: "unknown endpoint" });
};
app.use(cors());
app.use(express.json());
app.use(express.static("build"));

app.post("/api/persons", (request, response, next) => {
	const body = request.body;
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
		person
			.save()
			.then((savedPerson) => {
				console.log("savedPerson", savedPerson);
				response.json(savedPerson);
			})
			.catch((error) => next(error));
	});
});

app.get("/api/persons", (req, res) => {
	Person.find({}).then((persons) => {
		// console.log("get/api/persons", persons);
		res.json(persons.map((person) => person.toJSON()));
	});
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
		.catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
	const id = req.params.id;
	console.log(id, typeof id);
	Person.findByIdAndRemove(id)
		.then((result) => {
			res.status(204).end();
		})
		.catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
	const body = request.body;
	const person = {
		phone: body.phone,
	};
	Person.findByIdAndUpdate(request.params.id, person, {
		new: true,
		runValidators: true,
		context: "query",
	})
		.then((updatedPerson) => {
			response.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.use(errorHandler);
app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});
