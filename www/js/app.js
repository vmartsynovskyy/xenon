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
}
Date.prototype.getShortMonth = function() {
  var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JLY", "AUG", "SEP", "OCT", "NOV", "DEC"];;
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
            return [5, 6, 7, 8];
            break;
        case 8:
            return [2, 3, 1, 4];
            break;
        case 9:
            return [6, 7, 5, 8];
            break;
    }
  }
}

Date.prototype.getStartOfWeek = function() {
  var i = this;
  while(true) {
    if (i.getDay() === 0) {
      return i;
    }
    i.setDate(i.getDate() - 1);
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

xenon.config(function($stateProvider, $urlRouterProvider, $anchorScrollProvider) {
  $anchorScrollProvider.disableAutoScrolling()

  $stateProvider.state('week', {
    url: "/week?date",
    views: {
      'week': {
        templateUrl: "templates/week.html",
        controller: 'WeekCtrl'
      },
    }
  });

  $stateProvider.state('day', {
    url: '/day?date',
    views: {
      'week': {
        templateUrl: "templates/day.html",
        controller: 'DayCtrl'
      }
    }
  });
});

xenon.factory('Day', function($resource, $cacheFactory) {
  days_cache = $cacheFactory('days');
  return $resource('http://107.170.252.240/days/', {}, {
    getDay: {cache: days_cache, method: 'GET', url:'http://107.170.252.240/days/?d=:date&m=:month&y=:year', params: {date:'@date', month: '@month', year: '@year'}},
  });
});

xenon.controller('DayCtrl', ['$scope', '$location', '$cacheFactory', 'Day', '$ionicPopup',
  function ($scope, $location, $cacheFactory, Day, $ionicPopup) {
    function renderDayFromDate(date_arg){
      // sets all $scope variables for day.html template based on date_arg
      date_arg.setHours(0, 0, 0, 0);
      $scope.day = date_arg;
      $scope.day.rotation = $scope.date.getRotation();
      if ($scope.day.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
          $scope.day.today = true;
      }
      var web_day = Day.getDay({date: $scope.date.getDate(), month: $scope.date.getMonth() + 1, year: $scope.date.getFullYear()}, function (result) {
        // changes $scope.date once data is retrieved from web API
        if (result.count > 0) {
          $scope.date.name = result.results[0].name;
          $scope.date.day_type = result.results[0].day_type;  
          $scope.date.announcement = result.results[0].announcement;
          if (result.results[0].school_start_time && result.results[0].school_end_time) {
            $scope.date.school_start_time = result.results[0].school_start_time;
            $scope.date.school_end_time = result.results[0].school_end_time;
          }
        }
      });
    }
    if (!$location.search().date) {
      renderDayFromDate(new Date(Date.now()).getStartOfWeek());
    } else {
      renderDayFromDate(new Date($location.search().date).getStartOfWeek()); 
    }
}]);

xenon.controller('WeekCtrl',['$scope', '$location', '$cacheFactory', 'Day', '$ionicPopup',
  function ($scope, $location, $cacheFactory, Day, $ionicPopup) {
    function renderWeekFromDate(date_arg) {
      // sets all $scope variables for week.html template based on date_arg
      $scope.days = [];
      var days = [];
      date_arg.setHours(0, 0, 0, 0);
      var next_date = date_arg;
      for (var i = 0; i < 7; i++) {
        var date = new Date(next_date);
        rotation = date.getRotation();
        if (date.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
          date.today = true;
        }
        if (rotation) {
          date.rotation = rotation[0] + ' ' + rotation[1] + ' ' + rotation[2] + ' ' + rotation[3];
        }
        var web_day = Day.getDay({date: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()}, function (result) {
          if (result.count > 0) {
            for (var iter = 0; iter < 7; iter++) {
              // changes $scope.days when data is retrieved from web API
              if(new Date(result.results[0].date + " PDT").getDate() === $scope.days[iter].getDate()) {
                $scope.days[iter].name = result.results[0].name;
                $scope.days[iter].day_type = result.results[0].day_type;
                $scope.days[iter].announcement = result.results[0].announcement;
                if (result.results[0].school_start_time && result.results[0].school_end_time) {
                  $scope.days[iter].diplaySchoolTime = twentyFourHourToAmPm(result.results[0].school_start_time) + " - " + twentyFourHourToAmPm(result.results[0].school_end_time);
                }
              }
            }
          }
        });
        $scope.days.push(date);
        next_date.setDate(date.getDate() + 1);  
      }   
    }

    $scope.doRefresh = function() {
      if (navigator.connection.type === "none") {
        $ionicPopup.show({
          title: "No Internet Connection",
          subTitle: "Refresh again when you have an internet connection to get latest information",
          scope: $scope,
          buttons: [
          { text: 'Ok'},
          ],
        })
      } else {
        $cacheFactory.get('days').removeAll();
      }
      $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.incrementWeek = function() {
      if (!$location.search().date) {
        $location.search('date', Date.now());
      }
      var dateToRender = new Date($location.search().date).getStartOfWeek();
      dateToRender.setDate(dateToRender.getDate() + 7);
      $location.search('date', dateToRender.valueOf());
    }

    $scope.decrementWeek = function() {
      if (!$location.search().date) {
        $location.search('date', Date.now());
      }
      var dateToRender = new Date($location.search().date).getStartOfWeek();
      dateToRender.setDate(dateToRender.getDate() - 7);
      $location.search('date', dateToRender.valueOf());
    }

    console.log('wut');
    if (!$location.search().date) {
      renderWeekFromDate(new Date(Date.now()).getStartOfWeek());
    } else {
      renderWeekFromDate(new Date($location.search().date).getStartOfWeek()); 
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