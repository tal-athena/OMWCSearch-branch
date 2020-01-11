using OMWCSearch.Utils;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace OMWebiSearch.Areas.Upload.Controllers
{
    public class FileUploadController : Controller
    {

        private long GetFileSize(string fullName)
        {
            long fileSize = System.IO.File.Exists(fullName)
                                ? new FileInfo(fullName).Length
                                : 0;
            return fileSize;
        }


        public ActionResult GetFile(string file)
        {
            var fileType = Path.GetExtension(file);
            var folderName = GetFolderName(fileType);

            string path = Path.Combine(GetBaseFolderPath(), folderName, file);

            if (System.IO.File.Exists(path))
            {
                System.IO.FileInfo fs = new System.IO.FileInfo(path);
                int fileLength = Convert.ToInt32(fs.Length);
                return Json(new { size = fileLength }, "text/html", JsonRequestBehavior.AllowGet);
            }
            return Json(new { }, "text/html", JsonRequestBehavior.AllowGet);
        }


        public ActionResult GetMatch(string file)
        {
            var fileType = Path.GetExtension(file);
            List<string> match = new List<string>();
            List<UploadParseXML> parseList = new List<UploadParseXML>();
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 1</template><mos><general><ocxMOSID>media.file.mos</ocxMOSID><ocxNCSID>media.Ncs.mos</ocxNCSID></general></mos><input><general><ddFileFormat>*.pdf</ddFileFormat><ddFileFormat>*.docx</ddFileFormat></general></input></activexinfo>"));
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 2</template><mos><general><ocxMOSID>media.file.mos</ocxMOSID><ocxNCSID>media.Ncs.mos</ocxNCSID></general></mos><input></input></activexinfo>"));
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 3</template><mos><general><ocxNCSID>media.Ncs.mos</ocxNCSID></general></mos><input><ddFileFormat>*.pdf</ddFileFormat></input></activexinfo>"));
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 4</template><mos><general><ocxNCSID>media.Ncs.mos</ocxNCSID></general></mos></activexinfo>"));
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 5</template></activexinfo>"));
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 6</template><mos><general><ocxMOSID>media.file.mos</ocxMOSID><ocxNCSID>media.Ncs.mos</ocxNCSID></general></mos><input><general><ddFileFormat>*.pdf</ddFileFormat><ddFileFormat>*.docx</ddFileFormat></general></input></activexinfo>"));
            parseList.Add(new UploadParseXML("<?xml version=\"1.0\"?><activexinfo><template>template 7</template><mos><general><ocxMOSID>media.file.mos</ocxMOSID><ocxNCSID>media.Ncs.mos</ocxNCSID></general></mos><input><general><ddFileFormat>*.pdf</ddFileFormat><ddFileFormat>*.jpeg</ddFileFormat></general></input></activexinfo>"));
            foreach (var item in parseList)
            {
                if (item.PathMatch(file))
                {
                    if (item.template != null)
                    {
                        match.Add(item.template);
                    }
                }
            }

            return Json(new { match = match }, "text/html", JsonRequestBehavior.AllowGet);
        }

        public ActionResult RemoveFile(string file)
        {
            var fileType = Path.GetExtension(file);
            var folderName = GetFolderName(fileType);

            string path = Path.Combine(GetBaseFolderPath(), folderName, file);

            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
                return Json(new { deleted = true }, "text/html", JsonRequestBehavior.AllowGet);
            }
            return Json(new { deleted = false }, "text/html", JsonRequestBehavior.AllowGet);
        }

        public ActionResult GetStoryURL(string file)
        {

            return Json(new { url = "OMWebiSearch/Story/EditStory/Index/PDIsMjM3MTAsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg==" }, "text/html", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public virtual ActionResult Upload()
        {
            string fileName;
            try
            {
                HttpContext.Response.AddHeader("Pragma", "no-cache");
                HttpContext.Response.AddHeader("Cache-Control", "private, no-cache");
                // Cross-site
                HttpContext.Response.AddHeader("Access-Control-Allow-Headers", "X-File-Name,X-File-Type,X-File-Size,X-Signature, X-Template");

                var headers = HttpContext.Request.Headers;

                fileName = headers["X-File-Name"];
                var hash = headers["X-Signature"];
                var template = headers["X-Template"];

                //Write hash
                System.Diagnostics.Debug.WriteLine(hash.ToString());

                var fileType = Path.GetExtension(fileName);
                var folderName = GetFolderName(fileType);

                string contentRange = headers["Content-Range"];
                if (contentRange.Contains("bytes 0-"))
                {
                    //CHange name
                    fileName = Path.GetFileNameWithoutExtension(fileName) + DateTime.Now.ToString("HHmmssfff") + Path.GetExtension(fileName);
                }

                string pathForSaving = Path.Combine(GetBaseFolderPath(), folderName);

                if (!Directory.Exists(pathForSaving))
                {
                    Directory.CreateDirectory(pathForSaving);
                }
                string fullName = System.IO.Path.Combine(pathForSaving, Path.GetFileName(fileName));
                const int bufferSize = 1024;
                Stream inputStream = Request.InputStream;

                using (FileStream fileStream =
                    new FileStream(fullName, FileMode.Append, FileAccess.Write, FileShare.Delete))
                {
                    byte[] buffer = new byte[bufferSize];

                    int l;
                    while ((l = inputStream.Read(buffer, 0, bufferSize)) > 0)
                    {
                        fileStream.Write(buffer, 0, l);
                    }

                    fileStream.Flush();
                }

            }
            catch
            {
                return new HttpStatusCodeResult(HttpStatusCode.InternalServerError, "Upload error.");
            }
            return Json(new { statuses = "OK", newName = fileName }, "text/html");
        }

        private string GetFolderName(string fileType)
        {
            try
            {
                return System.Configuration.ConfigurationManager.AppSettings[fileType].ToString();
            }
            catch
            {
                try
                {
                    return System.Configuration.ConfigurationManager.AppSettings["default"].ToString();
                }
                catch
                {
                    return "Uploads";
                }
            }
        }

        private string GetBaseFolderPath()
        {
            try
            {
                return System.Configuration.ConfigurationManager.AppSettings["folderPath"].ToString();
            }
            catch
            {
                return Server.MapPath("Uploads");
            }
        }
    }
}