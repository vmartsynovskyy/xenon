Date.prototype.rotation = null;
Date.prototype.day_type = null;
Date.prototype.today = null;
Date.prototype.announcement = null;
Date.prototype.school_start_time = null;
Date.prototype.school_end_time = null;
Date.prototype.display_school_time = null;
Date.prototype.events = [];
Date.prototype.blocks = [];
Date.prototype.getShortDay = function() {
    var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[this.getDay()];
};

Date.prototype.getShortMonth = function() {
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JLY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[this.getMonth()];
};

Date.prototype.getTwoDigitDate = function() {
    var date = this.getDate();
    if (date >= 10) {
        return date + '';
    } else {
        return '0' + date;
    }
};

Date.prototype.getNumberOfWeekdaysSince = function(startDate) {
    startDate.setHours(0, 0, 0, 0);
    var millisecondsInDay = 1000 * 60 * 60 * 24;
    var weekdayCounter = 0;
    for (var d = startDate; d.getTime() !== this.getTime() || d < 100000; d.incrementDate(1)) {
        // increment weekday counter if the day isn't a weekend(sat + sun)
        if (d.getDay() !== 0 && d.getDay() !== 6) {
            weekdayCounter++;
        }
    }
    return weekdayCounter;
};
Date.prototype.getNumberOfWeekdaysSince = function(startDate) {
  startDate.setHours(0, 0, 0, 0);
  var millisecondsInDay = 1000 * 60 * 60 * 24;
  var weekdayCounter = 0;
  for (var d = startDate; d.getTime() !== this.getTime() || d < 100000; d.incrementDate(1)) {
    // increment weekday counter if the day isn't a weekend(sat + sun)
    if (d.getDay() !== 0 && d.getDay() !== 6) {
        weekdayCounter++;
    }
  }
  return weekdayCounter;
};

Date.prototype.getRotation = function() {
    if(this.getDay() !== 6 && this.getDay() !== 0) {
        if (!(window.localStorage['yearStartsFetched'])) {
            window.localStorage['yearStarts'] = JSON.stringify(DEFAULT_YEARSTARTS);
        }
        var yearStarts = JSON.parse(window.localStorage['yearStarts']);
        var closestYearStart = new Date(Date.parse(yearStarts[0].date.valueOf()));
        for(var i = 0; i < yearStarts.length; i++) {
            var thisYearStart = new Date(Date.parse(yearStarts[i].date.valueOf()));
            if (this.valueOf() > thisYearStart.valueOf() && closestYearStart.valueOf() < thisYearStart.valueOf()) {
                closestYearStart = thisYearStart;
            }
        }
        switch (this.getNumberOfWeekdaysSince(closestYearStart) % 10) {
            case 0:
                return [1, 2, 3, 4];
            case 1:
                return [5, 6, 7, 8];
            case 2:
                return [2, 3, 1, 4];
            case 3:
                return [6, 7, 5, 8];
            case 4:
                return [3, 1, 2, 4];
            case 5:
                return [7, 5, 6, 8];
            case 6:
                return [1, 2, 3, 4];
            case 7:
                return [5, 6, 7, 8];
            case 8:
                return [2, 3, 1, 4];
            case 9:
                return [6, 7, 5, 8];
        }
    }
};

Date.prototype.getStartOfWeek = function() {
    var i = this;
    i.setHours(0, 0, 0, 0);
    while(true) {
        if (i.getDay() === 0) {
            return i;
        }
        i.setDate(i.getDate() - 1);
    }
};

Date.prototype.getPrettified = function() {
    // returns the prettified version of the date ex: Friday May 21st, 1999
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = months[this.getMonth()];
    var day = days[this.getDay()];
    var year = this.getFullYear();

    // adds ordinal indicators by these rules:
    // -st is used with numbers ending in 1 (e.g. 1st, pronounced first)
    // -nd is used with numbers ending in 2 (e.g. 92nd, pronounced ninety-second)
    // -rd is used with numbers ending in 3 (e.g. 33rd, pronounced thirty-third)
    // As an exception to the above rules, all the 'teen' numbers ending with 11, 12 or 13 use -th (e.g. 11th, pronounced eleventh, 112th, pronounced one hundred [and] twelfth)
    // -th is used for all other numbers (e.g. 9th, pronounced ninth)
    var dateNum = this.getDate();
    var dateEnding = '';
    if (dateNum > 10 && dateNum < 14) {
        dateEnding = 'th';
    } else {
        switch (dateNum % 10) {
            case 1:
                dateEnding = 'st';
                break;
            case 2:
                dateEnding = 'nd';
                break;
            case 3:
                dateEnding = 'rd';
                break;
            default:
                dateEnding = 'th';
                break;
        }
    }
    return day + ' ' + month + ' ' + dateNum + dateEnding + ', ' + year;
};

Date.prototype.generateBlocks = function () {
    this.blocks = [];
    var rotation = this.getRotation();
    if (localStorage['blockClasses']) {
        var classes = JSON.parse(localStorage['blockClasses']);
    }
    var blockStarts, blockEnds, eventTimes, eventNames;
    if (this.getDay() === 0 || this.getDay() === 6){
        return null;
    } else if (this.day_type === 'pro-d') {
        return null;
    } else if (this.day_type === 'early-d'){
        blockStarts =   ['08:30:00', '09:35:00', '11:10:00', '13:15:00'];
        blockEnds =     ['09:30:00', '10:35:00', '12:10:00', '13:15:00'];
        eventTimes =    ['09:30:00', '10:35:00', '12:10:00'];
        eventNames =    ['5 Minute Break', '35 Minute Lunch', '5 Minute Break'];
    } else if (this.day_type === 'holiday'){
        return null;
    } else if (this.day_type === 'late-start'){
        blockStarts =   ['09:50:00', '11:05:00', '12:10:00', '14:00:00'];
        blockEnds =     ['10:50:00', '12:05:00', '13:10:00', '15:00:00'];
        eventTimes =    ['10:50:00', '12:05:00', '13:10:00'];
        eventNames =    ['15 Minute Break', '5 Minute Break', '50 Minute Lunch'];
    }
    else {
        this.day_type = 'normal';
        blockStarts =   ['08:30:00', '10:05:00', '11:30:00', '13:40:00'];
        blockEnds =     ['09:50:00', '11:25:00', '12:50:00', '15:00:00'];
        eventTimes =    ['09:50:00', '11:25:00', '12:50:00'];
        eventNames =    ['15 Minute Break', '5 Minute Break', '50 Minute Lunch'];
    }

    for (var i = 0; i < 4; i++) {
        if (localStorage['blockClasses']) {
            if (classes[rotation[i] - 1]) {
                var displayClass = classes[rotation[i] - 1];
                if (displayClass.length > 10) {
                    displayClass = displayClass.substring(0, 7) + '...';
                }
            } else {
                var displayClass = '';
            }
        } else {
            var displayClass = '';
        }
        var block = {
            start_time: '',
            end_time: '',
            rotation: rotation[i],
            class: displayClass,
        };
        block.start_time = blockStarts[i];
        block.end_time = blockEnds[i];
        this.blocks.push(block);
    }
    for (var i = 0; i < eventNames.length; i++) {
        var event = {
            name: '',
            time: '',
            info: '',
        };
        event.time = eventTimes[i];
        event.name = eventNames[i];
        this.blocks.push(event);
    }
};

Date.prototype.isDuringVacation = function() {
    if (window.localStorage['vacations']) {
        var vacations = JSON.parse(window.localStorage['vacations']);
        for(var i = 0; i < vacations.length; i++) {
            vacations[i].start_date = new Date(Date.parse(vacations[i].start_date));
            vacations[i].end_date = new Date(Date.parse(vacations[i].end_date));
        }
        
        for(var i = 0; i < vacations.length; i++) {
            if (this.valueOf() > vacations[i].start_date.valueOf() && this.valueOf() < vacations[i].end_date.valueOf()) {
                return vacations[i];
            }
        }
        return false;
    }
}

Date.prototype.incrementDate = function(amount) {
    var date = this;
    var tzOff = date.getTimezoneOffset() * 60 * 1000,
        t = date.getTime(),
        tzOff2;

    t += (1000 * 60 * 60 * 24) * amount;
    this.setTime(t);

    tzOff2 = this.getTimezoneOffset() * 60 * 1000;
    if (tzOff != tzOff2) {
        var diff = tzOff2 - tzOff;
        t += diff;
        this.setTime(t);
    }
    return this;
}

function twentyFourHourToAmPm(timestring) {
    var timeSplit = timestring.split(':');
    timeSplit[0] = parseInt(timeSplit[0]);
    var amPmTime = '';
    if (timeSplit[0] > 12) {
        timeSplit[0] -= 12;
        amPmTime = timeSplit[0] + ':' + timeSplit[1] + 'pm';
    } else if (timeSplit[0] > 23) {
        return 'Invalid Date';
    } else {
        amPmTime = timeSplit[0] + ':' + timeSplit[1] + 'am';
    }
    return amPmTime;
}

function timeStringToValue(timestring) {
    var timeSplit = timestring.split(':');
    timeSplit[0] = parseInt(timeSplit[0]);
    timeSplit[1] = parseInt(timeSplit[1]);
    return (timeSplit[0] * 60 * 60 * 1000) + (timeSplit[1] * 60 * 1000);
}

function compareBlockTimes(block1, block2) {
    var block1IsEvent = false;
    var block2IsEvent = false;
    var block1Start;
    var block2Start;
    if (block1.hasOwnProperty('start_time')) {
        block1Start = timeStringToValue(block1.start_time);
    } else {
        block1Start = timeStringToValue(block1.time);
        block1IsEvent = true;
    }
    if (block2.hasOwnProperty('start_time')) {
        block2Start = timeStringToValue(block2.start_time);
    } else {
        block2Start = timeStringToValue(block2.time);
        block2IsEvent = true;
    }

    if(block1Start < block2Start) {
        return -1;
    } else if (block1Start > block2Start) {
        return 1;
    } else if (block1IsEvent === true && block2IsEvent === false) {
        return -1;
    } else if (block1IsEvent === false && block2IsEvent === true) {
        return 1;
    } else {
        return 0;
    }    
}