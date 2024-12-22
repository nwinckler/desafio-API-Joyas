const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'joyas',
    port: 5432,
    allowExitOnIdle: true
});

// 1 a. Devuelva la estructura HATEOAS de todas las joyas almacenadas en la base de datos

const prepararHATEOAS = (joyas) => {
    const totalJoyas = joyas.length;
    let stockTotal = 0;
    let sumaStock = joyas.forEach( j =>{
        stockTotal += j.stock;
    })
    const results = joyas.map((j) =>{
        return{
            name: j.nombre,
            href: `/joyas/joya/${j.id}`,
        }
    }).slice(0,totalJoyas)
    
    const HATEOAS = {
        totalJoyas,
        stockTotal, 
        results
    }
    return HATEOAS
}

// 1 b. Reciba en la query string los parámetros limits, page y order_by

const obtenerJoyas = async({limits = 4, order_by = 'stock_ASC', page = 1}) =>{
    try {
        const [campo, direccion] = order_by.split("_");
        const offset = ((page - 1)*limits)
        
        //Validador Limits
        if (isNaN(limits) || limits <= 0){
            throw new Error("Limits invalido")
        }
        //Validador Order_by
        const ordenesValidas = ["ASC", "DESC"];
        if (!ordenesValidas.includes(direccion.toUpperCase())){
            throw new Error("Orden invalido")
        }

        //Consulta
        const consulta = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset)
        console.log(consulta)
        const {rows: joyas} = await pool.query(consulta)
        return joyas;
    } catch (error) {
        console.log(error)
        throw new Error("No se pudo obtener las joyas")
    }
}



// 5. Usar las consultas parametrizadas para evitar el SQL Injection en la consulta a la base de datos relacionada con la ruta GET /joyas/filtros

const obtenerJoyasFiltros = async({precio_max, precio_min, categoria, metal}) =>{
    try {
        let filtros = []
        let values = []
        
        const agregarFiltro = (campo, comparador, valor) =>{
            values.push(valor)
            filtros.push(`${campo} ${comparador} $${filtros.length + 1} `)
        }

        if (precio_max){
            agregarFiltro("precio", "<=", precio_max)
        }

        if (precio_min){
            agregarFiltro("precio", ">=", precio_min)
        }

        if (categoria){
            agregarFiltro("categoria", "=", categoria)
        }

        if (metal){
            agregarFiltro("metal", "=", metal)
        }

        let consulta = 'SELECT * FROM inventario';
        if (filtros.length > 0){
            consulta += ` WHERE ${filtros.join(" AND ")}`
        }
        console.log(consulta)

        let result = await pool.query(consulta, values)
        return result.rows
    } catch (error) {
        throw new Error("No se pudo hacer los filtros indicados")
    }
}

module.exports = {obtenerJoyas, obtenerJoyasFiltros, prepararHATEOAS}