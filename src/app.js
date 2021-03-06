const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(authRoutes)

app.get("/getSeedData", (req, res) => {
	let users = fs.readFileSync("users.json", "utf-8")
	users = JSON.parse(users)

	res.send(
		users.map((user) => ({ username: user.username, likes: user.likes }))
	)
})

app.post("/like", (req, res) => {
	const { authorization } = req.headers

	if (!authorization) {
		return res.status(401).send({ error: "You must be logged in." })
	}

	const token = authorization.replace("Bearer ", "")

	jwt.verify(token, "MY_SECRET_KEY", async (err, payload) => {
		if (err) {
			return res.status(401).send({ error: "You must be logged in." })
		}

		const { username } = payload

		let data = fs.readFileSync("users.json", "utf8")
		data = JSON.parse(data)

		const user = data.find((user) => user.username === username)

		if (user) {
			data = data.filter((user) => user.username !== username)

			user.likes++

			data.push(user)

			fs.writeFileSync("users.json", JSON.stringify(data))

			res.send({ data, user })
		} else {
			console.log(err)
			res.status(422).send({ error: "User not found" })
		}
	})
})

module.exports = app