//Ojo con la palabra "this" dentro de un Objeto
const person = {
    name : 'Perico',
    age: 44,
    //cuando declaro la funcion como un atributo y uso arrow function
    //la palabra this hará referencia al contexto global del archivo en el que estamos
    /*
    greet: () => {
        console.log('Hello, my name is ' + this.name);
    }
    */

    //se debe definir la funcion como function
    greet: function(){
        console.log('Hello, my name is ' + this.name);
    }  ,

    //o sino tambien se puede definir la funcion no como atributo
    greet2(){
        console.log('Hello, my name still is ' + this.name);
    }


};

person.greet();
person.greet2();


/**  SPREAD Y REST OPERATORS  */
//puedo clonar objetos o arreglos sin tocar los originales
const copiedPerson = {...person};
console.log(copiedPerson);
const originalArray = [1,2,3,4];
const copiedArray = [...originalArray];
copiedArray.push(5);
console.log(originalArray);
console.log(copiedArray);

//rest operator es para hacer lo contrario que el spread
const toArray = (...args) => {
    return args;//notar que args defrente es transformado a un Array!!
}

console.log(toArray(1,2,3,4,5,6));
