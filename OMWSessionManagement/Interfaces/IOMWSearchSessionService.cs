using System.Collections.Generic;
using OMWSTypes;

namespace OMWSessionManagement.Interfaces
{
    public interface IOMWSearchSessionService
    {
        void CacheSearchHits(int searchContextID, ICollection<OMWSearchHit> searchHits);
        IEnumerable<OMWSearchHit> GetCachedSearchHits(int searchContextID);
        OMWSearchHit FindSearchHit(int searchContextID, string searchHitSystemID);
    }
}