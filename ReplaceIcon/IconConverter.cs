using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReplaceIcon
{
    public static class IconConverter
    {
        public static int[] GetRTFImgPositions(string html)
        {
            var positions = new List<int>();

            var htmlDoc = LoadDocument(html);
            if (htmlDoc != null)
            {
                if (htmlDoc.DocumentNode != null)
                {
                    var body = htmlDoc.DocumentNode.SelectSingleNode("//body");
                    var nodes = body.Descendants().ToList();
                    if (nodes != null && nodes.Count > 0)
                    {
                        var currentOffset = 0;
                        foreach (var node in nodes)
                        {
                            if (node.NodeType == HtmlNodeType.Text)
                            {
                                currentOffset += node.InnerText.Length;
                            }
                            else if (node.NodeType == HtmlNodeType.Element && node.Name == "img")
                            {
                                //Check if this is the image we need, and if yes add position to the array
                                if (node.OuterHtml == "<img src=\"rtfimage://\">")
                                {
                                    positions.Add(currentOffset);
                                }
                            }
                        }
                    }
                }
            }

            return positions.ToArray();
        }

        public static string ApplyPositions(string html, int[] positions)
        {
            if (positions.Length > 0)
            {
                var imgHtml = "<img src=\"rtfimage://\">";

                //Sort array
                Array.Sort(positions);
                var currentIndex = 0;

                while (currentIndex < positions.Length && positions[currentIndex] < 0)
                {
                    currentIndex++;
                }

                var numberOfMinusOneElements = currentIndex;

                var currentOffset = 0;
                var htmlDoc = LoadDocument(html);
                if (htmlDoc != null)
                {
                    if (htmlDoc.DocumentNode != null)
                    {
                        var body = htmlDoc.DocumentNode.SelectSingleNode("//body");
                        var nodes = body.Descendants().ToList();

                        if (currentIndex < positions.Length)
                        {
                            var nextOffset = positions[currentIndex];

                            if (nodes != null && nodes.Count > 0)
                            {
                                foreach (var node in nodes)
                                {
                                    if (node.NodeType == HtmlNodeType.Text)
                                    {
                                        if (nextOffset <= currentOffset + node.InnerText.Length)
                                        {
                                            var pos = nextOffset - currentOffset;
                                            var parentNode = node.ParentNode;

                                            node.ParentNode.ReplaceChild(HtmlTextNode.CreateNode(node.InnerText.Substring(0, pos)), node);

                                            //Append img tag
                                            parentNode.AppendChild(HtmlNode.CreateNode("<img src=\"rtfimage://\">"));

                                            //Appent the rest of the text from this text node
                                            parentNode.AppendChild(HtmlTextNode.CreateNode(node.InnerText.Substring(pos)));

                                            //Set index to next element in array
                                            currentIndex++;
                                            if (currentIndex < positions.Length)
                                            {
                                                //Get the next element from array
                                                nextOffset = positions[currentIndex];
                                            }
                                            else
                                            {
                                                //Looped over all elements in positions array
                                                break;
                                            }
                                        }
                                        currentOffset += node.InnerText.Length;
                                    }
                                }
                            }
                        }

                        if (numberOfMinusOneElements > 0)
                        {
                            //Find the last text element
                            HtmlNode lastTextNode = null;
                            for (int i = nodes.Count - 1; i > -1; i--)
                            {
                                if (nodes[i].NodeType == HtmlNodeType.Text)
                                {
                                    lastTextNode = nodes[i];
                                    break;
                                }
                            }

                            if (lastTextNode != null)
                            {
                                var parentNode = lastTextNode.ParentNode;
                                if (parentNode != null)
                                {
                                    if (parentNode.Name != "body")
                                    {
                                        parentNode = parentNode.ParentNode;
                                        //If the current tag doesnt have parent tag then append it to the end of the body
                                        if (parentNode == null)
                                        {
                                            //Set it to the closing body tag
                                            parentNode = htmlDoc.DocumentNode.SelectSingleNode("//body");
                                        }
                                    }
                                }
                                else
                                {
                                    parentNode = htmlDoc.DocumentNode.SelectSingleNode("//body");
                                }

                                //Add n img elements at the end of last text element
                                for (int i = 0; i < numberOfMinusOneElements; i++)
                                {

                                    parentNode.AppendChild(HtmlNode.CreateNode("<img src=\"rtfimage://\">"));
                                }
                            }
                        }
                    }
                    return htmlDoc.DocumentNode.OuterHtml;
                }
            }
            return "";
        }




        public static HtmlDocument LoadDocument(string html)
        {
            HtmlDocument htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(html);
            // ParseErrors is an ArrayList containing any errors from the Load statement
            if (htmlDoc.ParseErrors != null && htmlDoc.ParseErrors.Count() > 0)
            {
                return null;
            }
            else
            {
                return htmlDoc;
            }
        }
    }
}
