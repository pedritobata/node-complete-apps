//Este archivo será ejecutado por el CLIENTE y se encargará de interactuar
//con el DOM para hacer las llamadas AJAX!! y demás...

const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    //console.log(prodId, csrf);

    //closest es un metodo de la API del DOM
    const productElement = btn.closest('article');

    //ahora con fetch hacemos la peticion AJAX para borrar un producto
    //notar que el parametro csrf-token que necesita mi aplicacion para validar que la
    //vista que hizo la peticion sea la nuestra y no la de un hacker, debe ser enviado en los headers
    //ya que csurf busca ese parametro en el query param , en el body o al final en los headers!!
    fetch(`/admin/product/${prodId}`, {
        method: 'DELETE',
        headers: {"csrf-token": csrf}
    })
    .then(result => {
        return result.json();
    })
    .then(data => {
        console.log(data);
        productElement.parentNode.removeChild(productElement);
    })
    .catch(err=>{console.log(err)})
}