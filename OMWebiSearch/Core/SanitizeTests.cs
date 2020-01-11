using System;
using NUnit.Framework;

namespace OMWebiSearch.Core
{
    [TestFixture]
    public class SanitizeTest
    {
        [Test]
        public void SanitizeInputTest()
        {
            string input = "<LINK REL=\"stylesheet\" HREF=\"javascript:alert('XSS');\">";
            string outputExpected = "<LINK REL=\"stylesheet\" />";

            Sanitize sanitize = new Sanitize(Environment.CurrentDirectory + "/../App_Data/SanitizePolicy/antisamy.xml");
            string output = sanitize.SanitizeInput(input);
            StringAssert.AreEqualIgnoringCase(outputExpected, output);

        }
    }
}