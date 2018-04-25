﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.ServiceClients;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseExtController : EbBaseController
    {
        public EbBaseExtController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseExtController(IEbStaticFileClient _sfc) : base(_sfc) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBaseExtController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseExtController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);
            string solutionId = hostParts[0].Replace(RoutingConstants.DASHDEV, string.Empty);

            try
            {
                var controller = context.Controller as Controller;
                controller.ViewBag.SolLogoUrl = string.Format("static/logo/logo_{0}.png", solutionId);
                controller.ViewBag.SolutionId = solutionId;
                controller.ViewBag.WhichConsole = hostParts[0].EndsWith(RoutingConstants.DASHDEV) ? RoutingConstants.DC : RoutingConstants.UC;
                base.OnActionExecuting(context);
            }
            catch (System.ArgumentNullException ane)
            {
                Console.WriteLine("Exception:" + ane.Message.ToString());
            }
        }


    }
}