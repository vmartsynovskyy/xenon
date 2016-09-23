# Version 3.0 of the Windsor Secondary Mobile App
Codename xenon

## Features:
* Retrieves schedule information from the **[WS Companion API](https://github.com/MaldorLevr/neon-webapp)**, a Django web server
* Displays pertinent information to Windsor Secondary students about their schedules
* Displays class rotation
* Sends daily configurable notifications to users with schedule information
* Algorithmic approach to finding the schedule so that some schedule information can be retrieved while offline
* Displays teacher contact information
* Different views (daily and weekly)

--------------------------------------------------------------------------------

## Technologies used:
* JavaScript, HTML, CSS(using [SASS](http://sass-lang.com/))
* [Ionic Framework](http://ionicframework.com/)
* [Angular](https://angularjs.org/)(as a part of Ionic Framework)
* [Xcode](https://developer.apple.com/xcode/) to painstakingly build for iOS...
* [Git](https://git-scm.com/)

--------------------------------------------------------------------------------

## Changelogs

Some changes are undocumented here because they were added directly through the [WS Companion API server](https://github.com/MaldorLevr/neon-webapp)

3.1.1
* Added grad-specific notifications opt-in checkbox

3.1.0
* Added local notifications for block rotations
* Added push notifications
* General fixing of stuff

3.0.4
* Fixed a bug with daylight savings time that caused the app to freeze

3.0.3
* fixed some internal bugs
* fixed special days(pro-d days, etc.) not showing up properly on week view

3.0.2
* Fixed the rotations being displayed incorrectly.

3.0.1 Changelog:
* fixed bug with events not properly appearing in day view

3.0 Changelog:
* Complete remake of the app using the ionic framework!
* Material-ish redesign
* Pull down to refresh instead of refresh button
* Everything is updated live from the internet! No need to update the app every year to get the rotations or events.
* Support for events such as holidays, sports games, exams, and much more!
* Swipe left and right to change weeks
* Updated contact information
* Updated about page with new email
* Set a class for each rotation in the settings and see what class you have when! No need to memorize which is class is what number anymore!
