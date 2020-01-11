using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ReplaceIcon
{
    class Program
    {
        static void Main(string[] args)
        {

            string html1Pos = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 </div><img src=\"rtfimage://\"><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"></span></font></div></span></font></body></html>";
            var positions1 = IconConverter.GetRTFImgPositions(html1Pos);

            string html2Pos = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 </div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"><img src=\"rtfimage://\"></span></font></div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\">abcdef</span><img src=\"rtfimage://\"><img src=\"rtfimage://\"></font></div></span></font></body></html>";
            var positions2 = IconConverter.GetRTFImgPositions(html2Pos);

            string html3Pos = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123<img src=\"rtfimage://\">456 </div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"></span></font></div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\">abcdef</span></font></div></span></font></body></html>";
            var positions3 = IconConverter.GetRTFImgPositions(html3Pos);



            string html1Start = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 </div><div></div></span></font></body></html>";
            string html1End = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 <img src=\"rtfimage://\"></div><div></div></span></font></body></html>";
            int[] pos1 = new int[1] { -1 };
            var newHtml1 = IconConverter.ApplyPositions(html1Start, pos1);


            string html2Start = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 </div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"><img src=\"rtfimage://\"></span></font></div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\">abcdef</span></font></div></span></font></body></html>";
            string html2End = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 </div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"><img src=\"rtfimage://\"></span></font></div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\">abcdef</span><img src=\"rtfimage://\"><img src=\"rtfimage://\"></font></div></span></font></body></html>";
            int[] pos2 = new int[2] { -1, -1 };
            var newHtml2 = IconConverter.ApplyPositions(html2Start, pos2);


            string html3Start = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123456 </div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"></span></font></div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\">abcdef</span></font></div></span></font></body></html>";
            string html3End = "<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"><meta name=\"Generator\" content=\"Microsoft Exchange Server\"><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=\"Arial\" size=\"3\"><span style=\"font-size:13pt;\"><div>123<img src=\"rtfimage://\">456 </div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\"></span></font></div><div><font face=\"Segoe UI\" size=\"2\"><span style=\"font-size:10pt;\">abcdef</span></font></div></span></font></body></html>";
            int[] pos3 = new int[1] { 3 };
            var newHtml3 = IconConverter.ApplyPositions(html3Start, pos3);
        }
    }
}
