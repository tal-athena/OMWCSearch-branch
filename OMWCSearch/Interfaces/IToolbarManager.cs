using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OMWSTypes;
using System.Threading.Tasks;

namespace OMWCSearch.Interfaces
{
    public class ONTOmisToolCommand
    {
        public ONTOmisToolCommand()
        {
            PluginID = -1;
            CommandID = -1;
        }

        public int PluginID { get; set; }
        public int CommandID { get; set; }

        public override string ToString()
        {
            return string.Format("Plugin={0}, Command={1}", PluginID, CommandID);
        }
    }

    public class ToolBarButton
    {
        public int commandID; // REMOVE THIS
        public string iconRelativePath;
        public string title;
        public string tooltip;

        // True for two-state buttons - button stay clicked until user click again to release
        public bool twoStateButton;
        // No response to the user that clicked
        public bool ImmediateReturn;
        // Pop up response only if there is error
        public bool PopUpOnlyError;
        // If true - Operate on sub-items in collection - their IDs should be sent
        public bool ApplyToSubItems;
        // Just store with the object and send to server on press/release.
        public int Context;

        // The commands that should be sent to server
        public List<ONTOmisToolCommand> ToolCommandList_Press;
        public List<ONTOmisToolCommand> ToolCommandList_Release;

        // If not null or empty - ask the user before sending commands to server
        public string askBeforeSendingPressCommands;
        public string askBeforeSendingReleaseCommands;
    }

    public class ToolBarCommandResponse
    {
        public string status;  // can be error, ok and so ok (case insensitive)
        public string message; // the message
    }

    public class ViewSelectData
    {
        public string viewID;
        public string iconRelativePath;
        public string title;
    }

    interface IToolbarManager
    {
        List<ToolBarButton> GetToolbarButtonsForDocID(OMWDocumentID templateID);

        List<ToolBarButton> GetToolbarButtonsForSearchPrifile(int searchProfileID);

        List<ViewSelectData> GetToolbarComboBoxItemsForDocID(OMWDocumentID templateID);
        List<ViewSelectData> GetToolbarComboBoxItemsForSearchProfile(int searchProfileID);
    }


}
