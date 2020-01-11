using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using mshtml;
using HtmlAgilityPack;
using System.IO;
using System.Globalization;

namespace OMWCSearch.Utils
{
    public static class RTFToHTML
    {
        public static HtmlDocument LoadDocument(string html)
        {
            HtmlDocument htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(html);
            // ParseErrors is an ArrayList containing any errors from the Load statement
            if (htmlDoc.ParseErrors != null && htmlDoc.ParseErrors.Count() > 0)
            {
                // Handle any parse errors as required


                return null;
            }
            else
            {
                return htmlDoc;
            }
        }

        public static string GetLastFontType(string html)
        {
            var style = "";
            var htmlDoc = LoadDocument(html);
            if (htmlDoc != null)
            {

                if (htmlDoc.DocumentNode != null)
                {
                    IEnumerable<HtmlNode> f = htmlDoc.DocumentNode.Descendants("font").Where(x => x.Attributes.Contains("face"));
                    var fonts = f.ToList();
                    for (int i = fonts.Count - 1; i >= 0; i--)
                    {
                        var font = fonts[i];
                        style = font.Attributes["face"].Value;
                        if (!String.IsNullOrEmpty(style))
                        {
                            return style;
                        }
                    }

                    //If not found then
                    //Get all with style and find font-family:?;
                    var xPath = "//*[@style]";
                    var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                    if (nodes != null && nodes.Count > 0)
                    {
                        for (int i = nodes.Count - 1; i >= 0; i--)
                        {
                            var node = nodes[i];
                            var styleVal = node.Attributes["style"].Value;

                            //Try to get family from style

                            if (!String.IsNullOrEmpty(styleVal))
                            {
                                if (style.Contains("font-family"))
                                {
                                    var ind = styleVal.IndexOf("font-family");
                                    var start = styleVal.IndexOf(':', ind);
                                    var end = styleVal.IndexOf(";", ind);
                                    start += 1;
                                    style = styleVal.Substring(start, (end - start));

                                    if (!String.IsNullOrEmpty(style))
                                    {
                                        return style;
                                    }
                                }

                            }
                        }
                    }

                }
            }


            return "Arial";
        }
        public static string GetLastFontSize(string html)
        {
            var size = "";

            var htmlDoc = LoadDocument(html);
            if (htmlDoc != null)
            {

                if (htmlDoc.DocumentNode != null)
                {
                    IEnumerable<HtmlNode> f = htmlDoc.DocumentNode.Descendants("span").Where(x => x.Attributes.Contains("style"));
                    var spans = f.ToList();
                    for (int i = spans.Count - 1; i >= 0; i--)
                    {
                        var span = spans[i];
                        var style = span.Attributes["style"].Value;

                        //Try to get Size from style

                        if (!String.IsNullOrEmpty(style))
                        {
                            if (style.Contains("font-size"))
                            {
                                try
                                {
                                    var ind = style.IndexOf("font-size");
                                    var start = style.IndexOf(':', ind);
                                    var end = style.IndexOf(";", ind);
                                    start += 1;
                                    size = style.Substring(start, (end - start));

                                    if (!String.IsNullOrEmpty(size))
                                    {
                                        return size;
                                    }

                                }
                                catch { }
                            }

                        }
                    }

                }
            }


            return size;
        }

        public static string GetLastFontTypeXPath(string html)
        {
            throw new NotImplementedException();
        }
        public static string GetLastFontSizeXPath(string html)
        {
            var size = "";

            var htmlDoc = LoadDocument(html);
            if (htmlDoc != null)
            {

                if (htmlDoc.DocumentNode != null)
                {

                    //var xPath1 = "//*[@style]";
                    //var nodes1 = htmlDoc.DocumentNode.SelectNodes(xPath1);


                    //var xPath = "body/*[@style]";
                    var xPath = "//*[@style]";
                    var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                    if (nodes != null && nodes.Count > 0)
                    {

                        for (int i = nodes.Count - 1; i >= 0; i--)
                        {
                            var node = nodes[i];
                            var style = node.Attributes["style"].Value;

                            //Try to get Size from style

                            if (!String.IsNullOrEmpty(style))
                            {
                                if (style.Contains("font-size"))
                                {
                                    var ind = style.IndexOf("font-size");
                                    var start = style.IndexOf(':', ind);
                                    var end = style.IndexOf(";", ind);
                                    start += 1;
                                    size = style.Substring(start, (end - start));

                                    if (!String.IsNullOrEmpty(size))
                                    {
                                        return size;
                                    }
                                }

                            }
                        }
                    }
                }
            }

            return "12pt";
        }

        public static void ConvertRtf2Html(string formattedTextRtf, out string formattedTextHtml)
        {
            // This is the component we use to convert
            Microsoft.Exchange.Data.TextConverters.RtfToHtml pConverter = new Microsoft.Exchange.Data.TextConverters.RtfToHtml();
            pConverter.NormalizeHtml = false;


            System.IO.MemoryStream pSource = new System.IO.MemoryStream();
            System.IO.StreamWriter sw = new System.IO.StreamWriter(pSource);
            sw.Write(formattedTextRtf);
            sw.Flush();
            pSource.Seek(0, System.IO.SeekOrigin.Begin);

            System.IO.MemoryStream pDest = new System.IO.MemoryStream();

            pConverter.OutputEncoding = System.Text.Encoding.UTF8;
            pConverter.NormalizeHtml = false;

            // Here we convert
            pConverter.Convert(pSource, pDest);

            System.IO.StreamReader sr = new System.IO.StreamReader(pDest);
            pDest.Seek(0, System.IO.SeekOrigin.Begin);
            formattedTextHtml = sr.ReadToEnd();

            /*  Comment content of <style> elements, as HTML editor of OM Web Client displays the content literally otherwise
             *  (at least in some cases).
             */

            // Here we do some stuff not related to fonts
            formattedTextHtml = formattedTextHtml.Replace("<style>", "<style><!-- ");
            formattedTextHtml = formattedTextHtml.Replace("</style>", " --></style>");

            Regex noLink = new Regex(@"(?isx)<\s*a\s+(?![^>]*href[^>]*>)name=""\w+""\s*(?<empty>/)?>(?(empty)|(?<content>.*?)<\s*/\s*a\s*>)");
            formattedTextHtml = noLink.Replace(formattedTextHtml, @"${content}");

            Regex noBlankLines = new Regex(@"(?isx)(?<=\n)\s*\r?\n");
            formattedTextHtml = noBlankLines.Replace(formattedTextHtml, "");

            Regex noWhitespaceInBlankLines = new Regex(@"<div>(\s*<font[^>]*>)*\s*&nbsp;\s*(</font>\s*)*</div>");
            formattedTextHtml = noWhitespaceInBlankLines.Replace(formattedTextHtml, "<div></div>");

            Regex handleLinebreaksInDiv = new Regex(@"(?<=<div>\s*)<br/?>(?<morebreaks>\s*<br/?>\s*)*(?=\s*</div>)");

            int cLinebreakMatches = handleLinebreaksInDiv.Matches(formattedTextHtml).Count;

            while (cLinebreakMatches > 0)
            {
                formattedTextHtml = handleLinebreaksInDiv.Replace(formattedTextHtml, @"</div><div>${morebreaks}");
                cLinebreakMatches = handleLinebreaksInDiv.Matches(formattedTextHtml).Count;
            }

            //TODO: In formattedTextHtml Replace <font> tag(s) with something - this comment about the problematic font tag

            // We can look for them in the DOM like this - this is an examle how to access the DOM, if needed (I am not sure)


            //////Remove everything from HEAD
            //Regex fontRegex = new Regex("<head.*?>(.*?)</head>", RegexOptions.Singleline);
            //formattedTextHtml = fontRegex.Replace(formattedTextHtml, "<head></head>");

            ////Remove all \r\n
            //formattedTextHtml = formattedTextHtml.Replace("\r", string.Empty).Replace("\n", string.Empty);


            ////Change font looking
            //// formattedTextHtml = RTFToHTMLFont(formattedTextHtml);


            //Escape "
            //formattedTextHtml = formattedTextHtml.Replace("\"","\\\"");



            sw.Close();
            sr.Close();
        }

        private static string ParseFontInHTML(string formattedTextHtml)
        {
            IHTMLDocument2 doc = (IHTMLDocument2)new HTMLDocument();
            // HTMLDocument doc = new HTMLDocument();
            doc.write(new object[] { formattedTextHtml });
            if (null != doc)
            {
                foreach (IHTMLElement item in doc.all)
                {
                    if (item is IHTMLFontElement)
                    {
                        var inner = item.innerHTML;
                        var outer = item.outerHTML;
                        if (item.innerHTML != null)
                        {

                            IHTMLFontElement font = item as IHTMLFontElement;
                            var newElement = "<span style=\"";
                            if (font.color != null)
                            {
                                newElement += "color:" + font.color.ToString() + ";";
                            }
                            if (font.face != null)
                            {
                                newElement += "font-family:" + font.face.ToString() + ";";
                            }

                            newElement += " \">" + item.innerHTML + "</span>";

                            item.innerHTML = newElement;

                        }

                    }
                }

            }
            return doc.body.parentElement.outerHTML;
        }

        private static string RTFToHTMLFont(string formattedTextHtml)
        {
            Regex ItemRegex = new Regex("<font.*?>(.*?)</font>", RegexOptions.Singleline);
            foreach (Match ItemMatch in ItemRegex.Matches(formattedTextHtml))
            {
                var matchedString = ItemMatch.Value;
                var innerString = ItemMatch.Groups[1].Value;
                //Check if there is font tag in found string
                if (ItemRegex.Match(innerString).Length > 0)
                {
                    innerString = RTFToHTMLFont(innerString);
                }


                //Get font family
                string fontFamily = RTFToHTMLGetFontFamily(matchedString);


                string newValue = "<span style=\"" + fontFamily + "\">" + innerString + "</span>";

                formattedTextHtml = formattedTextHtml.Replace(matchedString, newValue);
            }
            return formattedTextHtml;
        }

        private static string RTFToHTMLGetFontFamily(string match)
        {
            Regex fontFamilyRegex = new Regex("face=.*?\"(.*?)\"", RegexOptions.Singleline);
            var fontFamilyMatch = fontFamilyRegex.Match(match);
            string fontFamily = "";
            if (fontFamilyMatch.Groups.Count > 1)
            {
                fontFamily = fontFamilyMatch.Groups[1].Value;
            }
            if (!String.IsNullOrEmpty(fontFamily))
            {
                fontFamily = "font-family: '" + fontFamily + "';";
            }
            return fontFamily;
        }

        public static string ChangePoints2Pixels(string input)
        {
            var htmlDoc = LoadDocument(input);
            if (htmlDoc != null)
            {
                if (htmlDoc.DocumentNode != null)
                {
                    var xPath = "//*[@style]"; // this catches all nodes with style, no matter how deep? yes
                    var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                    if (nodes != null && nodes.Count > 0)
                    {
                        for (int i = nodes.Count - 1; i >= 0; i--)
                        {
                            var node = nodes[i];
                            var style = node.Attributes["style"].Value;

                            if (!String.IsNullOrEmpty(style))
                            {
                                if (style.Contains("font-size"))
                                {
                                    // I am worried from caees such as style="font-size: 15px"
                                    // no ';'
                                    // so, a possible solution is to find the end of the style content and take the minimum of its location and the ';' location
                                    // agree? how about trying to get the index of px? and if there is than we convert it to points?
                                    // just be careful from:
                                    // style="font-size: 15pt; margin-top: 2px;"
                                    // be careful not to find the px of the margin
                                    // it's tricky
                                    // maybe it is better to have a regular expression
                                    // font sizes in pixels will have the format:
                                    // font-size<optional white spaces>:<optional white spaces><one-or-two-digits><optional white spaces>px
                                    // Well instead of <one-or-two-digits> we should use "\d+\.\d+" as the example I have tried has value of 15.555556px
                                    // good point
                                    // so, I feel that in this case, the regular expression will be safer than IndexOf
                                    // yes, you are right, I will implement this with regular expression


                                    //reg exp for finding font-size: (__)px
                                    //  font-size\s?:\s?(\d+.?\d*)px;?

                                    var regexp = new Regex(@"font-size\s?:\s?(\d+.?\d*)px;?");
                                    var match = regexp.Match(style);

                                    if (match.Success)
                                    {
                                        var size = match.Groups[1].Value + "px";

                                        var number = match.Groups[1].Value;
                                        double pixels;
                                        int points;
                                        var parse = Double.TryParse(number, out pixels);
                                        if (parse)
                                        {
                                            //Calculating the points value
                                            points = (int)(pixels * (72.0 / 96)) + 1;
                                            string newSize = points.ToString() + "pt";
                                            style = style.Replace(size, newSize);

                                            //This changes the style value to the new value, the one containing the points instead of pixels
                                            node.Attributes["style"].Value = style;
                                        }
                                    }
                                }

                            }
                        }
                    }
                }
            }

            return htmlDoc.DocumentNode.OuterHtml;
        }


        // This is to the other direction
        public static void ConvertHtml2Rtf(string formattedTextHtml, out string formattedTextRtf)
        {

            // Eliminate src tags form html -> rtf conversation 
            string pFormattedTextNoSrcMark = formattedTextHtml;
            //string pFormattedTextNoSrcMark = null;
            Regex noNoBreakSpace = new Regex(@"<div>\s*&nbsp;\s*</div>", RegexOptions.IgnoreCase);
            pFormattedTextNoSrcMark = noNoBreakSpace.Replace(pFormattedTextNoSrcMark, "<div></div>");

            Regex handleEmptyLinesInDiv = new Regex(@"(?<=<div>\s*)(&nbsp;\s*)*<br/?>(\s*&nbsp;)*(?<morebreaks>\s*<br/?>\s*(&nbsp;\s*)*)*(?=</div>)", RegexOptions.IgnoreCase);

            int cLinebreakMatches = handleEmptyLinesInDiv.Matches(pFormattedTextNoSrcMark).Count;

            while (cLinebreakMatches > 0)
            {
                pFormattedTextNoSrcMark = handleEmptyLinesInDiv.Replace(pFormattedTextNoSrcMark, @"</div><div>${morebreaks}");
                cLinebreakMatches = handleEmptyLinesInDiv.Matches(pFormattedTextNoSrcMark).Count;
            }

            Regex handleInitialEmptyLinesInDiv = new Regex(@"(?<=<div>)(\s*&nbsp;)*\s*<br\s*/?\s*>", RegexOptions.IgnoreCase);
            Regex handleEmptyLinesAtEndOfDiv = new Regex(@"<br\s*/?\s*>\s*(&nbsp;\s*)(?=</div>)", RegexOptions.IgnoreCase);

            int cHandleEmtpyLinesInDiv = handleInitialEmptyLinesInDiv.Matches(pFormattedTextNoSrcMark).Count + handleEmptyLinesAtEndOfDiv.Matches(pFormattedTextNoSrcMark).Count;

            string sEmptyLineReplacement = "</div><div>";

            while (cHandleEmtpyLinesInDiv > 0)
            {
                pFormattedTextNoSrcMark = handleInitialEmptyLinesInDiv.Replace(pFormattedTextNoSrcMark, sEmptyLineReplacement);
                pFormattedTextNoSrcMark = handleEmptyLinesAtEndOfDiv.Replace(pFormattedTextNoSrcMark, sEmptyLineReplacement);
                cHandleEmtpyLinesInDiv = cHandleEmtpyLinesInDiv = handleInitialEmptyLinesInDiv.Matches(pFormattedTextNoSrcMark).Count + handleEmptyLinesAtEndOfDiv.Matches(pFormattedTextNoSrcMark).Count;
            }


            //Parse pFormattedTextNoSecMark to change pixels to points using formula
            pFormattedTextNoSrcMark = ChangePoints2Pixels(pFormattedTextNoSrcMark);



            Microsoft.Exchange.Data.TextConverters.HtmlToRtf pConverter = new Microsoft.Exchange.Data.TextConverters.HtmlToRtf();

            System.IO.MemoryStream pSource = new System.IO.MemoryStream();
            System.IO.StreamWriter sw = new System.IO.StreamWriter(pSource);
            sw.Write(pFormattedTextNoSrcMark);
            sw.Flush();
            pSource.Seek(0, System.IO.SeekOrigin.Begin);

            System.IO.MemoryStream pDest = new System.IO.MemoryStream();

            pConverter.InputEncoding = System.Text.Encoding.UTF8;
            pConverter.Convert(pSource, pDest);

            System.IO.StreamReader sr = new System.IO.StreamReader(pDest);
            pDest.Seek(0, System.IO.SeekOrigin.Begin);
            formattedTextRtf = sr.ReadToEnd();

            sw.Close();
            sr.Close();


            ////TEST (HTML ->) RTF -> Text
            //Microsoft.Exchange.Data.TextConverters.RtfToText pConverter3 = new Microsoft.Exchange.Data.TextConverters.RtfToText();
            //System.IO.MemoryStream pSource3 = new System.IO.MemoryStream();
            //System.IO.StreamWriter sw3 = new System.IO.StreamWriter(pSource3);
            //sw3.Write(pFormattedText);
            //sw3.Flush();
            //pSource3.Seek(0, System.IO.SeekOrigin.Begin);

            //System.IO.MemoryStream pDest3 = new System.IO.MemoryStream();

            //pConverter3.OutputEncoding = System.Text.Encoding.UTF8;
            //pConverter3.Convert(pSource3, pDest3);

            //System.IO.StreamReader sr3 = new System.IO.StreamReader(pDest3);
            //pDest3.Seek(0, System.IO.SeekOrigin.Begin);

            //string pPlainTextFromRTF = sr3.ReadToEnd();
            //sw3.Close();
            //sr3.Close();




        }


        public static string RemoveWhiteSpaces(string decode)
        {
            try
            {
                //Remove \t and \n from input string
                decode = decode.Replace("\n", "");
                decode = decode.Replace("\t", "");

                var htmlDoc = LoadDocument(decode);
                if (htmlDoc != null)
                {
                    if (htmlDoc.DocumentNode != null)
                    {
                        var xPath = "//body//text()"; // this catches all nodes with text
                        var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                        if (nodes != null && nodes.Count > 0)
                        {

                            Regex end = new Regex(@"(\s|&nbsp;)+$");
                            foreach (var node in nodes)
                            {
                                var text = node.InnerHtml;

                                //Only if there is no next sibling or the next sibling is BR remove white space from end
                                if (node.NextSibling == null || (node.NextSibling != null && node.NextSibling.Name == "br"))
                                {
                                    //End     (\s|&nbsp;)+$
                                    text = end.Replace(text, "");
                                }

                                //Only if there is no previous sibling or the previous sibling is BR remove white space from beginning
                                if (node.PreviousSibling == null || (node.PreviousSibling != null && node.PreviousSibling.Name == "br"))
                                {

                                    //Trim start
                                    int lastIndex = 0;
                                    int countOfSpaces = 0;
                                    for (int i = 0; i < text.Length; i++)
                                    {
                                        if (text[i] != ' ')
                                        {
                                            //Check if it is &nbsp;
                                            if (text.Length > i + 5)
                                            {
                                                if (text.Substring(i, 6) == "&nbsp;")
                                                {
                                                    i += 5;
                                                }
                                                else
                                                {
                                                    break;
                                                }
                                            }
                                            else
                                            {
                                                break;
                                            }
                                        }
                                        else
                                        {
                                            countOfSpaces++;
                                            lastIndex = i + 1;
                                        }
                                    }
                                    if (countOfSpaces > 0)
                                    {
                                        var pomText = text.Substring(0, lastIndex);
                                        pomText = pomText.Replace(" ", string.Empty);
                                        text = text.Remove(0, lastIndex);
                                        text = pomText + text;
                                    }

                                }

                                //Remove current node and add new Text node with needed text
                                node.ParentNode.ReplaceChild(HtmlTextNode.CreateNode(text), node);
                            }

                        }
                    }
                }

                return htmlDoc.DocumentNode.OuterHtml;
            }
            catch (Exception)
            {
                return "";
            }
        }
        public static string ReplaceWithO(string html)
        {
            try
            {

                var htmlDoc = LoadDocument(html);
                if (htmlDoc != null)
                {
                    if (htmlDoc.DocumentNode != null)
                    {
                        var xPath = "//body//text()"; // this catches all nodes with text
                        var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                        if (nodes != null && nodes.Count > 0)
                        {
                            foreach (var node in nodes)
                            {
                                var text = EncodeString(node.InnerHtml);
                                text = RemoveDiacritics(text);

                                //Replace every character with o
                                var newText = "";
                                var length = text.Length;
                                for (int i = 0; i < length; i++)
                                {
                                    newText += "o";
                                }

                                //Remove current node and add new Text node with needed text
                                node.ParentNode.ReplaceChild(HtmlTextNode.CreateNode(newText), node);
                            }

                        }

                        return htmlDoc.DocumentNode.OuterHtml;
                    }
                }
            }
            catch { }

            return "";
        }

        public static string TwoWhiteSpacesBetweenBrAndDiv(string html)
        {
            try
            {
                var htmlDoc = LoadDocument(html);
                if (htmlDoc != null)
                {
                    if (htmlDoc.DocumentNode != null)
                    {
                        var xPath = "//br"; // this catches all nodes with text
                        var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                        
                        if (nodes != null && nodes.Count > 0)
                        {
                            foreach (var node in nodes)
                            {

                                //Only if there is next sibling </div>
                                if (node.NextSibling != null && node.NextSibling.Name == "#text" 
                                    && node.NextSibling.NextSibling == null && node.ParentNode.Name.ToUpper() == "DIV")
                                {

                                    var text = node.NextSibling.InnerText;
                                    //Check if the #text has zero or one white spaces
                                    if (node.NextSibling.InnerText == "" || node.NextSibling.InnerText == " "
                                        || node.NextSibling.InnerText == "&nbsp;")
                                    {

                                        //Chage next sibling (#text) to have 2 spaces
                                        text = "&nbsp;&nbsp;";
                                    }

                                    //Remove next node (#text) and add new Text node with needed text
                                    node.ParentNode.ReplaceChild(HtmlTextNode.CreateNode(text), node.NextSibling);
                                }
                                else if (node.NextSibling == null && node.ParentNode.Name.ToUpper() == "DIV")
                                {
                                    node.ParentNode.AppendChild(HtmlTextNode.CreateNode("&nbsp;&nbsp;"));
                                }
                            }
                        }

                        return htmlDoc.DocumentNode.OuterHtml;
                    }
                }
            }
            catch { }

            return "";
        }

        private static string RemoveDiacritics(string text)
        {
            string formD = text.Normalize(NormalizationForm.FormD);
            StringBuilder sb = new StringBuilder();

            foreach (char ch in formD)
            {
                UnicodeCategory uc = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (uc != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(ch);
                }
            }

            return sb.ToString().Normalize(NormalizationForm.FormC);
        }

        private static string EncodeString(string input)
        {
            byte[] byteInput = UTF8Encoding.Convert(Encoding.ASCII, Encoding.UTF8, ASCIIEncoding.UTF8.GetBytes(input));
            input = ASCIIEncoding.UTF8.GetString(byteInput);

            StringWriter writer = new StringWriter();
            System.Net.WebUtility.HtmlDecode(input, writer);

            return writer.ToString();
        }

        public static string GetFirstBlockOfText(string html)
        {
            try
            {
                var htmlDoc = LoadDocument(html);
                if (htmlDoc != null)
                {

                    if (htmlDoc.DocumentNode != null)
                    {
                      var xPath = "//body//text()"; // this catches all nodes with text
                        var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                        if (nodes != null && nodes.Count > 0)
                        {
                            return nodes[0].InnerText;
                        }
                    }
                }
            }
            catch { }

            return "";
        }


        public static string ChangeTagStyle(string html)
        {
            var htmlDoc = LoadDocument(html);
            if (htmlDoc != null)
            {

                if (htmlDoc.DocumentNode != null)
                {
                    IEnumerable<HtmlNode> aTags = htmlDoc.DocumentNode.Descendants("a");
                    foreach (var item in aTags)
                    {
                        item.Attributes.Add("target", "_blank");
                        item.Attributes.Add("class", "previewMainATag");
                    }
                }

                return htmlDoc.DocumentNode.OuterHtml;
            }
            return html;
        }
    
    
    
    }

}
