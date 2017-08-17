﻿using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class _SidebarmenuTUserViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        public _SidebarmenuTUserViewComponent(IServiceClient _client)
        {
            this.ServiceClient = _client as JsonServiceClient;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
           
            var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { VersionId = Int32.MaxValue, EbObjectType = 9, TenantAccountId = ViewBag.cid});
            ViewBag.resultlist = resultlist.Data;
           
            return View();
        }
    }
}