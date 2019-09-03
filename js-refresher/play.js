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