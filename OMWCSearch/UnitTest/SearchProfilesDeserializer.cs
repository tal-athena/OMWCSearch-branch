using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Xml;
using System.Reflection;

namespace OMWCSearch.UnitTest
{
    public class SearchProfilesDeserializer
    {
        private static List<DCOMWSearchProfile> _searchProfiles;

        public static List<DCOMWSearchProfile> DeserializeFromFile()
        {
            if (_searchProfiles == null)
            {
                var s = new DataContractSerializer(typeof (DCOMWSearchProfile[]));

                Assembly a = Assembly.GetExecutingAssembly();
                using (Stream strm = a.GetManifestResourceStream("OMWCSearch.profile2.xml"))
                //using (var fs = File.Open(@"profile2.xml", FileMode.Open))
                {
                    var reader = XmlDictionaryReader.CreateTextReader(strm, new XmlDictionaryReaderQuotas());
                    _searchProfiles = ((DCOMWSearchProfile[])s.ReadObject(reader, true)).ToList();
                }
            }
            return _searchProfiles;
        }
    }
}