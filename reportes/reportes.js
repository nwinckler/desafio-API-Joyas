const reportarConsulta = async(req, res, next) =>{
    const parametros = req.params
    const url = req.url
    console.log(`
        Hoy ${new Date()}
        Se ha recibido una consulta en la ruta ${url}
        `)
        next() 
}

module.exports = {reportarConsulta}