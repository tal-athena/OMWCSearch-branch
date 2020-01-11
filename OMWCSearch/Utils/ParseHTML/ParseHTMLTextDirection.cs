using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace OMWCSearch.Utils
{
    public class ParseHTMLTextDirection : ParseHTMLDoc
    {
        bool markDirectionsDone = false;
        bool firstNodeRTL = false;
        bool firstNodeRTLFound = false;

        //public ParseHTMLTextDirection(IParseHTMLDoc parseHTMLDoc, string htmlText)
        public ParseHTMLTextDirection(string htmlText)
            : base(htmlText)
        {
        }

        #region "Private methods"


        private bool IsAnyCharacterRightToLeft(string text)
        {
            Regex r = new Regex(@"\p{IsArabic}|\p{IsHebrew}");
            if (r.IsMatch(text))
            {
                return true;
            }
            return false;
        }

        /// <summary>
        ///  Elements that are children of body that have hebrew / arabic text should be wrapped with <div dir="rtl">...</div>
        ///  Elements that are children of body that don't have hebrew / arabic should be wrapped with <div dir="ltr">...<div>
        /// </summary>
        private void MarkDirection()
        {
            if (htmlDoc.DocumentNode != null && !markDirectionsDone)
            {
                var xPath = "//body/*"; // this catches all children nodes from body element on first level
                var nodes = htmlDoc.DocumentNode.SelectNodes(xPath);
                if (nodes == null)
                {
                    HtmlNode node = htmlDoc.DocumentNode;
                    WrapElementWithDirectionDiv(node);
                }
                else
                {
                    MarkDivDirection(htmlDoc.DocumentNode.SelectSingleNode("//body"));
                    markDirectionsDone = true;
                }
            }
        }

        private void MarkDivDirection(HtmlNode htmlNode)
        {
            var allChildren = htmlNode.Descendants().Where(p => p.NodeType == HtmlNodeType.Element).ToList();
            var divChildren = htmlNode.Descendants("DIV").ToList();
            //If the length of allChildren and divChildren is the same that means there are only DIV-s children
            //If the length of divChildren` is 0 that means there are NO DIV-s
            //Else, some of them are DIV-s, loop over them

            if (divChildren.Count == 0)
            {
                //There are NO only DIV-s, mark this one
                //WrapElementWithDirectionDiv(htmlNode);
                SetDirectionOnDiv(htmlNode);
            }
            else if (divChildren.Count == allChildren.Count)
            {
                foreach (HtmlNode node in divChildren)
                {
                    if (CheckDIV(node))
                    {
                        MarkDivDirection(node);
                    }
                }
            }
            else
            {
                //Wrap this element and continue with looping over DIV-s
                // WrapElementWithDirectionDiv(htmlNode);
                SetDirectionOnDiv(htmlNode);
                //Continue with iterations
                foreach (HtmlNode node in divChildren)
                {
                    if (CheckDIV(node))
                    {
                        MarkDivDirection(node);
                    }
                }
            }
        }

        private static bool CheckDIV(HtmlNode node1)
        {
            return node1.OriginalName == "DIV" || node1.OriginalName == "div";
        }

        private void SetDirectionOnDiv(HtmlNode node)
        {
            if (CheckDIV(node))
            {
                var rtl = IsAnyCharacterRightToLeft(node.InnerText);

                if (rtl)
                {
                    //<div dir="rtl">
                    node.SetAttributeValue("dir", "rtl");
                }
                else
                {
                    //<div dir="ltr">
                    node.SetAttributeValue("dir", "ltr");
                }

                if (!firstNodeRTLFound)
                {
                    firstNodeRTLFound = true;
                    firstNodeRTL = rtl;
                }
            }
        }

        private void WrapElementWithDirectionDiv(HtmlNode node)
        {
            if (CheckDIV(node))
            {

                HtmlNode theParent = node.ParentNode;

                HtmlNode newElement = htmlDoc.CreateElement("div");
                //Append current element
                newElement.AppendChild(node);

                var rtl = IsAnyCharacterRightToLeft(node.InnerText);

                if (rtl)
                {
                    //<div dir="rtl">
                    newElement.SetAttributeValue("dir", "rtl");
                }
                else
                {
                    //<div dir="ltr">
                    newElement.SetAttributeValue("dir", "ltr");
                }
                if (theParent != null)
                {
                    //Replace node
                    theParent.ReplaceChild(newElement, node);
                }
                else if (rtl)//If it is only text and rtl then wrap it with div element
                {
                    node.InnerHtml = newElement.OuterHtml;
                }

                if (!firstNodeRTLFound)
                {
                    firstNodeRTLFound = true;
                    firstNodeRTL = rtl;
                }
            }
        }

        #endregion



        #region "Public methods"



        /// <summary>
        ///  If first element in the doc is rtl then CKEditor should be set up as rtl, otherwise not
        /// </summary>
        /// <returns>True/False value showing is the text right to left or left to right</returns>
        public bool IsRightToLeft()
        {
            firstNodeRTLFound = false;
            //Check if the text is right to left
            
            MarkDirection();

            return firstNodeRTL;
        }

        #endregion



    }
}
