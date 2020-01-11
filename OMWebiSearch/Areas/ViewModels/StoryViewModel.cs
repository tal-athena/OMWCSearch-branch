using OMWCSearch;
using OMWCSearch.Interfaces;

namespace OMWebiSearch.Areas.ViewModels
{
    public class StoryViewModel
    {
        public string StoryId { get; set; }
        public OMWAStory Story { get; set; }
    }
}