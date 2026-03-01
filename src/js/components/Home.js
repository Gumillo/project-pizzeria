/* global tns */

import {templates, select} from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.homeWidget();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.home.carousel);
  }

  initWidgets() {
    const thisHome = this;

    if(thisHome.dom.carousel && typeof tns === 'function') {
      tns({
        container: thisHome.dom.carousel,
        items: 1,
        slideBy: 'page',
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayButtonOutput: false,
        controls: false,
        nav: true,
        navPosition: 'bottom',
        mouseDrag: true,
        loop: true,
      });
    }
  }
}

export default Home;
