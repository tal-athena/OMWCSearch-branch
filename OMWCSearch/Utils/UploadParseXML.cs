using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;

namespace OMWCSearch.Utils
{
    public class UploadParseXML
    {
        public string template { get; set; }
        public string ocxMOSID { get; set; }
        public string ocxNCSID { get; set; }
        public List<string> ddFileFormat { get; set; }
        public UploadParseXML(string xml)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xml);

            var templateVal = doc.SelectSingleNode("//activexinfo/template");
            if (templateVal != null)
            {
                template = templateVal.InnerText;
            }
            var ocxMOSIDVal = doc.SelectSingleNode("//activexinfo/mos/general/ocxMOSID");
            if (ocxMOSIDVal != null)
            {
                ocxMOSID = ocxMOSIDVal.InnerText;
            }
            var ocxNCSIDVal = doc.SelectSingleNode("//activexinfo/mos/general/ocxNCSID");
            if (ocxNCSIDVal != null)
            {
                ocxNCSID = ocxNCSIDVal.InnerText;
            }

            var nodes = doc.SelectNodes("//activexinfo/input/general/ddFileFormat");
            if (nodes.Count > 0)
            {
                ddFileFormat = new List<string>();
                foreach (XmlNode childrenNode in nodes)
                {
                    ddFileFormat.Add(childrenNode.InnerText);
                }
            }
        }

        public bool PathMatch(string path)
        {
            if (ddFileFormat != null)
            {
                foreach (var format in ddFileFormat)
                {
                    var regFormat = WildcardToRegex(format);
                    if (Regex.IsMatch(path, regFormat))
                    {
                        //If at least one of formats is match the true will be returned
                        return true;
                    }
                }
            }
            return false;
        }

        public static string WildcardToRegex(string pattern)
        {
            return "^" + Regex.Escape(pattern)
                              .Replace(@"\*", ".*")
                              .Replace(@"\?", ".")
                       + "$";
        }
    }
}
