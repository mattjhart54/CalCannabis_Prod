<%@ Page Language="C#" MasterPageFile="~/Default.master" AutoEventWireup="true" ValidateRequest="false" Inherits="Accela.ACA.Web.Welcome" CodeBehind="Welcome.aspx.cs" %>

<%@ Register Src="Component/TopShoppingCartItems.ascx" TagName="TopShoppingCartItems" TagPrefix="uc1" %>
<%@ Register Src="~/Component/LoginBox.ascx" TagName="loginBox" TagPrefix="uc1" %>
<%@ Register TagPrefix="ACA" TagName="TabLinkList" Src="~/Component/TabLinkList.ascx" %>
<asp:Content ID="Content1" runat="server" ContentPlaceHolderID="PlaceHolderMain">
    <script type="text/javascript">
        if (typeof (top.SetLanguageOptionsVisible) != "undefined")
            top.SetLanguageOptionsVisible(true);
        window.onunload = function () {
            if (typeof (top.SetLanguageOptionsVisible) != "undefined")
                top.SetLanguageOptionsVisible(false);
        }

        $(function () {
            if (typeof (divAccessibility) != 'undefined') {
                if ($("#" + divAccessibility).get(0)) {
                    $("#" + divAccessibility).show();
                }
            }
        });
    </script>
    <div class="ACA_Content welcome-page">
        <table role='presentation'>
            <tr>
                <td valign="top">
                    <div id="divContent" class="ACA_RightContent" runat="server">
                        <ACA:AccelaDiv ID="divWelcomeText" DivType="StandardComponent" runat="server">
                            <div id="areaLoggedIn" runat="server" style="margin-bottom: 6px;">

                                <table class="Welcome_Label" role='presentation'>
                                    <tr>
                                        <td>
                                            <ACA:AccelaLabel ID="com_welcome_label_welcome" LabelKey="com_welcome_label_welcome"
                                                runat="server"></ACA:AccelaLabel>
                                        </td>
                                        <td>
                                            <ACA:AccelaLabel runat="server" ID="labelUserName"></ACA:AccelaLabel>
                                        </td>
                                    </tr>
                                </table>

                                <p>
                                    <ACA:AccelaLabel ID="com_welcome_label_loginInfo" LabelKey="com_welcome_label_loginInfo"
                                        runat="server"></ACA:AccelaLabel>
                                </p>
                            </div>
                            <div id="areaNotLoggedIn" runat="server" style="margin-bottom: 6px;">
                                <ACA:AccelaLabel ID="com_welcome_text_welcomeInfo" LabelKey="com_welcome_text_welcomeInfo"
                                    runat="server" LabelType="bodyText"></ACA:AccelaLabel>
                            </div>
                            <br />
                            <div style="margin-bottom: 6px;">
                                <ACA:AccelaLabel ID="com_welcome_text_startInfo" runat="server" LabelType="bodyText"></ACA:AccelaLabel>
                            </div>
                            <br />
                        </ACA:AccelaDiv>
                        <ACA:AccelaDiv ID="divContentLink" DivType="StandardComponent" runat="server">
                            <div>
                                <!-- start custom content -->
                                <ACA:TabLinkList ID="TabDataList" OnLinkClickEvent="TabDataList_LinkClickEvent" runat="server"></ACA:TabLinkList>
                            </div>
                            <!-- end custom content -->
                        </ACA:AccelaDiv>
                        <br />
                    </div>
                </td>
                <td valign="top">
                    <!-- Begin LoginBox -->
                    <div id="divLogin" runat="server" visible="false">
                        <uc1:loginBox ID="LoginBox" runat="server" />
                    </div>
                    <!-- End LoginBox -->
                    <div id="divTopShoppingCartItems" runat="server" class="welcome_cartlist">
                        <uc1:TopShoppingCartItems ID="TopShoppingCartItems" runat="server" />
                    </div>
                    <div class="welcome_instruction">
                        <ACA:AccelaLabel ID="lblInstruction" LabelType="PageInstruction" runat="server"></ACA:AccelaLabel>
                    </div>
                </td>
            </tr>
        </table>
    </div>
    <div class="ACA-CustomComponent" id="customComponent" runat="server" visible="false">
        <table>
            <tr>
                <td>
                    <!-- start customized component -->
                    <ACA:AccelaDiv ID="divCustomComponent" DivType="CustomizeComponent" runat="server" Visible="false">
                        <asp:PlaceHolder ID="phCustomComponent" runat="server"></asp:PlaceHolder>

                        <div id="divAdminCustomComponent" class="ACA_Customize_Component" visible="false" runat="server">
                            <p><%= GetTextByKey("acaadmin_welcomepage_msg_editcustomizecomponent")%></p>
                        </div>
                    </ACA:AccelaDiv>
                    <!-- end customized component -->
                </td>
            </tr>
        </table>
    </div>
</asp:Content>
