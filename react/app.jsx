var domready = require('domready');
var React = require('react');
var Router = require('react-router');
var ReactDOM = require('react-dom');
var AppRoutes = require('./app-routes.jsx');
// var injectTapEventPlugin = require('react-tap-event-plugin');

domready(function () {

  // client side debugging
  //window.myDebug = require('debug');

  //Needed for React Developer Tools
  window.React = React;
  // Needed for onTouchTap
  // Can go away when react 1.0 release
  // Check this repo:
  // https://github.com/zilverline/react-tap-event-plugin
  // injectTapEventPlugin();

  /** Render the main app component. You can read more about the react-router here:
    *  https://github.com/rackt/react-router/blob/master/docs/guides/overview.md
    */
  Router
    // Runs the router, similiar to the Router.run method. You can think of it as an
    // initializer/constructor method.
    .create({
      routes: AppRoutes,
      location: Router.HistoryLocation,
      scrollBehavior: Router.ScrollToTopBehavior
    })
    // This is our callback function, whenever the url changes it will be called again.
    // Handler: The ReactComponent class that will be rendered
    .run(function (Handler,state) {
      ReactDOM.render(<Handler />, document.getElementById('content-section'));
      //analytics(state);
    });
});