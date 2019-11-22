//Este archivo será ejecutado por el CLIENTE y se encargará de interactuar
//con el DOM para hacer las llamadas AJAX!! y demás...

const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    console.log(prodId, csrf);
}