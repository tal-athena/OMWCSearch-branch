using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OMWCSearch.Utils
{
    public class ParseHTMLDoc
    {

        public HtmlDocument htmlDoc;
        public string htmlStr;
        public ParseHTMLDoc(string html)
        {
            htmlStr = html;
            LoadDocument(html);
        }

        private void LoadDocument(string html)
        {
            htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(html);
            // ParseErrors is an ArrayList containing any errors from the Load statement
            if (htmlDoc.ParseErrors != null && htmlDoc.ParseErrors.Count() > 0)
            {
                // Handle any parse errors as required

            }
        }


        public string GetHTMLString()
        {
            return htmlDoc.DocumentNode.OuterHtml;
        }



    }
}
