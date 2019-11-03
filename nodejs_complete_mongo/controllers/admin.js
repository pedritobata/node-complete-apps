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
  Product.create({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description
  })
  .then(result=>{
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
  Product.findByPk(req.params.productId)
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
  //usamos findByPk() y luego dentro usamos save()
  Product.findByPk(prodId)
  .then(product=>{
    //estas asignaciones no actualizan la BD , solo el objeto product local!!
    product.title = title;
    product.imageUrl = imageUrl;
    product.price = price;
    product.description = description;
    //con el metodo save() de sequelize, él se encarga de actualizar la bd o crear un nuevo
    //product si este no existiera con el id especificado en findByPk()
    return product.save();
  })
  .then(result=>{
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
    //se puede usar tambien Product.destroy(where)
    //pero usaremos el findByPk y luego el destroy. parecido a lo que hicimos en postEditProduct
    Product.findByPk(productId)
    .then(product=>{
      return product.destroy();
    })
    .then(result=>{
      console.log("Product deleted!!");
      res.redirect('/admin/products'); 
    })
    .catch(err=>console.log(err));
    
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err=>console.log(err));
};
