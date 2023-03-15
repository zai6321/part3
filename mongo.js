const mongoose = require("mongoose");

const password = process.argv[2];
const name = process.argv[3];
const phone = process.argv[4];

const url = `mongodb+srv://zai5123b:${password}@cluster0.hssgleh.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
	name: String,
	phone: Number,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length <= 3) {
	Person.find({}).then((result) => {
		console.log("phonebook:");
		result.forEach((person) => {
			console.log(person.name, person.phone);
		});
		mongoose.connection.close();
		process.exit(1);
	});
}

const person = new Person({
	name: name,
	phone: phone,
});

if (name && phone) {
	person.save().then((result) => {
		console.log(`added ${name} phone ${phone} to phonebook`);
		mongoose.connection.close();
	});
}
