using System.Collections.Generic;
using OMWCSearch.UnitTest;

namespace OMWCSearch.Interfaces
{
    using OMWCSearch.ViewTypes;

    public interface ISearchProvider
    {
        IEnumerable<DCOMWSearchProfile> GetAllSearchProfiles();
        DCOMWSearchProfile GetSearchProfileByID(int id);
        OMWCGridView GetGridView(int searchProfileID);
    }
}