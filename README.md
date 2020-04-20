# MovieAPI
.NET Core WebApp for getting Movie Info

How to test it out? Easy, go to https://cssa.webapp.brodev.info
Login: test@mail.com / pw: Test123!

Or register with your own account but don't forget to click confirm when prompted or you will be locked out

Technologies:
.NET Core MVC
HTML/CSS/SASS/Javascript
SQL Server
JS Fetch(very similar to AJAX)
AJAX(not with jQuery, I went with vanilla Javascript because the other API stuff was also built with vanilla JS)
Asynchronous loading from API - while waiting for results Loader will show(it's hard to see as usually you get results very quickly)
Javascript MVC - inspect the custom.js file

Execution flow:
Login -> Type in movie/series name -> View results -> If series, you can view additional season info

Note: 
1. Published the web app on https://cssa-webapp.brodev.info/ subdomain, it was easier to do this way
1. I built a completely custom HTML/CSS page and overridden the default layout so the normal header/footer doesn't show
once you login
2. Removed the default index pages and thingies. Only registration/login is working
3. The search results from API are not technically loaded with AJAX but JS fetch API(which is similar) - this part doesn't go through
the backend as that would add nothing but server load(at least in this case) - all the API data can be queried without server as middleware, however
4. AJAX is used with back-end to actually log the user queries
5. Normally for testing logout is not needed but if you need to logout visit: https://cssa-webapp.brodev.info/Identity/Account/Manage and click logout in the upper right



