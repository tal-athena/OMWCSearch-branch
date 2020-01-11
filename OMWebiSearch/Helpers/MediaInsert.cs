using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Xml.Linq;

namespace OMWebiSearch.Helpers
{

	public class MediaInsert
	{
		public string GetInsertMarkup()
		{
			var imageSize = 24;

			var img = BuildImage(imageSize);
			var linesContainer = BuildLinesContainer();
			var content = BuildWidgetContent(img, linesContainer);
			var root = BuildWidgetRoot(imageSize, content);

			return root.ToString();
		}

		protected XElement BuildImage(int imageSize)
		{
			var img = new XElement("img");
			img.Add(
				new XAttribute("src", "/OMWebiSearch/Content/icons/10017.png"),
				new XAttribute("width", imageSize + "px")
			);

			return img;
		}

		protected XElement BuildWidgetContent(XElement img, XElement linesContainer)
		{
			var content = new XElement("div");

			var line1Styles = new Dictionary<string, string>
			{
				{"display", "flex"},
				{"flex-direction", "row"},
				{"align-items", "flex-start"},
				{"overflow", "hidden"}
			};

			content.Add(
				new XAttribute("style", StylesToString(line1Styles))
			);

			content.Add(img);
			content.Add(linesContainer);

			return content;
		}

		protected XElement BuildWidgetRoot(int imageSize, XElement content)
		{
			var root = new XElement("div");

			root.Add(
				new XAttribute("class", "MediaInsert"),
				new XAttribute("style", GetRootStyles(100, 32, Color.Wheat)),
				new XAttribute("title", "title"),
				new XAttribute("data-iconsize", imageSize),
				new XAttribute("id", "idMediaInsert1"),
				new XAttribute("data-id", "id"),
				new XAttribute("data-recordid", "recordid"),
				new XAttribute("data-templateid", "templateid"),
				new XAttribute("data-dcmd", "1"),
				new XAttribute("data-dcmdproto", "")
			);

			root.Add(content);

			return root;
		}

		protected XElement BuildLinesContainer()
		{
			var linesContainer = new XElement("div");

			var styles = new Dictionary<string, string>
			{
				{"flex", "1"},
				{"display", "flex"},
				{"flex-direction", "column"},
				{"overflow", "hidden"}
			};

			linesContainer.Add(
				new XAttribute("style", StylesToString(styles))
			);

			linesContainer.Add(BuildLine("Line 1 content", 12));
			linesContainer.Add(BuildLine("Line 2 content", 10));
			linesContainer.Add(BuildLine("Line 3 content", 10));

			return linesContainer;
		}

		protected XElement BuildLine(string content, int fontSize)
		{
			var line1Styles = new Dictionary<string, string>
			{
				{"font-size", fontSize + "px"},
				{"display", "block" }
			};

			var line = new XElement("span",
				new XAttribute("style", StylesToString(line1Styles)))
			{
				Value = content
			};

			return line;
		}

		protected string GetRootStyles(int width, int height, Color color)
		{
			var styles = new Dictionary<string, string>
			{
				{"display", "inline-block"},
				{"user-select", "none"},
				{"overflow", "hidden"},
				{"width", width + "px"},
				{"height", height + "px"},
				{"border", "1px solid #000"},
				{"background", ColorTranslator.ToHtml(color)}
			};

			return StylesToString(styles);
		}

		protected string StylesToString(Dictionary<string, string> styles)
		{
			return String.Join("; ", styles.Select(x => x.Key + ": " + x.Value));
		}
	}
}