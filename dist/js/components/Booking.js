import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    /* create empty object thisBooking.dom */
    thisBooking.dom = {};

    /* add wrapper property to dom object */
    thisBooking.dom.wrapper = element;

    /* change innerHTML of wrapper to generated HTML */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    /* find and save references to peopleAmount and hoursAmount */
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    /* create new instances of AmountWidget */
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    /* add event listeners (empty callbacks for now) */
    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      // Empty callback for now
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
      // Empty callback for now
    });
  }
}

export default Booking;
