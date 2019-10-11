const path = require('path');

//obtengo la ruta absoluta del modulo raiz de mi proyecto (el cual se crea cuando se ejecuta app.js)
module.exports = path.dirname(process.mainModule.filename);