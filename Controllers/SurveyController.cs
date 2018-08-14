﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class SurveyController : EbBaseIntCommonController
    {
        public SurveyController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        public IActionResult CreateSurvey()
        {
            GetSurveyQueriesResponse resp = this.ServiceClient.Get(new GetSurveyQueriesRequest());
            ViewBag.Queries = resp.Data;
            return View();
        }

        public bool SaveQues(string survey)
        {
            var o = JsonConvert.DeserializeObject<EbSurveyQuery>(survey);
            SurveyQuesResponse resp = this.ServiceClient.Post(new SurveyQuesRequest {
                Query = o
            });
            return resp.Status;
        }

		public IActionResult ManageSurvey(int id)
		{
			ManageSurveyResponse resp = this.ServiceClient.Post<ManageSurveyResponse>(new ManageSurveyRequest { Id = id });
			ViewBag.QuestionList = JsonConvert.SerializeObject(resp.AllQuestions);
			ViewBag.SurveyData = JsonConvert.SerializeObject(resp.Obj);
			return View();
		}

		public bool SaveSurvey(string SurveyInfo)
		{
			SaveSurveyResponse resp = this.ServiceClient.Post<SaveSurveyResponse>(new SaveSurveyRequest { Data = SurveyInfo});
			return resp.Status;
		}
	}
			
}
