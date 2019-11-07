const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // con mongoose, el modelo ya no es una clase normal de JS
  //por lo tanto no usamos un cosntructor para generar la instancia
  //usamos un objeto con las propiedades
  const product = new Product({
    //toy usando el atajo de ES6
    title,
    price,
    description,
    imageUrl,
    userId : req.user //obtenemos el user completo del request y mongoose se encargará de
    //extraer solo el _id !!
  });
  product.save()//este metodo save es de mongoose , ya no lo tuvimos que especificar nosotros
  //ya que el modelo creado por mongoose ya tiene todo!!
  .then(result=>{//a pesar que parece que mongoose retorna una promesa, eso NO es asi
    //solo nos facilita metodos llamados igual que las promesas(then , catch)
    console.log("Product added successfully!!");
    res.redirect('/admin/products');
  })
  .catch(err=>{
    console.log(err);
  });
  
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect("/");
  }
  Product.findById(req.params.productId)
  .then(product=>{
      if(!product){
        res.redirect("/");
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '',
        editing: editMode,
        product: product
      });
    }
   )
  .catch(err=>console.log(err));
  
};

exports.postEditProduct = (req,res,next) => {
  const prodId = req.body.prodId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  //en mongoose, para actualizar, bsatará con obtener el producto usando mongoose
  //y este nos será devuelto junto con metodos magicos, No es un objeto normal de JS
  Product.findById(prodId)
  .then(product => {
    product.title = title;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl;
    return product.save();//zas!! metodo magico, save() tambien actualiza
    //pero porque le estamos definiendo los campos que han cambiado antes!!
  }).then(result=>{
    console.log('Updated product!!');
    //hacemos la redicreccion dentro de esta promise
    //guarda con la asincronia. Sino redireccionamos acá , 
    //no veriamos la actualizacion en la vista hasta que la recarguemos manualmente!!
    res.redirect('/admin/products');
  })

   
.catch(err=>console.log(err));
  
};

exports.postDeleteProduct = (req,res, next) => {
    const productId = req.body.productId;
    Product.findByIdAndDelete(productId)
    .then(result=>{
      res.redirect('/admin/products'); 
    })
    .catch(err=>console.log(err));
};


exports.getProducts = (req, res, next) => {
  Product.find()
  //opcionalmente , mongoose me da metodos para incluir o excluir info en el resultado
  //coloco los atributos separados por un espacio y los que quiero excluir los antecedo por "-"
  //select es para los datos de la coleccion principal
  //populate es para hacer join con otra coleccion

  //.select('title price -_id')
  //.populate('userId')//como segundo argumento puedo mandar lo mismo que con select para incluir o excluir campos
  //de la tabla que se hace el join
  //ojo que populate No devuelve una promesa , habria que llamar despues a execPopulate(), eso ya es promesa

  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err=>console.log(err));
};
 