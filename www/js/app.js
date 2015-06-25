'use strict';
Date.prototype.rotation = null;
Date.prototype.day_type = null;
Date.prototype.today = null;
Date.prototype.announcement = null;
Date.prototype.school_start_time = null;
Date.prototype.school_end_time = null;
Date.prototype.display_school_time = null;
Date.prototype.events = [];
Date.prototype.blocks = [];

var DEFAULT_ABOUT = {
    about: "<p>\r\nWS Companion gives Windsor Secondary students the ability to find out about events happening at their school, check what classes they have next, find teacher contact information, sign into school WiFi without having to type in the credentials every time, and find websites and blogs maintained by Windsor Secondary staff.\r\n</p>\r\n\r\n<p>\r\nLead Developer: Vadym Martsynovskyy\r\n</p>\r\n<p>\r\nIdea and Original App: Chris Bolton\r\n</p>\r\n<p>\r\nData Entry: Lukas Kocsis\r\n</p>\r\n\r\n<p>\r\nWS Companion is an unofficial app created by Windsor Secondary students that is not maintained by the North Vancouver School District or Windsor Secondary.\r\n</p>",
    support_email: 'vadym1@shaw.ca'
}

var DEFAULT_YEARSTARTS = [
    {
        "date": "2014-09-01"
    },
    {
        "date": "2015-08-31"
    }
];

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
  startDate = startDate.getTime();
  var millisecondsInDay = 1000 * 60 * 60 * 24;
  var weekdayCounter = 0;
  for (var d = startDate; d !== this.getTime(); d += millisecondsInDay) {
    // increment weekday counter if the day isn't a weekend(sat + sun)
    var fullDate = new Date(d);
    if (fullDate.getDay() !== 0 && fullDate.getDay() !== 6) {
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
        var closestYearStart;
        for(var i = 0; i < yearStarts.length; i++) {
            if (this.valueOf() > new Date(Date.parse(yearStarts[0].date.valueOf()))) {
                closestYearStart = new Date(Date.parse(yearStarts[0].date.valueOf()));
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
    var classes = JSON.parse(localStorage['blockClasses']);
    var blockStarts, blockEnds, eventTimes, eventNames;
    if (this.getDay() === 0 || this.getDay() === 6){
        return false;
    } else if (this.day_type === 'pro-d') {
        return false;
    } else if (this.day_type === 'early-d'){
        blockStarts =   ['08:30:00', '09:35:00', '11:10:00', '13:15:00'];
        blockEnds =     ['09:30:00', '10:35:00', '12:10:00', '13:15:00'];
        eventTimes =    ['09:30:00', '10:35:00', '12:10:00'];
        eventNames =    ['5 Minute Break', '35 Minute Lunch', '5 Minute Break'];
    } else if (this.day_type === 'holiday'){
        return false;
    } else if (this.day_type === 'late-start'){
        blockStarts =   ['09:50:00', '11:05:00', '12:10:00', '14:00:00'];
        blockEnds =     ['10:50:00', '12:05:00', '13:10:00', '15:00:00'];
        eventTimes =    ['10:50:00', '12:05:00', '13:10:00'];
        eventNames =    ['15 Minute Break', '5 Minute Break', '50 Minute Lunch'];
    }
    else {
        blockStarts =   ['08:30:00', '10:05:00', '11:30:00', '13:40:00'];
        blockEnds =     ['09:50:00', '11:25:00', '12:50:00', '15:00:00'];
        eventTimes =    ['09:50:00', '11:25:00', '12:50:00'];
        eventNames =    ['15 Minute Break', '5 Minute Break', '50 Minute Lunch'];
    }

    for (var i = 0; i < 4; i++) {
        var displayClass = classes[rotation[i] - 1];
        if (displayClass.length > 10) {
            displayClass = displayClass.substring(0, 7) + '...';
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
        return 1;
    } else if (block1IsEvent === false && block2IsEvent === true) {
        return -1;
    } else {
        return 0;
    }    
}

var xenon = angular.module('xenon', ['ionic', 'ngResource', 'angular-cache', 'ngAnimate']);

xenon.config(function($stateProvider, CacheFactoryProvider, $ionicConfigProvider) {
    angular.extend(CacheFactoryProvider.defaults, {storageMode: 'localStorage'});
    $stateProvider.state('week', {
        url: '/week?date',
            views: {
              'week': {
                    templateUrl: 'templates/week.html',
                    controller: 'WeekCtrl'
              },
        }
    });
    
    $stateProvider.state('day', {
        url: '/day?date',
        views: {
            'week': {
                templateUrl: 'templates/day.html',
                controller: 'DayCtrl'
            }
        }
    });
    
    $stateProvider.state('contact', {
        url: '/contact',
        views: {
            'contact': {
                templateUrl: 'templates/contact.html',
                controller: 'ContactCtrl'
            },
        }
    });
    
    $stateProvider.state('discover', {
        url: '/discover',
        views: {
            'discover': {
                templateUrl: 'templates/discover.html',
                controller: 'DiscoverCtrl'
            },
        }
    });
    
    $stateProvider.state('about', {
        url: '/about',
        views: {
            'about': {
                templateUrl: 'templates/about.html',
                controller: 'AboutCtrl'
            },
        }
    });
    
    $stateProvider.state('settings', {
        url: '/settings',
        views: {
            'settings': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            },
        }
    });
});

xenon.factory('Day', function($resource, CacheFactory) {
    CacheFactory('days');
    return $resource('http://107.170.252.240/days/', {}, {
        getDay: {cache: CacheFactory.get('days'), isArray: true, method: 'GET', url:'http://107.170.252.240/days/?d=:date&m=:month&y=:year', params: {date:'@date', month: '@month', year: '@year'}},
    });
});

xenon.factory('Staff', function($resource, CacheFactory) {
    CacheFactory('staff');
    return $resource('http://107.170.252.240/staff/', {}, {
        getStaff: {cache: CacheFactory.get('staff'), isArray: true, method: 'GET', url:'http://107.170.252.240/staff/'},
    });
});

xenon.factory('Discover', function($resource, CacheFactory) {
    CacheFactory('discover');
    return $resource('http://107.170.252.240/discover/', {}, {
        getDiscover: {cache: CacheFactory.get('discover'), isArray: true, method: 'GET', url:'http://107.170.252.240/discover/'},
    });
});

xenon.factory('Vacation', function($resource, CacheFactory) {
    return $resource('http://107.170.252.240/vacation/', {}, {
        getVacations: {cache: false, isArray: true, method: 'GET', url:'http://107.170.252.240/vacation/'},
    });
});

xenon.factory('YearStart', function($resource, CacheFactory) {
    return $resource('http://107.170.252.240/yearstarts/', {}, {
        getYearStarts: {cache: false, isArray: true, method: 'GET', url:'http://107.170.252.240/yearstarts/'},
    });
});

xenon.factory('About', function($resource, CacheFactory) {
    CacheFactory('about');
    return $resource('http://107.170.252.240/about/', {}, {
        getAbout: {cache: CacheFactory.get('about'), isArray: true, method: 'GET', url:'http://107.170.252.240/about/'},
    });
});

xenon.controller('SettingsCtrl', ['$scope',
    function($scope) {
        if (window.localStorage['blockClasses']) {
            $scope.blockClasses = JSON.parse(window.localStorage['blockClasses']);
        }
        $scope.blockChanged = function() {
            console.log($scope.blockClasses);
            window.localStorage['blockClasses'] = JSON.stringify($scope.blockClasses);
        }
}]);


xenon.controller('DiscoverCtrl', ['$scope', 'CacheFactory', 'Discover', '$ionicPopup',
    function($scope, CacheFactory, Discover, $ionicPopup) {
        function setDiscoverFromWeb() {
            Discover.getDiscover(function(result) {
                if (result.length > 0) {
                    $scope.discover = result;
                }
            },
            function(error){
                $ionicPopup.show({
                  title: 'Error',
                  subTitle: 'An error occurred while getting information from WS Companion servers.',
                  scope: $scope,
                  buttons: [
                  {text: 'Ok'},
                ]});
            });
        }
        setDiscoverFromWeb();
        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                $ionicPopup.show({
                  title: 'No Internet Connection',
                  subTitle: 'Refresh again when you have an internet connection to get latest information',
                  scope: $scope,
                  buttons: [
                  {text: 'Ok'},
                ]});
            } else {
                try {
                    CacheFactory.get('discover').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            setDiscoverFromWeb();
            $scope.$broadcast('scroll.refreshComplete');
        }
}]);

xenon.controller('AboutCtrl', ['$scope', '$ionicPopup', 'About', 'CacheFactory',
    function($scope, $ionicPopup, About, CacheFactory) {
        function setAboutFromWeb() {
            About.getAbout(function(result) {
                $scope.about = result[0];
                console.log($scope.about);
            },
            function(error) {
                $ionicPopup.show({
                  title: 'Error',
                  subTitle: 'An error occurred while getting information from WS Companion servers.',
                  scope: $scope,
                  buttons: [
                  {text: 'Ok'},
                ]});
            });
        }
        $scope.about = DEFAULT_ABOUT;
        $scope.version = appVersion;
        setAboutFromWeb();
        
        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                $ionicPopup.show({
                  title: 'No Internet Connection',
                  subTitle: 'Refresh again when you have an internet connection to get latest information',
                  scope: $scope,
                  buttons: [
                  {text: 'Ok'},
                ]});
            } else {
                try {
                    CacheFactory.get('about').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            setAboutFromWeb();
            $scope.$broadcast('scroll.refreshComplete');
        }
}]);

xenon.controller('ContactCtrl', ['$scope', 'CacheFactory', 'Staff', '$ionicPopup',
    function($scope, CacheFactory, Staff, $ionicPopup) {
        function setStaffFromWeb() {
            Staff.getStaff(function(result) {
                if (result.length > 0) {
                    $scope.staff = result;
                }
            },
            function(error){
                $ionicPopup.show({
                  title: 'Error',
                  subTitle: 'An error occurred while getting information from WS Companion servers.',
                  scope: $scope,
                  buttons: [
                  {text: 'Ok'},
                ]});
            });
        }
        setStaffFromWeb();
        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                $ionicPopup.show({
                  title: 'No Internet Connection',
                  subTitle: 'Refresh again when you have an internet connection to get latest information',
                  scope: $scope,
                  buttons: [
                  {text: 'Ok'},
                ]});
            } else {
                try {
                    CacheFactory.get('staff').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            setStaffFromWeb();
            $scope.$broadcast('scroll.refreshComplete');
        }
}]);

xenon.controller('DayCtrl', ['$scope', '$location', 'CacheFactory', 'Day', 'Vacation', 'YearStart', '$ionicPopup',
    function ($scope, $location, CacheFactory, Day, Vacation, YearStart, $ionicPopup) {
      function setDayFromWeb() {
        Day.getDay({date: $scope.day.getDate(), month: $scope.day.getMonth() + 1, year: $scope.day.getFullYear()}, 
        function (result) {
            // changes $scope.day once data is retrieved from web API
            if (result.length > 0) {
                $scope.day.name = result[0].name;
                $scope.day.day_type = result[0].day_type;  
                $scope.day.announcement = result[0].announcement;
                if (result[0].day_blocks.length > 0) {
                    $scope.day.blocks = result[0].day_blocks.concat(result[0].day_events);
                } else if (result[0].day_events.length > 0) {
                    $scope.day.generateBlocks();
                    $scope.day.blocks.concat(result[0].day_events);
                } else {
                    $scope.day.generateBlocks();
                }
                if (result[0].school_start_time && result[0].school_end_time) {
                    $scope.day.school_start_time = result[0].school_start_time;
                    $scope.day.school_end_time = result[0].school_end_time;
                }
            } else if ($scope.day.getDay() !== 6 || $scope.day.getDay() !== 0) {
                $scope.day.generateBlocks();
            }
            $scope.day.blocks.sort(compareBlockTimes);
        });
        Vacation.getVacations(function(result) {
            window.localStorage['vacations'] = JSON.stringify(result);
        });
        YearStart.getYearStarts(function(result) {
            window.localStorage['yearStarts'] = JSON.stringify(result);
        });
      }

      function renderDayFromDate(date_arg){
        $scope.day = date_arg;
        date_arg.setHours(0, 0, 0, 0);
        $scope.toAmPm = twentyFourHourToAmPm;
        if ($scope.day.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
          $scope.day.today = true;
        }
        setDayFromWeb()
    }

    if (!$location.search().date) {
        renderDayFromDate(new Date(Date.now()));
    } else {
        renderDayFromDate(new Date(parseInt($location.search().date))); 
    }

    $scope.doRefresh = function() {
        if (navigator.connection.type === 'none') {
            $ionicPopup.show({
              title: 'No Internet Connection',
              subTitle: 'Refresh again when you have an internet connection to get latest information',
              scope: $scope,
              buttons: [
              {text: 'Ok'},
            ]});
        } else {
            try {
                CacheFactory.get('days').removeAll();
            } catch (e) {
                console.log(e);
            }
        }
        setDayFromWeb();
        $scope.$broadcast('scroll.refreshComplete');
    }
}]);

xenon.controller('WeekCtrl',['$scope', '$location', 'CacheFactory', 'Day', 'Vacation', 'YearStart', '$ionicPopup', '$ionicViewSwitcher',
    function ($scope, $location, CacheFactory, Day, Vacation, YearStart, $ionicPopup, $ionicViewSwitcher) {
        function renderWeekFromDate(date_arg) {
            // sets all $scope variables for week.html template based on date_arg
            $scope.days = [];
            date_arg.setHours(0, 0, 0, 0);
            var next_date = date_arg;
            for (var i = 0; i < 7; i++) {
                var date = new Date(next_date);
                var rotation = date.getRotation();

                if (date.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
                    date.today = true;
                }
                
                var duringVacation = date.isDuringVacation();

                if (rotation && !duringVacation) {
                    date.rotation = rotation[0] + ' ' + rotation[1] + ' ' + rotation[2] + ' ' + rotation[3];
                }
                
                if (duringVacation) {
                    date.name = duringVacation.name;
                }

                Day.getDay({date: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()}, function (result) {
                    if (result.length > 0) {
                        for (var iter = 0; iter < 7; iter++) {
                            // changes $scope.days when data is retrieved from web API
                            if(new Date(result[0].date + ' PDT').getDate() === $scope.days[iter].getDate()) {
                                $scope.days[iter].name = result[0].name;
                                $scope.days[iter].day_type = result[0].day_type;
                                $scope.days[iter].announcement = result[0].announcement;
                                if (result[0].school_start_time && result[0].school_end_time) {
                                    $scope.days[iter].diplaySchoolTime = twentyFourHourToAmPm(result[0].school_start_time) + ' - ' + twentyFourHourToAmPm(result[0].school_end_time);
                                }
                            }
                        }
                    }
                });
                
                Vacation.getVacations(function(result) {
                    window.localStorage['vacations'] = JSON.stringify(result);
                });
                
                YearStart.getYearStarts(function(result) {
                    window.localStorage['yearStarts'] = JSON.stringify(result);
                });

                $scope.days.push(date);
                next_date.setDate(date.getDate() + 1);  
            }   
        }

        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                $ionicPopup.show({
                    title: 'No Internet Connection',
                    subTitle: 'Refresh again when you have an internet connection to get latest information',
                    scope: $scope,
                    buttons: [
                    { text: 'Ok'},
                ]});
            } else {
                try {
                    CacheFactory.get('days').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            if (!$location.search().date) {
                $scope.weekStart = new Date(Date.now()).getStartOfWeek();
                renderWeekFromDate($scope.weekStart);
            } else {
                $scope.weekStart = new Date(parseInt($location.search().date)).getStartOfWeek();
                renderWeekFromDate($scope.weekStart);
            }
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.incrementWeek = function() {
            if (!$location.search().date) {
                $location.search('date', Date.now());
            }
            var dateToRender = new Date(parseInt($location.search().date)).getStartOfWeek();
            dateToRender.setDate(dateToRender.getDate() + 7);
            $ionicViewSwitcher.nextDirection('forward');
            $location.search('date', dateToRender.valueOf());
        };

        $scope.decrementWeek = function() {
            if (!$location.search().date) {
                $location.search('date', Date.now());
            }
            var dateToRender = new Date(parseInt($location.search().date)).getStartOfWeek();
            dateToRender.setDate(dateToRender.getDate() - 7);
            $ionicViewSwitcher.nextDirection('back');
            $location.search('date', dateToRender.valueOf());
        };
        
        $scope.isThisWeek = function() {
            if (!$location.search().date) {
                return true;
            }
            return $location.search().date == new Date(Date.now()).getStartOfWeek().valueOf();
        }
        
        $scope.switchToThisWeek = function() {
            if ($location.search().date) {
                if ($location.search().date != new Date(Date.now()).getStartOfWeek().valueOf()) {
                    if ($location.search().date > Date.now()) {
                        $ionicViewSwitcher.nextDirection('back');
                    } else {
                        $ionicViewSwitcher.nextDirection('forward');
                    }
                    $scope.weekStart = new Date(Date.now()).getStartOfWeek();
                    $location.search('date', $scope.weekStart.valueOf());
                }
            }
        }

        if (!$location.search().date) {
            $scope.weekStart = new Date(Date.now()).getStartOfWeek();
            renderWeekFromDate($scope.weekStart);
        } else {
            $scope.weekStart = new Date(parseInt($location.search().date)).getStartOfWeek();
            renderWeekFromDate($scope.weekStart);
        }
}]);

var appVersion = '0.0.0';
xenon.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
        cordova.getAppVersion(function(version) {
                appVersion = version;
        });
    });
});