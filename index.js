const express = require('express')
const app = express()
app.listen(3000, console.log('Servidor encendido'));

const {obtenerJoyasFiltros, obtenerJoyas, prepararHATEOAS} = require('./consultas')
const {reportarConsulta} = require('./reportes/reportes')

//1 b. Crear una ruta get /joyas que reciba en la query string los parametros limits, page, order_by

app.get('/joyas', reportarConsulta, async(req,res)=>{
    try {
        const joyas = await obtenerJoyas(req.query)
        const HATEOAS = await prepararHATEOAS(joyas)
        res.json(HATEOAS)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

// 2. Crear una ruta GET /joyas/filtros que reciba los siguientes parámetros en la query string: precio_max, precio_min, categoria, metal

app.get('/joyas/filtros', reportarConsulta, async(req,res) =>{
    try {
        const joyasFiltros = await obtenerJoyasFiltros(req.query)
        res.status(200).json(joyasFiltros)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

app.get("*", (req, res) =>{
    res.status(404).send("Esta ruta no existe")
})