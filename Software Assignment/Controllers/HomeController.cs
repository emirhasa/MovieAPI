using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Software_Assignment.Data;
using Software_Assignment.Models;

namespace Software_Assignment.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        [Authorize]
        public IActionResult TestAPI()
        {
            return View();
        }


        public bool LogQuery(string query)
        {
            if (!string.IsNullOrWhiteSpace(query))
            {
                _context.UserQueries.Add(new UserQuery
                {
                    Time = DateTime.Now,
                    Query = query.Trim()
                }); 
                _context.SaveChanges();
                return true;
            }

            return false;
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
