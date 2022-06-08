const express = require('express')
const mysql = require('promise-mysql')

const app = express()
const port = 3000

const getDb = async () => {
    let connection = {}
    try{
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'password',
            database: 'robot_stores'
        })
    }
    catch(err) {
        return null
    }
    return connection
}

const dbMiddleware = async (req, res, next) => {
    let connection = null
    try {
        connection = await getDb()
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error (none of your business)',
            data: null
        })
    }
    res.locals.connection = connection
    next()
}

app.use(dbMiddleware)
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/api/products', async (req, res) => {
    if(res.locals.connection === null) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error (none of your business)',
            data: null
        })
    } else {
        let whereString = ' WHERE 1=1'
        let arrayParams = []

        if(req.query.category){
            whereString += " AND `category` = ?"
            arrayParams.push(req.query.category)
        }

        if(req.query.character){
            whereString += " AND `character` = ?"
            arrayParams.push(req.query.character)
        }

        const products = await res.locals.connection.query("SELECT `id`, `title`, `image`, `price` FROM `products`" + whereString, arrayParams)

        res.status(200).json({
            "status": 200,
            "message": "Products retrieved successfully!",
            "data": products
        })
    }
})

app.get('/api/products/:id', async (req, res) => {
    if(res.locals.connection === null) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error (none of your business)',
            data: null
        })
    } else {
        const id = req.params.id
        const product = await res.locals.connection.query("SELECT * FROM `products` WHERE `id` = ?;", [id])
        if(product.id) {
            res.status(200).json({
                "status": 200,
                "message": "Products retrieved successfully!",
                "data": product
            })
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Invalid ID",
                "data": null
            })
        }
    }
})

app.post('/api/products', async (req, res) => {
    if(res.locals.connection === null) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error (none of your business)',
            data: null
        })
    } else {
        let query
        try {
            query = await res.locals.connection.query("INSERT INTO `products` (`title`, `price`, `image`, `category_id`, `category`, `character_id`, `character`, `description`, `image2`, `image3`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [req.body.title, req.body.price, req.body.image, req.body.category_id, req.body.category, req.body.character_id, req.body.character, req.body.description, req.body.image2, req.body.image3])
            console.log('this')
        } catch(err) {
            res.status(400).json({
                status: 400,
                message: err.sqlMessage,
                data: null
            })
        }
        if(query.affectedRows){
            res.status(200).json({
                status: 200,
                message: "Row added successfully",
                data: null
            })
        }
    }
})

app.put('/api/products/:id', async (req, res) => {
    if(res.locals.connection === null) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error (none of your business)',
            data: null
        })
    } else {
        const id = req.params.id
        let setString = ""
        let paramArray = []

        if (req.query.title) {
            setString += " `title` = ?"
            paramArray.push(req.query.title)
        }

        if (req.query.price) {
            if (setString.length > 0) {
                setString += ','
            }
            setString += " `price` = ?"
            paramArray.push(req.query.price)
        }

        if (req.query.description) {
            if (setString.length > 0) {
                setString += ','
            }
            setString += " `description` = ?"
            paramArray.push(req.query.description)
        }

        paramArray.push(id)

        const queryString = "UPDATE `products` SET" + setString + " WHERE `id`=?;"

        const query = await res.locals.connection.query(queryString, paramArray)
        if (query.affectedRows === 0) {
            res.status(400)
            res.json({
                "status": 400,
                "message": "Invalid ID",
                "data": null
            })
        } else {
            res.status(200)
            res.json({
                "status": 200,
                "message": "Row updated successfully",
                "data": null
            })
        }
    }
})

app.delete('/api/products/:id', async (req, res) => {
    if(res.locals.connection === null) {
        res.status(500).json({
            status: 500,
            message: 'Internal server error (none of your business)',
            data: null
        })
    } else {
        let query
        const id = req.params.id
        if(id)
        try {
            query = await res.locals.connection.query('DELETE FROM `products` WHERE `id`=?;', [id])
        } catch(err) {
            res.status(400).json({
                status: 400,
                message: err.sqlMessage,
                data: null
            })
        }
        if(query.affectedRows === 0) {
            res.status(400).json({
                status: 400,
                message: id + " is not a valid ID",
                data: null
            })
        } else {
            res.status(200).json({
                status: 200,
                message: "Row deleted successfully",
                data: null
            })
        }
    }
})

app.listen(port)
