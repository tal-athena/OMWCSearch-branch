using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OMWCSearch.Interfaces;
using OMWCSearch.Enums;
using OMWSTypes;

namespace OMWCSearch.UnitTest
{
    public partial class SearchService : ISearchService
    {
        public ErrorCode SearchStartWithFWSNotifications(
            int searchProfileID,
            SearchResultsType resultType,
            INTWSearchNotificationSink notificationSink,
            IEnumerable<OMWSearchParam> searchParams,
            out int searchContextID)
        {
            SearchStart(searchProfileID, resultType, searchParams, out searchContextID);
            return new ErrorCode();
        }
    }
}
