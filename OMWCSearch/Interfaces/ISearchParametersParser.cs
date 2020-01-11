using System.Collections.Generic;
using OMWCSearch.UnitTest;
using OMWSTypes;

namespace OMWCSearch.Interfaces
{
    public interface ISearchParametersParser
    {
        IEnumerable<OMWSearchParam> GetSearchParams(DCOMWSearchProfile searchProfile, Dictionary<string, string> values);
    }
}