import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initMenu: function(){
    const thisApp = this;

    console.log('thisApp.data:', thisApp.data);

    for(let productData of thisApp.data.products){
      new Product(productData.id, productData);
    }

    // Listen for add-to-cart event
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initData: function(){
    const thisApp = this;

    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data = {};
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function() {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
