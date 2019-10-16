//const products = [];

const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename),'data','products.json');

const getProductsFromFile = callback => {
    //recordar QUE ESTE METODO SE EJECUTA ASINCRONAMENTE!!!!
    //por eso el que reciba el resultado de la lectura del archivo recibirá undefined!!
    //la solucion es que nos pasen un callback!!
    fs.readFile(p, (err, fileContent)=>{
        if(err){
            calback([]);
        }
        callback(JSON.parse(fileContent));
    });
}

module.exports = class Product{
    constructor(title){
        this.title = title;
    }

    save(){
        //products.push(this);
        //usando files para guardar la data

        getProductsFromFile(products =>{
            products.push(this);
            fs.writeFile(p, JSON.stringify(products), err=>{
                console.log(err);
            });
        });
        
        
    }

    static fetchAll(callback){
        getProductsFromFile(callback);
    }
}