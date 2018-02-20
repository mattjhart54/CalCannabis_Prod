<!--*** Language declaration goes ***-->

<%@ Page Language="C#" AutoEventWireup="true" ValidateRequest="false" %>

<!--*** Language declaration end ***-->

<%@ Import Namespace="Accela.ACA.Web" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<body>

        <script runat="server">
    
            /// <summary>
            /// Get the current url from AppSession or URL paramter
            /// </summary>
            public string CurrentURL
            {
                get
                {
                    string currentURL = Accela.ACA.Web.Common.AppSession.CurrentURL;
                    string tmpCurrentURL = Request.Params["CurrentURL"];

                    // Only support internal url with the same domain
                    if (!string.IsNullOrEmpty(tmpCurrentURL) && !Accela.ACA.Web.Common.FileUtil.IsExternalUrl(tmpCurrentURL))
                    {
                        string bridgeViewPage = ConfigurationManager.AppSettings["DefaultPageFile"];

                        // The special url paramter CurrentURL is only supported on the default page or bridgeview page.             
                        if (Request.Url.AbsolutePath.IndexOf("Default.aspx", StringComparison.InvariantCultureIgnoreCase) >= 0
                            || (!string.IsNullOrEmpty(bridgeViewPage)
                                && Request.Url.AbsolutePath.IndexOf(bridgeViewPage, StringComparison.InvariantCultureIgnoreCase) >= 0))
                        {
                            currentURL = tmpCurrentURL;
                        }
                    }

                    return currentURL;
                }
            }
        </script>

                                                            
                                                                <% Response.Redirect(CurrentURL); %>
                                                       
</html>

