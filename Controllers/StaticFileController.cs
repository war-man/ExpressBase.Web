﻿using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class StaticFileController : EbBaseNewController
    {
        public StaticFileController(IServiceClient _ssclient) : base(_ssclient) { }

        // GET: /<controller>/
        [HttpGet("static/{filename}")]
        public FileStream GetFile(string filename)
        {
            string sFilePath = string.Format("StaticFiles/{0}/{1}", ViewBag.cid, filename);
            if (!System.IO.File.Exists(sFilePath))
            {
                byte[] fileByte = this.ServiceClient.Post<byte[]>(new DownloadFileRequest { FileDetails = new FileMeta { FileName = filename, FileType = (FileTypes)Enum.Parse(typeof(FileTypes), filename.Split('.')[1]) } });
                EbFile.Bytea_ToFile(fileByte, sFilePath);
            }

            HttpContext.Response.Headers[HeaderNames.CacheControl] = "private, max-age=31536000";
            if (filename.ToLower().EndsWith(".pdf"))
                HttpContext.Response.Headers[HeaderNames.ContentType] = "application/pdf";
            return System.IO.File.OpenRead(sFilePath);
        }

        //[HttpPost("/event-subscribers/{Id}")]
        //public void Post(UploadFileControllerResponse request)
        //{

        //}

        [HttpPost]
        public async Task<JsonResult> UploadFileAsync(int i, string tags)
        {
            JsonResult resp = null;
            
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadFileRequest uploadFileRequest = new UploadFileRequest();
                uploadFileRequest.FileDetails = new FileMeta();
                if (!String.IsNullOrEmpty(tags))
                {
                    var tagarray = tags.ToString().Split(',');
                    List<string> Tags = new List<string>(tagarray);
                    uploadFileRequest.FileDetails.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadFileRequest.FileDetails.MetaDataDictionary.Add("Tags", Tags);
                }
                uploadFileRequest.IsAsync = false;

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0)
                    {
                        byte[] myFileContent;

                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);

                            uploadFileRequest.FileByte = myFileContent;
                        }

                        uploadFileRequest.FileDetails.FileName = formFile.FileName;
                        uploadFileRequest.FileDetails.FileType = (FileTypes)Enum.Parse(typeof(FileTypes), uploadFileRequest.FileDetails.FileName.Split('.')[1]);

                        string Id = this.ServiceClient.Post<string>(uploadFileRequest);
                        string url;

                        if ((int)uploadFileRequest.FileDetails.FileType < 100 && uploadFileRequest.FileDetails.FileType != 0)
                            url = string.Format("http://eb_roby_dev.localhost:5000/static/{0}.{1}", Id, Enum.GetName(typeof(FileTypes), uploadFileRequest.FileDetails.FileType));

                        else if ((int)uploadFileRequest.FileDetails.FileType > 100)
                            url = string.Format("{0}.localhost:5000/static/{1}.{2}", ViewBag.cid, Id, Enum.GetName(typeof(FileTypes), uploadFileRequest.FileDetails.FileType));

                        else
                            url = "";
                        resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK", initialPreview = url, objId = Id });
                    }
                }
            }
            catch (Exception e)
            {
                resp = new JsonResult(new UploadFileControllerError { Uploaded = "ERROR" });
            }

            return resp;
        }

        [HttpPost]
        public async Task<JsonResult> UploadImageAsync(int i, string tags)
        {
            JsonResult resp = null;
            string Id = string.Empty;
            string url = string.Empty;

            tags = String.IsNullOrEmpty(tags) ? tags : string.Empty;
            try
            {
                var req = this.HttpContext.Request.Form;
                UploadImageRequest uploadImageRequest = new UploadImageRequest();
                uploadImageRequest.ImageInfo = new FileMeta();
                if (!String.IsNullOrEmpty(tags))
                {
                    var tagarray = tags.ToString().Split(',');
                    List<string> Tags = new List<string>(tagarray);
                    uploadImageRequest.ImageInfo.MetaDataDictionary = new Dictionary<String, List<string>>();
                    uploadImageRequest.ImageInfo.MetaDataDictionary.Add("Tags", Tags);
                }
                uploadImageRequest.IsAsync = false;

                foreach (var formFile in req.Files)
                {
                    if (formFile.Length > 0)
                    {
                        byte[] myFileContent;

                        using (var memoryStream = new MemoryStream())
                        {
                            await formFile.CopyToAsync(memoryStream);
                            memoryStream.Seek(0, SeekOrigin.Begin);
                            myFileContent = new byte[memoryStream.Length];
                            await memoryStream.ReadAsync(myFileContent, 0, myFileContent.Length);

                            uploadImageRequest.ImageByte = myFileContent;
                        }

                        uploadImageRequest.ImageInfo.FileName = formFile.FileName;
                        uploadImageRequest.ImageInfo.FileType = (FileTypes)Enum.Parse(typeof(ImageTypes), uploadImageRequest.ImageInfo.FileName.Split('.')[1]);

                        if (Enum.IsDefined(typeof(ImageTypes), uploadImageRequest.ImageInfo.FileType.ToString()))
                        {
                            Id = this.ServiceClient.Post<string>(uploadImageRequest);
                            url = string.Format("http://eb_roby_dev.localhost:5000/static/{0}.{1}", Id, Enum.GetName(typeof(FileTypes), uploadImageRequest.ImageInfo.FileType));
                        }
                        else url = "Error Because of the file type";
                        resp = new JsonResult(new UploadFileControllerResponse { Uploaded = "OK", initialPreview = url, objId = Id });
                    }
                }
            }
            catch (Exception e)
            {
                resp = new JsonResult(new UploadFileControllerError { Uploaded = "ERROR" });
            }

            return resp;
        }

        public List<FileMeta> FindFilesByTags(int i, string tags, string bucketname)
        {
            FindFilesByTagRequest findFilesByTagRequest = new FindFilesByTagRequest();
            var tagCollection = tags.Split(',');
            List<string> tagList = new List<string>(tagCollection);
            bucketname = "images";

            findFilesByTagRequest.Filter = new KeyValuePair<string, List<string>>("metadata.Tags", tagList);
            findFilesByTagRequest.BucketName = bucketname;

            List<FileMeta> FileInfoList = new List<FileMeta>();

            FileInfoList = this.ServiceClient.Post(findFilesByTagRequest);

            return FileInfoList;
        }
    }
}
