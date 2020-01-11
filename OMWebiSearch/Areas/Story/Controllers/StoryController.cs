using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using OMWCSearch;
using OMWCSearch.Interfaces;
using OMWCSearch.UnitTest;
using OMWSTypes;
using OMWebiSearch.Areas.Common.ActionFilters;
using OMWebiSearch.Areas.ViewModels;
using OMWebiSearch.Models;
using OMWCSearch.Utils;
using System.Web;
using System.Net;

namespace OMWebiSearch.Areas.Story.Controllers
{
    public class EditStoryController : Controller
    {
        #region Properties and fields
        private readonly INavigation _navigationService = new OMSNavigation();

        private readonly IDocumentsAccess _documentDataAccess = new FakeDataAccess();

        protected readonly ToolbarManager _toolbarManager = new ToolbarManager();

        #endregion


        #region Public Methods (actions)
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Index(string id, string viewID)
        {
            IEnumerable<OMWPaneE> navigationPanes;
            _navigationService.GetPanes(out navigationPanes);
            var model = new StoryPageViewModel
            {
                Story = GetStory(id),
                NavigationPanes = navigationPanes.ToList()

            };

            string input = @"<html><head><title></title><meta content=\""text/html; charset=utf-8\"" http-equiv=\""Content-Type\""><style type=\""text/css\"">body{font-family:'Arial'; font-size:14pt;}</style></head><body><div style=""font-family:'Arial'; font-size:14pt;""><br /><font face=""Times New Roman"" size=""3""><span style=""font-size:12pt;""><font face=""Arial"">Test 1,2,3</font></span></font><br />&nbsp;</div></body></html>";
            var r = RTFToHTML.ReplaceWithO(input);
            var twoWhiteS = RTFToHTML.TwoWhiteSpacesBetweenBrAndDiv(input);
            var input2 = @"<html><head><title></title><meta content=\""text/html; charset=utf-8\"" http-equiv=\""Content-Type\""><style type=\""text/css\"">body{font-family:'Arial'; font-size:14pt;}</style></head><body><div style=""font-family:'Arial'; font-size:14pt;""><br /><font face=""Times New Roman"" size=""3""><span style=""font-size:12pt;""><font face=""Arial"">Test 1,2,3</font></span></font><br /></div></body></html>";
            var twoWhiteS2 = RTFToHTML.TwoWhiteSpacesBetweenBrAndDiv(input2);

			//Test HTML
			//model.Story.Text = @"<html><head><meta http-equiv=""Content-Type"" content=""text/html; charset=utf-8""><meta name=""Generator"" content=""Microsoft Exchange Server""><!-- converted from rtf --><style><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --></style></head><body><font face=""Times New Roman"" size=""3""><span style=""font-size:12pt;""><div><font face=""Arial"" size=""4""><span style=""font-size:13.5pt;""><b><u>CK Texteditor V 9.99999</u></b></span></font></div><div><font face=""Comic Sans MS"" size=""4""><span style=""font-size:14pt;"">Text</span></font></div><div><font face=""Arial"" size=""4""><span style=""font-size:12pt;"">Please put your text here</span></font></div><div><font face=""Comic Sans MS"" size=""4""><span style=""font-size:12pt;"">More text</span></font></div></span></font></body></html>";
			//model.Story.Text = @"<html><head> <title></title> <meta content=""text/html; charset=utf-8"" http-equiv=""Content-Type"" /> <meta content=""Microsoft Exchange Server"" name=""Generator"" /><!-- converted from rtf --> <style type=""text/css""><!-- <!-- .EmailQuote { margin-left: 1pt; padding-left: 4pt; border-left: #800000 2px solid; } --> --> </style> <style type=""text/css"">body{font-family:'Arial'; font-size:22pt;} </style> <style type=""text/css"">body{font-family:'Arial'; font-size:22pt;} </style></head><body><span style=""font-size:12pt;""><font face=""Arial"">Some text</font></span></body></html>";

			model.Story.Text = @"<html><head>	<title></title>	<meta content=""text/html; charset=utf-8"" http-equiv=""Content-Type"" />	<meta content=""Microsoft Exchange Server"" name=""Generator"" /><!-- converted from rtf -->	<style type=""text/css"">body{font-family:'Arial'; font-size:10pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is an image, that should be opened: <img alt="""" class=""OMInsert"" data-id=""PDIsNDQ1ODMsOTczZDRiY2MtM2QwNi00MzkxLTlhZmItNGI1NWNhNjA0ZTEzPg==#"" height=""20"" id=""19urn"" src=""/OMWebiSearch/Content/icons/10017.png"" title=""AUDIO"" width=""20"" /></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is an image that should NOT be opened: <img alt="""" height=""20"" id=""19urn"" src=""http://localhost:55888/OMWebiSearch/Content/Images/search-icon-20x20.png"" data-dcmd=""true"" data-id=""PDIsMjM3MDYsNTQ1MTA1ZWMtNjNjMy00ZmY0LTkwMjQtZTVlNjA2MzBlMDY5Pg=="" title=""AUDIO"" width=""20"" /></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is hyperlink:<br /><a href=""https://www.google.com/""><font color=""#666666"" size=""2""><span style=""font-size:10pt;""><u>Use Google.com</u></span></font></a><br />&nbsp;</span></font></div><div>This is an image that should NOT be opened</div><div> This is an image that should NOT be opened</div><div>This is an image that should NOT be opened</div></body></html>";
			/*model.Story.Text = @"<html><head>	<title></title>	<meta content=""text/html; charset=utf-8"" http-equiv=""Content-Type"" />	<meta content=""Microsoft Exchange Server"" name=""Generator"" /><!-- converted from rtf -->	<style type=""text/css"">body{font-family:'Arial'; font-size:10pt;}	</style></head><body><div style=""color: orange"">Lorem ipsum dolor sit amet, sea eu iusto convenire. Detracto prodesset ea duo, elitr ubique ut quo. Vidit hendrerit his et, an vidit ludus noster per. Prima mazim posidonium te mel. Id omnium regione iracundia nec, ignota disputando reformidans his ex.
Elitr aeterno nusquam cu sea. Ad vim populo dolorem. Vide assum voluptatum ei per, te nam eripuit commune. In vix soleat soluta iriure. Sea eros probo cu, verear insolens his id, inani inermis suavitate an mei. Duo partiendo suavitate tincidunt cu.
Percipit iudicabit sea no, ei mel unum tollit patrioque. Eam omnium epicuri iudicabit cu, te per phaedrum appellantur. Vel altera discere theophrastus at, cu nullam fierent pri. In per veniam atomorum omittantur, ad mei incorrupte sadipscing scriptorem. His cu hinc unum homero, esse error vel an, quodsi conceptam an duo.
Iriure maluisset has et, cum choro vidisse fabulas id, cu sonet facete officiis duo. Ea rebum ipsum percipitur sit, ne nec omnes decore iriure, augue fastidii albucius sea an. Sit an eros evertitur. Vero putent te pri, pro ei mucius iuvaret volumus. Omnesque hendrerit nec cu.
No omnes euismod consetetur quo. Duo ea legere doming adipiscing. Ex postea labitur deleniti eum, commodo quaerendum et vis. In nam evertitur adipiscing moderatius. Iusto causae fabulas sed no, feugiat sadipscing ullamcorper sea an. Vim suscipit luptatum accusata ea.</div>
Mundi graeci ut duo, nec an ludus alterum argumentum. Ex sea percipit tractatos, duo et discere dolorem. Ne vix magna definiebas vituperatoribus. Ullum ornatus contentiones ius an, in habeo sonet utroque nam.
Id munere aliquam accommodare pri, ex adolescens intellegam ius.
<div style=""text-decoration: underline"">Et dicit facilisi eos, nibh omnis suavitate no nec. Id deserunt incorrupte ius. Facilis legendos pertinax ut per. Eu eum regione nominati cotidieque, vim no timeam mentitum.
Viderer facilis moderatius mel ex, vix accumsan pertinacia in, quo nonumes fastidii gloriatur id. Te quando scriptorem vis, cetero consequuntur mel te, his error meliore ei. Id utamur theophrastus vim. Agam maluisset liberavisse nec et, an pro vidit option.
Fugit harum invenire pri te, sea amet erroribus ad. Sed diam simul splendide ei, te cetero propriae perfecto mei, eum cu congue voluptatibus. Ius nihil minimum consulatu in, solet neglegentur vim ei. Elitr antiopam ex duo, cu tota verterem tacimates vim. Id nullam possit epicuri pro.
Ut eam essent vidisse iudicabit, id semper eripuit has. An probo omittantur reformidans has, mel id errem simul gloriatur, est ad reque denique gloriatur. Habeo expetendis disputationi vim ex. Et vide euismod eam. Altera corpora pro ex, modus facilisi vituperata ad eam. Ex meliore adipisci definitiones mea, eu ceteros reprehendunt nec, usu ne regione definitiones.
Illum malis atqui quo te, ius idque officiis te.
<div style=""font-weight: bold"">Te placerat splendide forensibus usu. Summo torquatos sit et. Nulla maluisset evertitur quo cu. Solum salutatus forensibus vix id.
Case veri per te. Sanctus nusquam recusabo an sea. Has ne discere admodum, legere postulant ad mel, eam volutpat appellantur ut. Ut nam esse case exerci. Vim legimus accusam eu, vel verear aliquam eleifend ea.
Vim ei dolor appareat oporteat.</div>Et eum habeo iusto civibus, perfecto assentior cu pro. Eam ne laboramus incorrupte, impetus tibique facilisis in sea. Ius eu purto viderer petentium, et agam nominati postulant per. Id purto dolores tractatos sit. Sed quas soleat ex, eam eu unum dicit facilisi, ne ius purto debitis denique.
Cum id detracto praesent partiendo, justo reformidans ad cum, nec no omnium iriure reprehendunt. Velit convenire similique eos ad. Ea pri homero soleat sadipscing, nisl nobis efficiendi cum ea. Quando erroribus ea sed, odio feugiat facilisis sit eu.
Aeque oblique his at, mel tritani mediocrem ea, ad gubergren reprehendunt est. Ei velit impedit eos, cum ei erant alterum oportere. Ea zril quidam detracto usu, platonem explicari mnesarchum mel in, ut cum eros summo consul. In nec antiopam pertinacia mnesarchum, everti fierent suscipiantur eu duo.
Enim laudem ea has. Dicam debitis nusquam id quo, verterem pertinacia definitionem te sea, accumsan dignissim scriptorem in est. Liber scribentur ullamcorper cum eu, eu primis definitionem mei. Deleniti appareat sensibus sit et, sed semper oporteat eu, qui mucius dignissim vituperata ut. Ne paulo laudem lobortis quo, at cum esse percipitur, lorem audiam an vis. Nam postea vidisse ne, no maiorum facilisis sed, wisi utinam vulputate cum eu.
Ipsum tamquam disputando est an, est ut percipit mediocritatem. No similique conceptam dissentiet nam, sea in homero laoreet oporteat. Cu suas tincidunt pri. Ei laudem similique cum, has prompta suscipit gubergren ei.
Quo an tale stet fabellas, vim affert sanctus epicurei ei, et liber facete noluisse eum. Eos ex cibo fabulas vulputate, vocibus praesent qui ne, at eos illud essent expetendis. At vix dicta percipit imperdiet. Meliore probatus te duo. Usu ex debet facete virtute, mundi mediocrem sea an, dico omittam ea vix. Pro at exerci adolescens, habeo assum mea te. Mediocrem complectitur in cum.
Ignota everti ne has, vivendum efficiantur ea sed. Atqui mucius corrumpit te cum, in iisque dolores oportere sed, id qui ceteros volutpat persecuti. Utinam consulatu pri no, omnium eleifend conclusionemque nec an. Illud option mnesarchum cu sea. Diam quaeque sanctus ut eam.
Est deleniti convenire ei, ea menandri eloquentiam his, cu fugit virtute ocurreret sed. Nec dolorum reprimique id. In nonumy facilis mediocritatem sea, nec quem liber solet ex. Quo erant aliquando te, fierent suscipiantur est ea, duis suavitate intellegat id eam.
Eu nam modus dicunt. Munere dolore platonem ei pri, copiosae imperdiet at pro. Aeterno sensibus intellegam ei mel, nobis invidunt eu eos, mei an tale perpetua deterruisset. Et per oratio mandamus posidonium, usu altera vidisse principes an. Ea oblique platonem reprehendunt sea, eos sonet exerci ne.
Aeque interesset ea sed, pri malis accusata no. Ut sed platonem reprehendunt, admodum disputationi ea his. Vel an phaedrum scribentur, dicit corpora vis an, nemore corrumpit maiestatis ex nam. Accusamus disputationi et vim, cum scaevola placerat ei.
Quod dignissim eu vim, ei option utroque cum, eos ut cetero reformidans. Vidisse scaevola appellantur vim ea, utroque officiis repudiare eam te. Id ius mollis delectus, eu pri utinam semper delicata, at verterem appellantur mei. Ex cetero iudicabit maiestatis vel. Timeam dissentiet et nam, te sit impetus vivendum.</div></body></html>";*/

			var testStory = @"<html><head>    <title></title>    <meta content='text/html; charset=utf-8' http-equiv='Content-Type' />    <meta content='Microsoft Exchange Server' name='Generator' /><!-- converted from rtf -->    <style type='text/css'>        <!-- <!--        .EmailQuote {            margin-left: 1pt;            padding-left: 4pt;            border-left: #800000 2px solid;        }        --> -->    </style>    <style type='text/css'>        body {            font-family: 'Arial';            font-size: 22pt;        }    </style>    <style type='text/css'>        body {            font-family: 'Arial';            font-size: 22pt;        }    </style>    <style type='text/css'>        body {            font-family: 'Arial';            font-size: 12pt;        }    </style></head><body>    <p style='font-family:""arial""; font-size:12pt;'>        <span style='font-size:12pt;'>            <font face='Arial'>Some text</font>        </span>    </p>    <p style='font-family:""arial""; font-size:12pt;'>        <span style='font-size: 15.5555562973022px;'>SOme more text</span>        <span style='font-size : 15px;'>SOme more text</span>   <img src=""/OMWebiSearch/Content/Images/search-icon-20x20.png"" />     <span style='font-size:23px'>Simpe text</span>    <img src=""/OMWebiSearch/Content/Images/10.png"" data-dcmd=""true"" />    <span style='font-size:23px;margin-top:12px;'>SOme more text</span>    </p></body></html>";

            var newSizes = RTFToHTML.ChangePoints2Pixels(testStory);


            //Get font size and style from story html
            var html = model.Story.Text;
            var fontStyle = RTFToHTML.GetLastFontType(html);
            //var fontSize = RTFToHTML.GetLastFontSize(html);
            var xPathFontSize = RTFToHTML.GetLastFontSizeXPath(html);
            //var xPathFontStyle = RTFToHTML.GetLastFontTypeXPath(html);
            ViewBag.fontFace = fontStyle;
            ViewBag.fontSize = xPathFontSize;



            //Check if text is RTL, testing cases
            //model.Story.isHTML = false;
            //model.Story.Text = "العربية";//Arabic
            //model.Story.Text = "עברית";//Hebrew

            //model.Story.Text = @"<html><head>	<title></title>	<meta content=""text/html; charset=utf-8"" http-equiv=""Content-Type"" />	<meta content=""Microsoft Exchange Server"" name=""Generator"" /><!-- converted from rtf -->	<style type=""text/css"">body{font-family:'Arial'; font-size:10pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">العربيةThis is an image that should be opened: <img alt="""" class=""OMInsert"" data-id=""PDIsNDQ1ODMsOTczZDRiY2MtM2QwNi00MzkxLTlhZmItNGI1NWNhNjA0ZTEzPg==#"" height=""20"" id=""19urn"" src=""/OMWebApp/Content/icons/10017.png"" title=""AUDIO"" width=""20"" /></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is an image that should NOT be opened: <img alt="""" height=""20"" id=""19urn"" src=""/OMWebApp/Content/icons/10017.png"" title=""AUDIO"" width=""20"" /></span></font></div><div style=""font-family:'Arial'; font-size:10pt;""><font face=""Arial"" size=""4""><span style=""font-size:14pt;"">This is hyperlink:<br /><a href=""https://www.google.com/""><font color=""#666666"" size=""2""><span style=""font-size:10pt;""><u>Use Google.com</u></span></font></a><br />&nbsp;</span></font></div></body></html>";
            //model.Story.isHTML = true;







            //FOR TESTING ONLY
            model.Story.isHTML = true;

            // model.Story.Text = @"<html><head>	<title></title>	<!--.EmailQuote	{margin-left:1pt;	padding-left:4pt;	border-left:#800000 2px solid}-->	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:12pt;"">&nbsp;</div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font face=""Segoe UI"">מטריצה ניתנת ל<a href=""https://he.wikipedia.org/wiki/לכסון_מטריצות""><font color=""#5A3696""><u>לכסון</u></font></a> <a href=""https://he.wikipedia.org/wiki/אם_ורק_אם""><font color=""#5A3696""><u>אם ורק אם</u></font></a> הפולינום האופייני שלה מתפרק לגורמים לינאריים מעל השדה, והריבוי האלגברי של כל ערך עצמי שלה שווה לריבוי הגאומטרי שלו. בפרט, אם כל הערכים העצמיים שונים זה מזה, המטריצה לכסינה.</font></span></font></div><ul>	<li><font face=""Times New Roman"" size=""3""><span><font color=""#252525"" face=""sans-serif"" size=""2"">את השם &quot;וקטור עצמי&quot; לרוב רושמים כקיצור בתור ו&quot;ע. כמו כן ע&quot;ע עבור &quot;ערך עצמי&quot;.<font color=""black"" face=""Times New Roman"" size=""3""><span> </span></font></font></span></font></li></ul><div style=""font-family:'Arial'; font-size:12pt;"">&nbsp;</div><div style=""font-family:'Arial'; font-size:12pt;"">&nbsp;</div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font color=""#252525"" face=""sans-serif"" size=""2""><span>In general, if <img src=""https://upload.wikimedia.org/math/2/7/5/275dc431f9270317c68595220d6b8730.png"" /> are not all zeros, the vectors <img src=""https://upload.wikimedia.org/math/9/e/3/9e3669d19b675bd57058fd4664205d2a.png"" /> and <img src=""https://upload.wikimedia.org/math/a/d/2/ad2697c1f984904631df093d9a8b0360.png"" /> will not be parallel. When they <i>are</i> parallel (that is, when there is some real number <img src=""https://upload.wikimedia.org/math/e/0/5/e05a30d96800384dd38b22851322a6b5.png"" /> such that <img src=""https://upload.wikimedia.org/math/d/a/3/da3ae989b4475b7e0343aad33cc51d8d.png"" />) we say that <img src=""https://upload.wikimedia.org/math/9/e/3/9e3669d19b675bd57058fd4664205d2a.png"" /> is an<b>eigenvector</b> of <img src=""https://upload.wikimedia.org/math/7/f/c/7fc56270e7a70fa81a5935b72eacbe29.png"" />. In that case, the scale factor <img src=""https://upload.wikimedia.org/math/e/0/5/e05a30d96800384dd38b22851322a6b5.png"" /> is said to be the <b>eigenvalue</b> corresponding to that eigenvector.<br /><br />In particular, multiplication by a 3&times;3 matrix <img src=""https://upload.wikimedia.org/math/7/f/c/7fc56270e7a70fa81a5935b72eacbe29.png"" /> may change both the direction and the magnitude of an arrow <img src=""https://upload.wikimedia.org/math/9/e/3/9e3669d19b675bd57058fd4664205d2a.png"" /> in three-dimensional space.</span></font></span></font><br />&nbsp;</div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font color=""#222222"" face=""Open Sans Hebrew"" size=""4""><span>אתמול דיבר מפכ&quot;ל המשטרה יוחנן דנינו במרכז הבינתחומי בהרצליה, והתייחס להעברת הפרשה לידי המשטרה. &quot;אני מבין שהחומר עבר ליועץ המשפטי לממשלה. מי שצריך להחליט אם תהיה חקירה זה היועמ&quot;ש, ואמחנו ממתינים להחלטה. אני יכול לומר שאם תתקבל החלטה כזו, משטרת ישראל תתמודד איתה ותחקור ללא מורא ובמקצועיות. הוכחנו בעבר שאנחנו יודעים להתמודד עם כל חקירה רגישה ככל שתהיה&quot;.</span></font></span></font></div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font color=""#102364"" face=""Verdana"" size=""2""><span><b>Eine der gr&ouml;&szlig;ten Pers&ouml;nlichkeiten der Nachkriegszeit ist tot. Die Trainer-Legende Udo Lattek sammelte mit dem FC Bayern M&uuml;nchen und Borussia M&ouml;nchengladbach nationale wie internationale Titel. Danach blieb er dem Publikum als Fernsehexperte und Kolumnist treu. Jetzt ist Lattek im Alter von 80 Jahren gestorben.</b></span></font></span></font></div></body></html>";
            //  model.Story.Text = @"<html><head>	<title></title>	<!--.EmailQuote	{margin-left:1pt;	padding-left:4pt;	border-left:#800000 2px solid}-->	<style type=""text/css"">body{font-family:'Open Sans Hebrew'; font-size:12pt;}	</style></head><body dir=""rtl""><div style=""font-family:'Open Sans Hebrew'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font face=""Segoe UI"">I write here text.<br />&nbsp;</font></span></font></div><div style=""font-family:'Open Sans Hebrew'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font color=""#222222"" face=""Open Sans Hebrew"" size=""4""><span>צבע עורה שימש כהסוואה, גם אם היא עצמה עדיין לא ידעה אז מה הוא מסווה. כשגילתה כעבור שנים את שורשיה, נזכרה בניצולי השואה הרבים שפגשה בעת עבודתה בספרייה של מכון גתה בתל אביב. הם באו לשם מפני שרצו &quot;לדבר ולשמוע שוב גרמנית, שפת מולדתם הישנה&quot;, היא כותבת בספר. &quot;לאחדים היו קשיי ראייה ואני קראתי באוזניהם קטעי עיתונות ורומנים. על אמות ידיהם ראיתי את המספרים שקועקעו עליהן במחנות. היתה זו הפעם הראשונה שהרגשתי שמשהו לא בסדר בהשתייכותי לאומה הגרמנית, השתייכות שתובעת ממני התנצלות&quot;.</span></font></span></font><br />&nbsp;</div><div style=""font-family:'Open Sans Hebrew'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font color=""#222222"" face=""Open Sans Hebrew"" size=""4""><span>Now I write some more text.</span></font></span></font></div></body></html>";

            //model.Story.isHTML = false;
            //model.Story.Text = @"only text";
            //model.Story.Text = @"צבע עורה שימש כהסוואה,";


            //model.Story.Text = @"<html><head>	<title></title>	<!--.EmailQuote	{margin-left:1pt;	padding-left:4pt;	border-left:#800000 2px solid}-->	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style>	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style>	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style>	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:12pt;""><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font face=""Arial"">Writing some simple text. 123 456<br /><br />Now more in new line<br />Now more in new line<br />Now more in new line<br /><br />Now more in new line<br /><br /><br /><br />Now more in new line<br /><br /><br /><br /><br /><br />Now more in new line<br /><br /><br /><br /><br /><br /><br /><br />Now more in new line 12345677<br /><br />&nbsp;</font></span></font></div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><img height=""1"" src=""http://www.ynet.co.il/images/ws.gif"" width=""194"" /><br /><a href=""http://www.ynet.co.il/articles/0,7340,L-4623581,00.html""><font face=""Arial"" size=""4""><span><b>הפיטורים בכיל: עובד קיבל מכתב בזמן צנתור </b></span></font></a></span></font></div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><a href=""http://www.ynet.co.il/articles/0,7340,L-4623581,00.html""><font face=""Arial"">140 עובדי תרכובות ברום קיבלו זימונים לשימוע לפני פיטורים. המכתבים עם הבשורות הקשות הודבקו על דלתות הבתים. עובד בן 50 קיבל התקף לב מרוב לחץ. עובדי מפעלי ים המלח הצטרפו למאבק וסגרו את המפעל (חדשות) </font></a></span></font></div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font face=""Arial"">&nbsp;</font></span></font><div><span>BZVZ</span></div></div><div style=""font-family:'Arial'; font-size:12pt;"">&nbsp;</div></div></body></html>";
            //model.Story.Text = @"<html><head>	<title></title>	<!--.EmailQuote	{margin-left:1pt;	padding-left:4pt;	border-left:#800000 2px solid}-->	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style>	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style>	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style>	<style type=""text/css"">body{font-family:'Arial'; font-size:12pt;}	</style></head><body><div style=""font-family:'Arial'; font-size:12pt;""><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span>ום קיבלו זימונים ל<img height=""1"" src=""http://www.ynet.co.il/images/ws.gif"" width=""194"" /><br /><a href=""http://www.ynet.co.il/articles/0,7340,L-4623581,00.html""><font face=""Arial"" size=""4""><span><b>הפיטורים בכיל: עובד קיבל מכתב בזמן צנתור </b></span></font></a></span></font></div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><a href=""http://www.ynet.co.il/articles/0,7340,L-4623581,00.html""><font face=""Arial"">140 עובדי תרכובות ברום קיבלו זימונים לשימוע לפני פיטורים. המכתבים עם הבשורות הקשות הודבקו על דלתות הבתים. עובד בן 50 קיבל התקף לב מרוב לחץ. עובדי מפעלי ים המלח הצטרפו למאבק וסגרו את המפעל (חדשות) </font></a></span></font></div><div style=""font-family:'Arial'; font-size:12pt;""><font face=""Times New Roman"" size=""3""><span><font face=""Arial"">&nbsp;</font></span></font></div><div style=""font-family:'Arial'; font-size:12pt;"">&nbsp;</div></div></body></html>";



            var parseHTML = new ParseHTMLTextDirection(model.Story.Text);
            ViewBag.IsRTLText = parseHTML.IsRightToLeft();

            //ViewBag.IsRTLText = OMWebiSearch.Areas.Common.UIHelper.IsAnyCharacterRightToLeft(model.Story.Text, model.Story.isHTML);
            model.Story.Text = parseHTML.GetHTMLString();



            model.Story.ShowText = true;
            //model.Story.ShowText = false;
            //model.Story.ReadOnly = true;
            model.Story.ReadOnly = false;

            OMWDocumentID documentId = new OMWDocumentID(model.Story.ID.PoolID, model.Story.ID.PinnID);
            ViewBag.ToolbarButtons = _toolbarManager.GetToolbarButtonsForDocID(documentId);
            ViewBag.ToolbarComboBox = _toolbarManager.GetToolbarComboBoxItemsForDocID(documentId);
            ViewBag.ViewID = viewID;

			ViewBag.NumberOfLines = Convert.ToInt32(ConfigurationManager.AppSettings["NumberOfLines"]);
	        ViewBag.MaxFieldsPerLine = Convert.ToInt32(ConfigurationManager.AppSettings["MaxFieldsPerLine"]);
	        ViewBag.HeaderFieldsOrientation = "vertical";

			//Include header for Content-Security-Policy
			// HttpContext.Response.AppendHeader("Content-Security-Policy", "default-src 'self'");

			ViewBag.LocalStorageEnabled = Convert.ToBoolean(ConfigurationManager.AppSettings["LocalStorageEnabled"]);

			if (Request.Browser.IsMobileDevice)
            //if (true)
            {
				//ViewBag.NavigationPaneItemId = NavigationPaneItemId;
				//ViewBag.NavigationPaneId = NavigationPaneId;

				return View("MobileIndex", model);
            }
            else
            {
                return View(model);
            }

        }

	    [HttpPost]
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult GetDynamicComboValues(string fieldID, string value)
	    {
			List<string> values;
		    _documentDataAccess.GetComboFieldOptionValues(fieldID, value, out values);

		    return new JsonResult { Data = values };
	    }

	    [HttpPost]
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult GetDynamicListValues(string storyID, string fieldID)
		{
			List<string> values;
			_documentDataAccess.GetListFieldOptionValues(storyID, fieldID, out values);

			return new JsonResult { Data = values };
		}

        [HttpPost]
		[AuthenticationRequired]
		[SessionExpireFilter]
		public ActionResult GetListFieldSuggestions(string storyID, string fieldID, string value)
        {
            List<string> values;
            _documentDataAccess.GetListFieldSuggestions(storyID, fieldID, value, out values);

            return new JsonResult { Data = values };
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadStoryCommandPanel(string id)
        {
            var model = new StoryViewModel
            {
                Story = GetStory(id),
            };
            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult Stories(string id)
        {
            return new JsonResult { Data = new { story = GetStory(id) } };
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadStoryFields(string id)
        {
            var model = new StoryViewModel
            {
                StoryId = id,
                Story = GetStory(id),
            };
            return PartialView(model);
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadMobileStoryFields(string id)
        {
            var model = new StoryViewModel
            {
                StoryId = id,
                Story = GetStory(id),
            };
            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadMobileStoryReadonlyFields(string id)
        {
            var model = new StoryViewModel
            {
                StoryId = id,
                Story = GetStory(id),
            };
            return PartialView(model);
        }

        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetStoryHeader(string id)
        {
            var headers = GetStory(id).HeaderFields;
            var lst = new List<OMWNamedField>(headers);
            var daC = new List<string>();
            for (int i = 0; i < 100; i++)
            {
                daC.Add("opt" + i.ToString() + "val");
            }
            var combo2 = new OMWValueString("opt5val;opt15val;optBADONE;opt250val");
            var emptyCombo = new OMWValueString("");
            lst.Insert(1, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 999,
                FieldValue = emptyCombo,
                Label = "TEST LIST USED FOR TESTING EDIT",
                ReadOnly = false,
                RecordID = 4555,
                SelectionList = daC
            });
            lst.Insert(2, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_List,
                FieldID = 1000,
                FieldValue = emptyCombo,
                Label = "Empty list",
                ReadOnly = false,
                RecordID = 4556,
                SelectionList = daC
            });

            lst.Insert(11, new OMWNamedField()
            {
                DisplayType = EOMWFieldDisplayType.eOMFieldDisplayType_Number,
                FieldID = 2322,
                FieldValue = new OMWValueInt(3),
                ReadOnly = false,
                Label = "Number"
            });

            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetHeaderFieldValues(string id, string fieldId)
        {
            OMWNamedField field = null;

            var headerFields = GetStory(id).HeaderFields.ToList();
            for (int i = 0; i < headerFields.Count; i++)
            {
                if (headerFields[i].FieldID.ToString() == fieldId)
                {
                    field = headerFields[i];
                    break;
                }
            }

            if (field == null)
            {
				return Json(new { items = new List<string> { "Opt 1 val", "Opt 2 val", "Opt 3 val" } }, JsonRequestBehavior.AllowGet);
				//return Json(new { status = "failed", Reason = "Unknown field." }, JsonRequestBehavior.AllowGet);
			}

            //Return only 1000 items in select list
            return Json(new { items = field.SelectionList.Take(1000) }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetStoryPlainText(string id)
        {
            var story = GetStory(id);

            return Json(story, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetStoryHtmlText(string id)
        {
            var text = GetStory(id);

            return Json(text, JsonRequestBehavior.AllowGet);
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LoadStoryContent(string id)
        {
            var model = new StoryViewModel
            {
                Story = GetStory(id)
            };
            return PartialView(model);
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult KeepAlive()
        {
            return new JsonResult { Data = "OK" };
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult LockStory(string storyId, int fieldId)
        {
            var story = GetStory(storyId);
            _documentDataAccess.LockStory(OMWDocumentID.FromString(storyId), new int[] { fieldId });
            var message = new LockMessage()
            {
                status = "OK",
                message = "Story Locked by user 1",
                storyText = story.Text
            };
            return new JsonResult { Data = message };
        }

        struct LockMessage
        {
            public string status;
            public string message;
            public string storyText;
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult UnLockStory(string storyId, int fieldId)
        {
            _documentDataAccess.UnlockStory(OMWDocumentID.FromString(storyId), new int[] { fieldId });
            var message = new LockMessage()
            {
                status = "OK",
                message = "Story Unlocked by user 1"
            };
            return new JsonResult { Data = message };
        }

        [AuthenticationRequired]
        [SessionExpireFilterAjaxJsonAttribute]
        [SessionExpireFilter]
        public ActionResult SaveStory(string storyId, int fieldId, string fieldValue, bool htmlUpdated, string html)
        {
            OMWDocumentID docId = OMWDocumentID.FromString(storyId);

            OMWAStory story = new OMWAStory();
            _documentDataAccess.GetStory(docId, out story);
            OMWNamedField field = story.HeaderFields.FirstOrDefault(f => f.FieldID == fieldId);
            try
            {


                switch (field.FieldValue.ValueType)
                {
                    case EOMWDataType.eOMDataType_DateTime:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Date:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, "dd/MM/yyyy", CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Time:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueTime(DateTime.ParseExact(fieldValue, "H:mm:ss", CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Integer:
                        {
                            field.FieldValue = new OMWValueInt(int.Parse(fieldValue, CultureInfo.InvariantCulture));
                            break;
                        }
                    case EOMWDataType.eOMDataType_String:
                        {
                            field.FieldValue = new OMWValueString(fieldValue);
                            break;
                        }
                }
            }
            catch { }


            var decode = Server.UrlDecode(html);

            //Remove white spaces from lines and end of lines
            var withoutWhiteSpaces = RTFToHTML.RemoveWhiteSpaces(decode);

            var encode = Server.UrlEncode(withoutWhiteSpaces);


            _documentDataAccess.UpdateStory(docId, html, htmlUpdated, new[] { field });

            var message = new LockMessage()
            {
                status = "OK",
                message = "Story saved by user 1"
            };
            return new JsonResult { Data = message };

            // return new JsonResult() { JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }



        [AuthenticationRequired]
        [SessionExpireFilter]
        [SessionExpireFilterAjaxJsonAttribute]
        public ActionResult SaveStoryDateTime(string storyId, int fieldId, string fieldValue, string fieldFormat, bool htmlUpdated, string html)
        {

            //Changing date format
            fieldFormat = DateTimeCSJSConvert.JSToCS(fieldFormat);



            OMWDocumentID docId = OMWDocumentID.FromString(storyId);

            OMWAStory story = new OMWAStory();
            _documentDataAccess.GetStory(docId, out story);
            OMWNamedField field = story.HeaderFields.FirstOrDefault(f => f.FieldID == fieldId);
            try
            {

                //Problem with year, it have only two yy on client side, but on server side it should have 4y



                switch (field.FieldValue.ValueType)
                {
                    case EOMWDataType.eOMDataType_DateTime:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss", fieldFormat }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                // field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(fieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss", fieldFormat }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Date:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueDate(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Time:
                        {
                            if (!string.IsNullOrEmpty(fieldValue))
                            {
                                field.FieldValue = new OMWValueTime(DateTime.ParseExact(fieldValue, fieldFormat, CultureInfo.InvariantCulture));
                            }
                            break;
                        }
                    case EOMWDataType.eOMDataType_Integer:
                        {
                            field.FieldValue = new OMWValueInt(int.Parse(fieldValue, CultureInfo.InvariantCulture));
                            break;
                        }
                    case EOMWDataType.eOMDataType_String:
                        {
                            field.FieldValue = new OMWValueString(fieldValue);
                            break;
                        }
                }
            }
            catch { }

            _documentDataAccess.UpdateStory(docId, html, htmlUpdated, new[] { field });


            var message = new LockMessage()
            {
                status = "OK",
                message = "Story saved by user 1"
            };
            return new JsonResult { Data = message };
            //  return new JsonResult() { JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }


        public struct HeaderField
        {
            public int FieldID;
            public string FieldValue;
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        [HttpPost]
        public ActionResult GetNewInsert(string storyId, string HeaderFields)
        {
            List<HeaderField> headerFields = Newtonsoft.Json.JsonConvert.DeserializeObject<List<HeaderField>>(HeaderFields);

            
            string encodedFields = HttpUtility.HtmlEncode(HeaderFields);

            string img = "<img src=\"/OMWebiSearch/Content/Images/10.png\" data-header-fields=\"" + encodedFields + "\" />";
            return Content(img);
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        //public ActionResult SaveHeaderFields(string storyId, List<HeaderField> headerFields, string html, bool htmlUpdated)
        public ActionResult SaveHeaderFields(string storyId, string HeaderFields, string html, bool htmlUpdated)
        {
            OMWDocumentID docId = OMWDocumentID.FromString(storyId);
            List<HeaderField> headerFields = Newtonsoft.Json.JsonConvert.DeserializeObject<List<HeaderField>>(HeaderFields);
            OMWAStory story = new OMWAStory();
            _documentDataAccess.GetStory(docId, out story);

            foreach (var item in headerFields)
            {
                OMWNamedField field = story.HeaderFields.FirstOrDefault(f => f.FieldID == item.FieldID);
                try
                {
                    switch (field.FieldValue.ValueType)
                    {
                        case EOMWDataType.eOMDataType_DateTime:
                            {
                                if (!string.IsNullOrEmpty(item.FieldValue))
                                {
                                    field.FieldValue = new OMWValueDateTime(DateTime.ParseExact(item.FieldValue, new string[] { "dd/MM/yyyy HH:mm:ss", "M/dd/yyyy HH:mm:ss", "M/d/yyyy HH:mm:ss", "M/dd/yyyy HH:mm", "M/d/yyyy HH:mm", "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy H:mm:ss" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                }
                                break;
                            }
                        case EOMWDataType.eOMDataType_Date:
                            {
                                if (!string.IsNullOrEmpty(item.FieldValue))
                                {
                                    field.FieldValue = new OMWValueDate(DateTime.ParseExact(item.FieldValue, new string[] { "dd/MM/yyyy", "M/dd/yyyy", "M/d/yyyy" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                }
                                break;
                            }
                        case EOMWDataType.eOMDataType_Time:
                            {
                                if (!string.IsNullOrEmpty(item.FieldValue))
                                {
                                    field.FieldValue = new OMWValueTime(DateTime.ParseExact(item.FieldValue, new string[] { "H:mm:ss", "H:mm", "HH:mm", "HH:mm:ss" }, CultureInfo.InvariantCulture, DateTimeStyles.None));
                                }
                                break;
                            }
                        case EOMWDataType.eOMDataType_Integer:
                            {
                                field.FieldValue = new OMWValueInt(int.Parse(item.FieldValue, CultureInfo.InvariantCulture));
                                break;
                            }
                        case EOMWDataType.eOMDataType_String:
                            {
                                field.FieldValue = new OMWValueString(item.FieldValue);
                                break;
                            }
                    }
                }
                catch { }

                _documentDataAccess.UpdateStory(docId, html, true, new[] { field });

            }


            var message = new LockMessage()
            {
                status = "OK"
            };
            return new JsonResult { Data = message };
        }


        [AuthenticationRequired]
        [SessionExpireFilter]
        public ActionResult GetRecordIcons(string storyId)
        {
            List<OMWAStoryRecordType> recordTypes = new List<OMWAStoryRecordType>();
            _documentDataAccess.GetRecordTypes(OMWDocumentID.FromString(storyId), out recordTypes);

            return new JsonResult { Data = recordTypes };
        }

        [AuthenticationRequired]
        [SessionExpireFilter]
        // fieldId = recordTypeName due to the routing engine
        public ActionResult CanAddStoryRecord(string storyId, string fieldId)
        {
            OMWAStoryRecord record = null;
            _documentDataAccess.AddStoryRecord(OMWDocumentID.FromString(storyId), fieldId, null, out record);

            return new JsonResult { Data = record };
        }

	    [AuthenticationRequired]
	    [SessionExpireFilter]
	    public ActionResult Ping()
	    {
		    return Json(true, JsonRequestBehavior.AllowGet);
	    }

		#endregion


		#region Private methods
		private OMWAStory GetStory(string storyId)
        {
            OMWAStory story = null;
            _documentDataAccess.GetStory(OMWDocumentID.FromString(storyId), out story);

            return story;

            //return (from t in FakeDataAccess.GetStoryList() where t.ID.GetEncoded() == storyId select t).FirstOrDefault();
        }
        #endregion

    }
}
