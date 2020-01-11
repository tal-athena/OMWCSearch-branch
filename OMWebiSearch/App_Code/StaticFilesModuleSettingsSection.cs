using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace OMWebiSearch.App_Code
{
    public class StaticFilesModuleSettingsSection : ConfigurationSection
    {
        public static StaticFilesModuleSettingsSection GetConfig()
        {
            return (StaticFilesModuleSettingsSection)System.Configuration.ConfigurationManager.GetSection("staticFilesModuleSettings") ?? new StaticFilesModuleSettingsSection();
        }

        [System.Configuration.ConfigurationProperty("allowAnonymous", IsDefaultCollection = true)]
        [ConfigurationCollection(typeof(AllowAnonymousElement), AddItemName = "file")]
        public AllowAnonymousElement AllowAnonymous
        {
            get
            {
                object o = this["allowAnonymous"];
                return o as AllowAnonymousElement;
            }
        }
    }

    public class AllowAnonymousElement : ConfigurationElementCollection
    {
        public FileElement this[int index]
        {
            get
            {
                return base.BaseGet(index) as FileElement;
            }
            set
            {
                if (base.BaseGet(index) != null)
                {
                    base.BaseRemoveAt(index);
                }
                this.BaseAdd(index, value);
            }
        }

        public new FileElement this[string responseString]
        {
            get { return (FileElement)BaseGet(responseString); }
            set
            {
                if (BaseGet(responseString) != null)
                {
                    BaseRemoveAt(BaseIndexOf(BaseGet(responseString)));
                }
                BaseAdd(value);
            }
        }

        protected override System.Configuration.ConfigurationElement CreateNewElement()
        {
            return new FileElement();
        }

        protected override object GetElementKey(System.Configuration.ConfigurationElement element)
        {
            return ((FileElement)element).Path;
        }
    }

    public class FileElement : ConfigurationElement
    {
        [ConfigurationProperty("path", IsRequired = true, IsKey = true)]
        [StringValidator(MinLength = 0)]
        public String Path
        {
            get
            {
                return (String)this["path"];
            }
            set
            {
                this["path"] = value;
            }
        }
    }
}