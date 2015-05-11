// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


Date.prototype.rotation = null;
Date.prototype.type = null;
Date.prototype.announcement = null;
Date.prototype.school_start_time = null;
Date.prototype.school_end_time = null;
Date.prototype.display_school_time = null;
Date.prototype.events = [];
Date.prototype.blocks = [];
Date.prototype.getShortDay = function() {
  var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[this.getDay()];
}
Date.prototype.getShortMonth = function() {
  var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUNE", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];;
  return months[this.getMonth()];
}
Date.prototype.getTwoDigitDate = function() {
  var date = this.getDate();
  if (date >= 10) {
    return date + '';
  } else {
    return '0' + date;
  }
}
Date.prototype.getNumberOfWeekdaysSince = function(startDate) {
  startDate.setHours(0, 0, 0, 0);
  startDate = startDate.getTime();
  var millisecondsInDay = 1000 * 60 * 60 * 24;
  var weekdayCounter = 0;
  for (var d = startDate; d !== this.getTime(); d += millisecondsInDay) {
      // increment weekday counter if the day isn't a weekend(sat + sun)
      var fullDate = new Date(d)
      if (fullDate.getDay() !== 0 && fullDate.getDay() !== 6) {
          weekdayCounter++;
      }
  }
  return weekdayCounter;
};

Date.prototype.getRotation = function() {
  if(this.getDay() !== 6 && this.getDay() !== 0) {
    // Before deploying add more than one year's worth of start dates!
    switch (this.getNumberOfWeekdaysSince(new Date(2014, 8, 1)) % 10) {
        case 0:
            return [1, 2, 3, 4];
            break;
        case 1:
            return [5, 6, 7, 8];
            break;
        case 2:
            return [2, 3, 1, 4];
            break;
        case 3:
            return [6, 7, 5, 8];
            break;
        case 4:
            return [3, 1, 2, 4];
            break;
        case 5:
            return [7, 5, 6, 8];
            break;
        case 6:
            return [1, 2, 3, 4];
            break;
        case 7:
            return [1, 2, 3, 4];
            break;
        case 8:
            return [1, 2, 3, 4];
            break;
        case 9:
            return [1, 2, 3, 4];
            break;
    }
  }
}

function twentyFourHourToAmPm(timestring) {
  timeSplit = timestring.split(':');
  timeSplit[0] = parseInt(timeSplit[0]);
  var amPmTime = "";
  if (timeSplit[0] > 12) {
    timeSplit[0] -= 12;
    amPmTime = timeSplit[0] + ":" + timeSplit[1] + 'pm';
  } else if (timeSplit[0] > 23) {
    return 'Invalid Date';
  } else {
    amPmTime = timeSplit[0] + ":" + timeSplit[1] + 'am';
  }
  return amPmTime;
}

var xenon = angular.module('xenon', ['ionic', 'ngResource']);

xenon.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/");

  $stateProvider.state('plan', {
    url: "/plan",
    views: {
      week: {
        templateUrl: "templates/week.html",
        controller: 'WeekCtrl'
      },
      day: {
        templateUrl: "templates/day.html"
      }
    }
  });
});

xenon.factory('Day', function($resource) {
  return $resource('http://107.170.252.240/days/', {}, {
    getDay: {method: 'GET', url:'http://107.170.252.240/days/?d=:date&m=:month&y=:year', params: {date:'@date', month: '@month', year: '@year'}},
  });
});

xenon.controller('WeekCtrl',['$scope', '$http', 'Day',
  function ($scope, $http, Day) {
    var day = Date.now();
    $scope.days = [];
    for (var i = 0; i < 7; i++) {
      day_obj = new Date(day);
      day_obj.setHours(0,0,0,0);
      rotation = day_obj.getRotation();
      if (rotation) {
        day_obj.rotation = rotation[0] + ' ' + rotation[1] + ' ' + rotation[2] + ' ' + rotation[3];
      }
      var web_day = Day.getDay({date: day_obj.getDate(), month: day_obj.getMonth() + 1, year: day_obj.getFullYear()}, function (result) {
        if (result.count > 0) {
          for (var iter = 0; iter < 7; iter++) {
            if(new Date(result.results[0].date + " PDT").getDate() === $scope.days[iter].getDate()) {
              $scope.days[iter].name = result.results[0].name;
              $scope.days[iter].type = result.results[0].type;
              $scope.days[iter].announcement = result.results[0].announcement;
              if (result.results[0].school_start_time && result.results[0].school_end_time) {
                $scope.days[iter].diplaySchoolTime = twentyFourHourToAmPm(result.results[0].school_start_time) + " - " + twentyFourHourToAmPm(result.results[0].school_end_time);
              }
            }
          }
        }
      });
      $scope.days.push(day_obj);
      day += (1000 * 60 * 60 * 24);
    }
}]);


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
  });
})