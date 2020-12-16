const express = require("express")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const bcrypt = require("bcrypt")
const path = require("path")

const router = express.Router()

router.post("/signup", async (req, res) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(422).send({ error: "Must provide username and password" })
	}

	const user = {
		username,
		password: bcrypt.hashSync(password, 10),
		likes: 10,
	}

	try {
		const { data, fileName } = readFile()

		data.push(user)

		fs.writeFileSync(fileName, JSON.stringify(data))

		const token = jwt.sign({ username, likes: user.likes }, "MY_SECRET_KEY")

		res.send({ token, data })
	} catch (err) {
		console.log(err)
		return res.status(422).send(err.message)
	}
})

router.post("/signin", async (req, res) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(422).send({ error: "Must provide username and password" })
	}

	try {
		const { data, fileName } = readFile()

		const user = data.find((user) => user.username === username)

		const verifyPassword = bcrypt.compareSync(password, user.password)

		if (!user || !verifyPassword) {
			return res.status(422).send({ error: "Invalid password or username" })
		}

		const token = jwt.sign({ username, likes: user.likes }, "MY_SECRET_KEY")

		res.send({ token, data })
	} catch (err) {
		return res.status(422).send(err.message)
	}
})

const readFile = () => {
	const filePath = path.join(__dirname, "../../")
	const fileName = `${filePath}users.json`
	let data = fs.readFileSync(fileName, "utf8")
	return { data: JSON.parse(data), fileName }
}

module.exports = router
