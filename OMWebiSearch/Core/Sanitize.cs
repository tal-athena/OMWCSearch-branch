using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using org.owasp.validator.html;

namespace OMWebiSearch.Core
{
    public class Sanitize
    {
        private AntiSamy _as = new AntiSamy();
        private Policy _policy;

        public Sanitize(string policyFilePath)
        {
            _policy = Policy.getInstance(policyFilePath);
        }

        public string SanitizeInput(string input)
        {
            CleanResults results = _as.scan(input, _policy);
            return results.getCleanHTML();
        }
    }
}