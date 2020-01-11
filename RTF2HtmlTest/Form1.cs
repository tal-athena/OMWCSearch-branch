using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using OMWCSearch.Utils;

namespace RTF2HtmlTest
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (fontDialog1.ShowDialog() == DialogResult.OK)
            {
                richTextBox1.Font = fontDialog1.Font;
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            textBox2.Text = richTextBox1.Rtf;
        }

        private void button3_Click(object sender, EventArgs e)
        {
            string html = null;
            RTFToHTML.ConvertRtf2Html(textBox2.Text, out html);
            textBox1.Text = html;
            richTextBox2.Text = html;
        }

        private void button4_Click(object sender, EventArgs e)
        {
            string rtf = "";
            string html = textBox1.Text;
            RTFToHTML.ConvertHtml2Rtf(html,out rtf);
            textBox2.Text = rtf;
        }

        private void button5_Click(object sender, EventArgs e)
        {
            richTextBox1.Rtf = textBox2.Text;
        }
    }
}
