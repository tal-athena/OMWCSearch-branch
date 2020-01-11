using OMWCSearch.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OMWCSearch.UnitTest
{
    public class ToolbarManager : IToolbarManager
    {
        public List<ToolBarButton> GetToolbarButtonsForDocID(OMWSTypes.OMWDocumentID templateID)
        {
            List<ToolBarButton> buttons = new List<ToolBarButton>();

            var btn1 = new ToolBarButton();
            btn1.commandID = 1;
            btn1.iconRelativePath = "RecordIcon1.png";
            btn1.title = "Simple Apply To subitems";
            btn1.tooltip = "Simple";
            btn1.Context = 1;
            btn1.askBeforeSendingPressCommands = "Are you sure you want to archive the selected items";
            btn1.ImmediateReturn = false;
            btn1.PopUpOnlyError = false;
            btn1.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn1.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 1, PluginID = 2 });
            btn1.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 1, PluginID = 3 });
            btn1.twoStateButton = false;
            btn1.ApplyToSubItems = true;
            buttons.Add(btn1);

            var btn2 = new ToolBarButton();
            btn2.commandID = 2;
            btn2.iconRelativePath = "RecordIcon2.png";
            btn2.title = "Immediate return";
            btn2.tooltip = "Immediate return";
            btn2.Context = 2;
            btn2.ImmediateReturn = true;
            btn2.PopUpOnlyError = false;
            btn2.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn2.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 2 });
            btn2.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 3 });
            btn2.twoStateButton = false;
            buttons.Add(btn2);

            var btn3 = new ToolBarButton();
            btn3.commandID = 3;
            btn3.iconRelativePath = "RecordIcon3.png";
            btn3.title = "Two state";
            btn3.tooltip = "Two state";
            btn3.Context = 3;
            btn3.ImmediateReturn = false;
            btn3.PopUpOnlyError = false;
            btn3.askBeforeSendingPressCommands = "Ask press";
            btn3.askBeforeSendingReleaseCommands = "Ask release";
            btn3.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn3.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 2 });
            btn3.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 3 });
            btn3.ToolCommandList_Release = new List<ONTOmisToolCommand>();
            btn3.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 2 });
            btn3.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 3 });
            btn3.twoStateButton = true;
            buttons.Add(btn3);

            var btn4 = new ToolBarButton();
            btn4.commandID = 4;
            btn4.iconRelativePath = "RecordIcon4.png";
            btn4.title = "Two state error";
            btn4.tooltip = "Two state error";
            btn4.Context = 4;
            btn4.ImmediateReturn = false;
            btn4.PopUpOnlyError = true;
            btn4.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn4.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 2 });
            btn4.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 3 });
            btn4.ToolCommandList_Release = new List<ONTOmisToolCommand>();
            btn4.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 2 });
            btn4.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 3 });
            btn4.twoStateButton = true;
            buttons.Add(btn4);


            var btn5 = new ToolBarButton();
            btn5.commandID = 5;
            btn5.iconRelativePath = "RecordIcon4.png";
            btn5.title = "Two state ImmediateReturn";
            btn5.tooltip = "Two state ImmediateReturn";
            btn5.Context = 5;
            btn5.ImmediateReturn = true;
            btn5.PopUpOnlyError = false;
            btn5.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn5.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 5, PluginID = 2 });
            btn5.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 5, PluginID = 3 });
            btn5.ToolCommandList_Release = new List<ONTOmisToolCommand>();
            btn5.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 55, PluginID = 2 });
            btn5.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 55, PluginID = 3 });
            btn5.twoStateButton = true;
            buttons.Add(btn5);


             return buttons;
            //return new List<ToolBarButton>();
        }

        public List<ToolBarButton> GetToolbarButtonsForSearchPrifile(int searchProfileID)
        {
            List<ToolBarButton> buttons = new List<ToolBarButton>();

            var btn1 = new ToolBarButton();
            btn1.commandID = 1;
            btn1.iconRelativePath = "RecordIcon1.png";
            btn1.title = "Simple";
            btn1.tooltip = "Simple";
            btn1.Context = 1;
            btn1.askBeforeSendingPressCommands = "Are you sure you want to archive the selected items";
            btn1.ImmediateReturn = false;
            btn1.PopUpOnlyError = false;
            btn1.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn1.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 1, PluginID = 2 });
            btn1.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 1, PluginID = 3 });
            btn1.twoStateButton = false;
            buttons.Add(btn1);

            var btn2 = new ToolBarButton();
            btn2.commandID = 2;
            btn2.iconRelativePath = "RecordIcon2.png";
            btn2.title = "Immediate return";
            btn2.tooltip = "Immediate return";
            btn2.Context = 2;
            btn2.ImmediateReturn = true;
            btn2.PopUpOnlyError = false;
            btn2.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn2.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 2 });
            btn2.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 3 });
            btn2.twoStateButton = false;
            buttons.Add(btn2);

            var btn3 = new ToolBarButton();
            btn3.commandID = 3;
            btn3.iconRelativePath = "RecordIcon3.png";
            btn3.title = "Two state";
            btn3.tooltip = "Two state";
            btn3.Context = 3;
            btn3.ImmediateReturn = false;
            btn3.PopUpOnlyError = false;
            btn3.askBeforeSendingPressCommands = "Ask press";
            btn3.askBeforeSendingReleaseCommands = "Ask release";
            btn3.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn3.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 2 });
            btn3.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 3 });
            btn3.ToolCommandList_Release = new List<ONTOmisToolCommand>();
            btn3.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 2 });
            btn3.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 3 });
            btn3.twoStateButton = true;
            buttons.Add(btn3);

            var btn4 = new ToolBarButton();
            btn4.commandID = 4;
            btn4.iconRelativePath = "RecordIcon4.png";
            btn4.title = "Two state error";
            btn4.tooltip = "Two state error";
            btn4.Context = 4;
            btn4.ImmediateReturn = false;
            btn4.PopUpOnlyError = true;
            btn4.ToolCommandList_Press = new List<ONTOmisToolCommand>();
            btn4.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 2 });
            btn4.ToolCommandList_Press.Add(new ONTOmisToolCommand() { CommandID = 2, PluginID = 3 });
            btn4.ToolCommandList_Release = new List<ONTOmisToolCommand>();
            btn4.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 2 });
            btn4.ToolCommandList_Release.Add(new ONTOmisToolCommand() { CommandID = 52, PluginID = 3 });
            btn4.twoStateButton = true;
            buttons.Add(btn4);


           // return new List<ToolBarButton>();
            return buttons;
        }

        public List<ViewSelectData> GetToolbarComboBoxItemsForDocID(OMWSTypes.OMWDocumentID templateID)
        {
            List<ViewSelectData> items = new List<ViewSelectData>();
            items.Add(new ViewSelectData()
            {
                iconRelativePath = "/OMWebiSearch/Content/RecordIcons/RecordIcon1.png",
                title = "Item 1",
                viewID = "1"
            });

            items.Add(new ViewSelectData()
            {
                iconRelativePath = "/OMWebiSearch/Content/RecordIcons/RecordIcon2.png",
                title = "Item 2",
                viewID = "2"
            });

            items.Add(new ViewSelectData()
            {
                iconRelativePath = "/OMWebiSearch/Content/RecordIcons/RecordIcon3.png",
                title = "Item 3",
                viewID = "3"
            });

            return items;
        }

        public List<ViewSelectData> GetToolbarComboBoxItemsForSearchProfile(int searchProfileID)
        {
            List<ViewSelectData> items = new List<ViewSelectData>();
            items.Add(new ViewSelectData()
            {
                iconRelativePath = "/OMWebiSearch/Content/RecordIcons/RecordIcon1.png",
                title = "Item 1",
                viewID = "1"
            });

            items.Add(new ViewSelectData()
            {
                iconRelativePath = "/OMWebiSearch/Content/RecordIcons/RecordIcon2.png",
                title = "Item 2",
                viewID = "2"
            });

            items.Add(new ViewSelectData()
            {
                iconRelativePath = "/OMWebiSearch/Content/RecordIcons/RecordIcon3.png",
                title = "Item 3",
                viewID = "3"
            });

            return items;
        }
    }
}
