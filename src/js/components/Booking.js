/* global utils */

import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.booked = {};
    thisBooking.selectedTable = null;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
  }

  initWidgets() {
    const thisBooking = this;

    /* create new instances of AmountWidget */
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event) {
      const clickedElement = event.target.closest(select.booking.tables);

      if(!clickedElement) {
        return;
      }

      if(clickedElement.classList.contains(classNames.booking.tableBooked)) {
        return;
      }

      if(clickedElement.classList.contains(classNames.booking.tableSelected)) {
        clickedElement.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedTable = null;
        return;
      }

      for(let table of thisBooking.dom.tables) {
        table.classList.remove(classNames.booking.tableSelected);
      }

      clickedElement.classList.add(classNames.booking.tableSelected);
      thisBooking.selectedTable = parseInt(clickedElement.getAttribute(settings.booking.tableIdAttribute));
    });

    thisBooking.dom.peopleAmount.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }

  getData() {
    const thisBooking = this;

    const startDateParam = {};
    const endDateParam = {};

    startDateParam[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    endDateParam[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = Object.assign({}, startDateParam, endDateParam);

    const bookingsUrl = settings.db.url + '/' + settings.db.bookings + '?' + utils.queryParams(params);
    const eventsCurrentUrl = settings.db.url + '/' + settings.db.events + '?' + utils.queryParams(params) + '&' + settings.db.notRepeatParam;
    const eventsRepeatUrl = settings.db.url + '/' + settings.db.events + '?' + settings.db.repeatParam;

    Promise.all([
      fetch(bookingsUrl).then(function(rawResponse) {
        return rawResponse.json();
      }),
      fetch(eventsCurrentUrl).then(function(rawResponse) {
        return rawResponse.json();
      }),
      fetch(eventsRepeatUrl).then(function(rawResponse) {
        return rawResponse.json();
      }),
    ])
      .then(function(allData) {
        const bookings = allData[0];
        const eventsCurrent = allData[1];
        const eventsRepeat = allData[2];

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let i = 0; i <= settings.datePicker.maxDaysInFuture; i++) {
          const date = utils.dateToStr(utils.addDays(thisBooking.datePicker.minDate, i));
          thisBooking.makeBooked(date, item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if(!thisBooking.booked.hasOwnProperty(date)) {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    const endHour = startHour + duration;

    for(let hourBlock = startHour; hourBlock < endHour; hourBlock = hourBlock + 0.5) {
      if(!thisBooking.booked[date].hasOwnProperty(hourBlock)) {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = thisBooking.hourPicker.value;

    let bookedTables = [];

    if(thisBooking.booked.hasOwnProperty(thisBooking.date) && thisBooking.booked[thisBooking.date].hasOwnProperty(utils.hourToNumber(thisBooking.hour))) {
      bookedTables = thisBooking.booked[thisBooking.date][utils.hourToNumber(thisBooking.hour)];
    }

    for(let table of thisBooking.dom.tables) {
      const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      if(bookedTables.includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      table.classList.remove(classNames.booking.tableSelected);
    }

    thisBooking.selectedTable = null;
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable,
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for(let starter of thisBooking.dom.starters) {
      if(starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function() {
        if(payload.table !== null) {
          thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        }
        thisBooking.updateDOM();
      });
  }
}

export default Booking;
