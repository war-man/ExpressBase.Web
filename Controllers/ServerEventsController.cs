﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ExpressBase.Web.Controllers
{
    public class ServerEventsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Notificaions()
        {
            return View();
        }
    }
}