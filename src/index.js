const bcrypt = require("bcrypt")
const fs = require("fs")
const faker = require("faker")

const app = require("./app")

const seedUserData = () => {
	const users = []

	for (let i = 0; i < 10; i++) {
		users.push({
			username: faker.name.firstName(),
			likes: faker.random.number({ min: 5, max: 20 }),
			password: bcrypt.hashSync("redredred", 10),
		})
	}

	fs.writeFileSync("users.json", JSON.stringify(users))
}

const port = process.env.PORT || 3001
app.listen(port, () => {
	console.log(`Server is up and running on port ${port}`)
	seedUserData()
})
