namespace OMWebiSearch.Models
{
	public class SaveStoryV2Model
	{
		public string documentID { get; set; }
		public string systemID { get; set; }
		public long templateID { get; set; }
		public long fieldID { get; set; }
		public string text { get; set; }
	}
}