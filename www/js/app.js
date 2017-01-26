/*jslint browser: true*/
/* globals cordova */
/* globals angular */
/* globals console */
/* globals Ionic */
/* globals compareBlockTimes */
/* globals twentyFourHourToAmPm */

'use strict';

var DEFAULT_ABOUT = {
    about: '<p>\r\nWS Companion gives Windsor Secondary students the ability to find out' +
    ' about events happening at their school, check what classes they have next, find teacher' +
    ' contact information, and find websites and blogs maintained by Windsor Secondary staff.' +
    ' \r\n</p>\r\n\r\n<p>\r\nLead Developer: Vadym Martsynovskyy\r\n</p>\r\n<p>\r\nIdea and ' +
    'Original App: Chris Bolton\r\n</p>\r\n<p>\r\nData Entry: Lukas Kocsis\r\n</p>\r\n\r\n<p>\r\n' +
    'WS Companion is an unofficial app created by Windsor Secondary students that is not maintained' +
    'by the North Vancouver School District or Windsor Secondary.\r\n</p>',
    support_email: 'vadym1@shaw.ca'
};

var DEFAULT_YEARSTARTS = [
    {
        "date": "1999-05-21"
    },
    {
        "date": "2015-09-07"
    }
];

var DEFAULT_DOMAIN = "http://windsorapp.me/";

var xenon = angular.module('xenon', ['ionic','ionic.service.core', 'ngResource', 'angular-cache', 'ngAnimate', 'ngCordova', 'ngCordova.plugins.nativeStorage']);

function createErrorPopup(scope, errTitle, errMessage, errButton) {
    errTitle = typeof errTitle !== 'undefined' ? errTitle : "No Internet Connection";
    errMessage = typeof errMessage !== 'undefined' ? errMessage : "Refresh again when you have an internet connection to get latest information";
    errButton = typeof errButton !== 'undefined' ? errButton : "Ok";

    var $ionicPopup = angular.element(document.body).injector().get('$ionicPopup');

    $ionicPopup.show({
        title: errTitle,
        subTitle: errMessage,
        scope: scope,
        buttons: [
        {text: errButton},
    ]});
}

function sendDeviceToken(deviceToken, gradStatus) {
    var data =
    {
          'token' : deviceToken,
          'gradStatus' : gradStatus,
    };

    var $rootScope = angular.element(document.body).injector().get('$rootScope');
    var $http = angular.element(document.body).injector().get('$http');

    $http({
          'method': 'POST',
          'url': DEFAULT_DOMAIN + 'register-device/',
          'data': data,
    }).then(function() {
        $rootScope.$broadcast("xenon:register-device-success", gradStatus);
    }, function () {
        $rootScope.$broadcast("xenon:register-device-failure");
    });
}


function sendDeviceTokenGlobalStatus(deviceToken) {
    var $cordovaNativeStorage = angular.element(document.body).injector().get('$cordovaNativeStorage');
    $cordovaNativeStorage.getItem("gradStatus").then(function (value) {
        sendDeviceToken(deviceToken, value);
    });
}

xenon.directive('input', function($timeout){
     return {
         restrict: 'E',
         scope: {
             'returnClose': '=',
             'onReturn': '&'
        },
        link: function(scope, element, attr){
            element.bind('keydown', function(e){
                if(e.which == 13){
                    if(scope.returnClose){
                        element[0].blur();
                    }
                    if(scope.onReturn){
                        $timeout(function(){
                            scope.onReturn();
                        });
                    }
                }
            });
        }
    };
});

xenon.config(function($stateProvider, CacheFactoryProvider, $ionicConfigProvider) {
    angular.extend(CacheFactoryProvider.defaults, {storageMode: 'localStorage'});

    $ionicConfigProvider.views.transition('ios');
    $ionicConfigProvider.tabs.position('top');

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
    return $resource(DEFAULT_DOMAIN + 'days/', {}, {
        getDay: {cache: CacheFactory.get('days'), isArray: true, method: 'GET', url: DEFAULT_DOMAIN + 'days/?d=:date&m=:month&y=:year', params: {date:'@date', month: '@month', year: '@year'}},
    });
});

xenon.factory('Staff', function($resource, CacheFactory) {
    CacheFactory('staff');
    return $resource(DEFAULT_DOMAIN + 'staff/', {}, {
        getStaff: {cache: CacheFactory.get('staff'), isArray: true, method: 'GET', url: DEFAULT_DOMAIN + 'staff/'},
    });
});

xenon.factory('Discover', function($resource, CacheFactory) {
    CacheFactory('discover');
    return $resource(DEFAULT_DOMAIN + 'discover/', {}, {
        getDiscover: {cache: CacheFactory.get('discover'), isArray: true, method: 'GET', url: DEFAULT_DOMAIN + 'discover/'},
    });
});

xenon.factory('Vacation', function($resource, CacheFactory) {
    return $resource(DEFAULT_DOMAIN + 'vacation/', {}, {
        getVacations: {cache: false, isArray: true, method: 'GET', url: DEFAULT_DOMAIN + 'vacation/'},
    });
});

xenon.factory('YearStart', function($resource, CacheFactory) {
    return $resource(DEFAULT_DOMAIN + 'yearstarts/', {}, {
        getYearStarts: {cache: false, isArray: true, method: 'GET', url: DEFAULT_DOMAIN + 'yearstarts/'},
    });
});

xenon.factory('About', function($resource, CacheFactory) {
    CacheFactory('about');
    return $resource(DEFAULT_DOMAIN + 'about/', {}, {
        getAbout: {cache: CacheFactory.get('about'), isArray: true, method: 'GET', url: DEFAULT_DOMAIN + 'about/'},
    });
});

xenon.factory('disableNotifications',['$cordovaLocalNotification',
function($cordovaLocalNotification) {
    return function() {
        $cordovaLocalNotification.cancelAll();
    };
}]);

xenon.factory('notifications', ['Day', '$cordovaLocalNotification', '$ionicPlatform', '$cordovaNativeStorage',
function(Day, $cordovaLocalNotification, $ionicPlatform, $cordovaNativeStorage) {
    return function updateLocalNotifications() {
        // updates next ten weekdays of notification
        $cordovaNativeStorage.getItem("dailyStatus").then(function(value) {
            if (value === true) {
                $cordovaLocalNotification.hasPermission(function(success) {
                    if (!success) {
                        $cordovaLocalNotification.registerPermission(function(success) {
                            if (!success) {
                                console.log("Permission for notifications denied");
                            }
                        });
                    }
                });
                var notificationDate = new Date();
                var notificationTime;
                if (window.localStorage.notificationTime) {
                    notificationTime = new Date(JSON.parse(window.localStorage.notificationTime));
                } else {
                    notificationTime = new Date(1456848000000);
                }
                notificationDate.setHours(notificationTime.getHours(), notificationTime.getMinutes(),0,0);
                var notifications = [];
                var i = 0;
                while (i < 10) {
                    if (notificationDate.getDay() === 0) {
                        notificationDate.incrementDate(1);
                    } else if (notificationDate.getDay() == 6) {
                        notificationDate.incrementDate(2);
                    } else if (notificationDate.getTime() < (new Date()).getTime()) {
                        notificationDate.incrementDate(1);
                    } else if (notificationDate.isDuringVacation()) {
                        notificationDate.incrementDate(1);
                    } else {
                        var rotation = notificationDate.getRotation();
                        var notification = {
                            id: notificationDate.id,
                            at: notificationDate.getTime(),
                            text: ("Rotation today: " + rotation[0].toString() + ", " + rotation[1].toString() + ", " + rotation[2].toString() + ", " + rotation[3].toString()),
                            icon: "res://icon.png",
                        };
                        var storedNotification = notificationDate.notification;
                        if (storedNotification) {
                            if (storedNotification != notification) {
                                // update the existing notification
                                notificationDate.notification = notification;
                            }
                        } else {
                            notificationDate.notification = notification;
                        }
                        notifications.push(notification);
                        Day.getDay({date: notificationDate.getDate(),
                                    month:notificationDate.getMonth() + 1,
                                    year: notificationDate.getFullYear(),},
                            function(result) {
                                if (result.length > 0) {
                                    var dayDate = new Date(result[0].date);
                                    var dayName = result[0].name;
                                    var dayType = result[0].day_type;
                                    var dayAnnouncement = result[0].announcement;
                                    var notificationMessage;

                                    if (dayType != 'normal') {
                                        if (dayType == 'holiday') {
                                            notificationMessage = dayName + ': No school today';
                                        } else if (dayType == 'pro-d') {
                                            notificationMessage = 'Pro-D Day: No school today';
                                        } else if (dayType === 'late-start') {
                                            notificationMessage = 'Late Start @ 9:50 am today';
                                        } else {
                                            notificationMessage = dayName + ' today';
                                        }

                                        var updatedNotification = dayDate.notification;
                                        updatedNotification.text = notificationMessage;
                                        dayDate.notification = updatedNotification;
                                        $cordovaLocalNotification.update(updatedNotification);
                                    }
                                }
                            }
                        );
                        notificationDate.incrementDate(1);
                        i++;
                    }
                }
                $ionicPlatform.ready(function() {
                    $cordovaLocalNotification.schedule(notifications);
                });
            }
        });
    };
}]);

xenon.controller('SettingsCtrl', ['$scope', '$http', 'notifications', '$cordovaNativeStorage', '$cordovaLocalNotification', 'disableNotifications', '$rootScope',
    function($scope, $http, notifications, $cordovaNativeStorage, $cordovaLocalNotification, disableNotifications, $rootScope) {
        $scope.dailyStatusWorking = false;
        $scope.gradStatusWorking = false;

        $rootScope.$on("$cordovaLocalNotification:cancelall", function() {
            $scope.dailyStatus = false;
            $scope.dailyStatusWorking = false;
            $cordovaNativeStorage.setItem("dailyStatus", false);
        });

        $rootScope.$on("$cordovaLocalNotification:schedule", function() {
            $scope.dailyStatusWorking = false;
            $scope.dailyStatus = true;
            $cordovaNativeStorage.setItem("dailyStatus", true);
        });

        $rootScope.$on("xenon:register-device-success", function (event, args) {
            $scope.gradStatus = args;
            $scope.gradStatusWorking = false;
            $cordovaNativeStorage.setItem("gradStatus", args);
        });

        $rootScope.$on("xenon:register-device-failure", function () {
            createErrorPopup($scope);
            $scope.gradStatusWorking = false;
        });

        $cordovaNativeStorage.getItem("dailyStatus").then(function (value) {
            $scope.dailyStatus = value;
        }, function() {
            $cordovaNativeStorage.setItem("dailyStatus", false);
            $scope.dailyStatus = false;
        });

        $cordovaNativeStorage.getItem("blockClasses").then(function(value) {
            $scope.blockClasses = value;
        });

        if (window.localStorage.notificationTime) {
            $scope.notificationTimeSelector = new Date(JSON.parse(window.localStorage.notificationTime));
        } else {
            window.localStorage.notificationTime = JSON.stringify(new Date(1456848000000));
        }

        $cordovaNativeStorage.getItem("gradStatus").then(function(value) {
            $scope.gradStatus = value;
        }, function() {
            $cordovaNativeStorage.setItem("gradStatus", false);
            $scope.gradStatus = false;
        });

        $scope.gradStatusChanged = function() {
            sendDeviceToken(window.localStorage.deviceToken, $scope.gradStatus);
            $scope.gradStatus = !($scope.dailyStatus);
            $cordovaNativeStorage.setItem("gradStatus", $scope.gradStatus);
        };

        $scope.blockChanged = function() {
            $cordovaNativeStorage.setItem("blockClasses", $scope.blockClasses);
        };

        $scope.timeChanged = function() {
            window.localStorage.notificationTime = JSON.stringify($scope.notificationTimeSelector);
            notifications();
        };

        $scope.dailyCheckboxChanged = function() {
            $scope.dailyStatusWorking = true;
            if ($scope.dailyStatus === false) {
                $scope.dailyStatus = !($scope.dailyStatus);
                disableNotifications();
            } else {
                $scope.dailyStatus = !($scope.dailyStatus);
                $cordovaNativeStorage.setItem("dailyStatus", true).then(function() {
                    notifications();
                });
            }
        };

        $scope.closeKeyboard = function() {
            cordova.plugins.Keyboard.close();
        };
}]);

xenon.controller('DiscoverCtrl', ['$scope', 'CacheFactory', 'Discover', '$ionicPopup',
    function($scope, CacheFactory, Discover, $ionicPopup) {
        function setDiscoverFromWeb() {
            Discover.getDiscover(
            function(result) {
                if (result.length > 0) {
                    $scope.discover = result;
                }
            },
            function(response) {
                createErrorPopup($ionicPopup, $scope);
            });
        }
        setDiscoverFromWeb();
        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                createErrorPopup($ionicPopup, $scope);
            } else {
                try {
                    CacheFactory.get('discover').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            setDiscoverFromWeb();
            $scope.$broadcast('scroll.refreshComplete');
        };
        $scope.openLink = function(url) {
            window.open(url, '_system');
        };
}]);

xenon.controller('AboutCtrl', ['$scope', '$ionicPopup', 'About', 'CacheFactory',
    function($scope, $ionicPopup, About, CacheFactory) {
        function setAboutFromWeb() {
            About.getAbout(function(result) {
                $scope.about = result[0];
            },
            function(error) {
                console.log(error);
                createErrorPopup($scope);
            });
        }
        $scope.about = DEFAULT_ABOUT;
        $scope.version = appVersion;
        setAboutFromWeb();

        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                createErrorPopup($scope);
            } else {
                try {
                    CacheFactory.get('about').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            setAboutFromWeb();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.openLink = function(url) {
            window.open(url, '_system');
        };
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
                createErrorPopup($scope);
            });
        }
        setStaffFromWeb();
        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                createErrorPopup($scope);
            } else {
                try {
                    CacheFactory.get('staff').removeAll();
                } catch (e) {
                    console.log(e);
                }
            }
            setStaffFromWeb();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.openLink = function(url) {
            window.open(url, '_system');
        };
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
                    $scope.day.blocks = $scope.day.blocks.concat(result[0].day_events);
                }
                $scope.day.generateBlocks();
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
            window.localStorage.vacations = JSON.stringify(result);
        });
        YearStart.getYearStarts(function(result) {
            window.localStorage.yearStartsFetched = 'true';
            window.localStorage.yearStarts = JSON.stringify(result);
        });
      }

    function renderDayFromDate(date_arg){
        $scope.day = date_arg;
        date_arg.setHours(0, 0, 0, 0);
        $scope.toAmPm = twentyFourHourToAmPm;
        if ($scope.day.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
          $scope.day.today = true;
        }
        setDayFromWeb();
    }

    if (!$location.search().date) {
        renderDayFromDate(new Date(Date.now()));
    } else {
        renderDayFromDate(new Date(parseInt($location.search().date)));
    }

    $scope.doRefresh = function() {
        if (navigator.connection.type === 'none') {
            createErrorPopup($scope);
        } else {
            try {
                CacheFactory.get('days').removeAll();
            } catch (e) {
                console.log(e);
            }
        }
        setDayFromWeb();
        $scope.$broadcast('scroll.refreshComplete');
    };
}]);

xenon.controller('WeekCtrl',['$scope', '$location', 'CacheFactory', 'Day', 'Vacation', 'YearStart', '$ionicPopup', '$ionicViewSwitcher',
    function ($scope, $location, CacheFactory, Day, Vacation, YearStart, $ionicPopup, $ionicViewSwitcher) {
        function renderWeekFromDate(date_arg) {
            // sets all $scope variables for week.html template based on date_arg
            $scope.days = [];
            date_arg.setHours(0, 0, 0, 0);
            var next_date = date_arg;
            Vacation.getVacations(function(result) {
                window.localStorage.vacations = JSON.stringify(result);
            });

            YearStart.getYearStarts(function(result) {
                window.localStorage.yearStarts = JSON.stringify(result);
                window.localStorage.yearStartsFetched = 'true';
            });
            for (var i = 0; i < 7; i++) {
                var date = new Date(next_date);
                var rotation = date.getRotation();

                if (date.valueOf() === new Date(Date.now()).setHours(0,0,0,0)) {
                    date.today = true;
                }

                var duringVacation = date.isDuringVacation();

                date.generateBlocks();

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
                            if(new Date(result[0].date).getDate() === $scope.days[iter].getDate()) {
                                $scope.days[iter].day_type = result[0].day_type;
                                $scope.days[iter].name = result[0].name;
                                $scope.days[iter].generateBlocks();
                                $scope.days[iter].announcement = result[0].announcement;
                                if (result[0].school_start_time && result[0].school_end_time) {
                                    $scope.days[iter].diplaySchoolTime = twentyFourHourToAmPm(result[0].school_start_time) + ' - ' + twentyFourHourToAmPm(result[0].school_end_time);
                                }
                                break;
                            }
                        }
                    }
                });

                $scope.days.push(date);
                next_date.incrementDate(1);
            }
        }

        $scope.doRefresh = function() {
            if (navigator.connection.type === 'none') {
                createErrorPopup($scope);
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
        };

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
        };

        if (!$location.search().date) {
            $scope.weekStart = new Date(Date.now()).getStartOfWeek();
            renderWeekFromDate($scope.weekStart);
        } else {
            $scope.weekStart = new Date(parseInt($location.search().date)).getStartOfWeek();
            renderWeekFromDate($scope.weekStart);
        }
}]);

var appVersion = '0.0.0';
xenon.run(['$ionicPlatform', 'notifications', '$cordovaLocalNotification', '$rootScope', '$cordovaStatusbar', '$http', '$cordovaNativeStorage',
    function($ionicPlatform, notifications, $cordovaLocalNotification, $rootScope, $cordovaStatusbar, $http, $cordovaNativeStorage) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            
            var nativeStorageFound = false;
            while(nativeStorageFound != true) {
                try {
                    $cordovaNativeStorage.getItem("gradStatus");
                    nativeStorageFound = true;
                } catch (ex) {

                }
            }

            $cordovaStatusbar.styleHex('#007F0E');

            cordova.getAppVersion(function(version) {
                    appVersion = version;
            });

            notifications();

            $rootScope.$on('$cordovaLocalNotification:trigger', function(event, notification, state) {
                // listener to update local notifications every time one is triggered
                // this is so that they trigger every day, even when the app remains closed for a long time
                notifications();
            });

            // Push Notification Setup
            var push = new Ionic.Push({
              "debug": false
            });

            push.register(function(token) {
              console.log("Device token:", token.token);

              window.localStorage.deviceToken = token.token;
              sendDeviceTokenGlobalStatus(token.token);
              push.saveToken(token);  // persist the token in the Ionic Platform
            });
        });
}]);
