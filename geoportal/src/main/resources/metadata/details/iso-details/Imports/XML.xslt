<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:dt="urn:schemas-microsoft-com:datatypes" xmlns:res="http://www.esri.com/metadata/res/" 
                xmlns:d2="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">

<!-- An XSLT template for displaying XML information in ArcGIS that is not in a known metadata format.

     Revision History: Created 3/19/09 avienneau
-->

<xsl:output method="xml" indent="yes" encoding="UTF-8" doctype-public="-//W3C//DTD XHTML 1.0 Strict//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd" />

<xsl:template name="unknown" >
  <html>
    <head>
      <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
      <style type="text/css">
        body {font:0.8em 'Verdana'; margin-right:1.0em}
      <!-- metadata format heading -->  
		h3 {font-size: 1em; color: #00709C;}
      <!-- container for expanding/collapsing content -->
        .c  {cursor:hand}
      <!-- button - contains +/-/nbsp -->
        .b  {color:red; font-family:'Courier New'; font-weight:bold; text-decoration:none}
      <!-- element container -->
        .e  {margin-left:1em; text-indent:-1em; margin-right:1em}
      <!-- comment or cdata -->
        .k  {margin-left:1em; text-indent:-1em; margin-right:1em}
      <!-- tag -->
        .t  {color:#990000}
      <!-- tag in xsl namespace -->
        .xt {color:#990099}
      <!-- attribute -->
        .at  {color:red}
      <!-- attribute in xml or xmlns namespace -->
        .ns {color:red}
      <!-- attribute in dt namespace -->
        .dt {color:green}
      <!-- markup characters -->
        .m  {color:blue}
      <!-- text node -->
        .tx {font-weight:bold}
      <!-- multi-line (block) cdata -->
        .db {text-indent:0px; margin-left:1em; margin-top:0px; margin-bottom:0px;
             padding-left:.3em; border-left:1px solid #CCCCCC; font:small Courier}
      <!-- single-line (inline) cdata -->
        .di {font:small Courier}
      <!-- DOCTYPE declaration -->
        .d  {color:blue}
      <!-- pi -->
        .pi {color:blue}
      <!-- multi-line (block) comment -->
        .cb {text-indent:0px; margin-left:1em; margin-top:0px; margin-bottom:0px;
             padding-left:.3em; font:small Courier; color:#888888}
      <!-- single-line (inline) comment -->
        .ci {font:small Courier; color:#888888}
        pre {margin:0px; display:inline}
      </style>

      <script type="text/javascript"><xsl:comment><![CDATA[
        // Detect and switch the display of CDATA and comments from an inline view
        //  to a block view if the comment or CDATA is multi-line.
        function f(e)
        {
          // if this element is an inline comment, and contains more than a single
          //  line, turn it into a block comment.
          if (e.className == "ci") {
            if (e.children(0).innerText.indexOf("\n") > 0)
              fix(e, "cb");
          }
          
          // if this element is an inline cdata, and contains more than a single
          //  line, turn it into a block cdata.
          if (e.className == "di") {
            if (e.children(0).innerText.indexOf("\n") > 0)
              fix(e, "db");
          }
          
          // remove the id since we only used it for cleanup
          e.id = "";
        }
        
        // Fix up the element as a "block" display and enable expand/collapse on it
        function fix(e, cl)
        {
          // change the class name and display value
          e.className = cl;
          e.style.display = "block";
          
          // mark the comment or cdata display as a expandable container
          j = e.parentElement.children(0);
          j.className = "c";

          // find the +/- symbol and make it visible - the dummy link enables tabbing
          k = j.children(0);
          k.style.visibility = "visible";
          k.href = "#";
        }

        // Change the +/- symbol and hide the children.  This function works on "element"
        //  displays
        function ch(e)
        {
          // find the +/- symbol
          mark = e.children(0).children(0);
          
          // if it is already collapsed, expand it by showing the children
          if (mark.innerText == "+")
          {
            mark.innerText = "-";
            for (var i = 1; i < e.children.length; i++)
              e.children(i).style.display = "block";
          }
          
          // if it is expanded, collapse it by hiding the children
          else if (mark.innerText == "-")
          {
            mark.innerText = "+";
            for (var i = 1; i < e.children.length; i++)
              e.children(i).style.display="none";
          }
        }
        
        // Change the +/- symbol and hide the children.  This function work on "comment"
        //  and "cdata" displays
        function ch2(e)
        {
          // find the +/- symbol, and the "PRE" element that contains the content
          mark = e.children(0).children(0);
          contents = e.children(1);
          
          // if it is already collapsed, expand it by showing the children
          if (mark.innerText == "+")
          {
            mark.innerText = "-";
            // restore the correct "block"/"inline" display type to the PRE
            if (contents.className == "db" || contents.className == "cb")
              contents.style.display = "block";
            else contents.style.display = "inline";
          }
          
          // if it is expanded, collapse it by hiding the children
          else if (mark.innerText == "-")
          {
            mark.innerText = "+";
            contents.style.display = "none";
          }
        }
        
        // Handle a mouse click
        function cl()
        {
          e = window.event.srcElement;
          
          // make sure we are handling clicks upon expandable container elements
          if (e.className != "c")
          {
            e = e.parentElement;
            if (e.className != "c")
            {
              return;
            }
          }
          e = e.parentElement;
          
          // call the correct funtion to change the collapse/expand state and display
          if (e.className == "e")
            ch(e);
          if (e.className == "k")
            ch2(e);
        }

        // Dummy function for expand/collapse link navigation - trap onclick events instead
        function ex() 
        {}

        // Erase bogus link info from the status window
        function h()
        {
          window.status=" ";
        }

        // Set the onclick handler
        document.onclick = cl;
        
      ]]></xsl:comment>
      </script>
    </head>

    <body class="st" oncontextmenu="return true">
    
    <h3>Metadata is in unrecognized format, cannot present as a web page</h3>
    
    <xsl:apply-templates/>
    
    </body>

  </html>
</xsl:template>

<!-- Templates for each node type follows.  The output of each template has a similar structure
  to enable script to walk the result tree easily for handling user interaction. -->
  
<!-- Template for the DOCTYPE declaration.  No way to get the DOCTYPE, so we just put in a placeholder -->
<xsl:template match="node()[node()=10]">
  <div class="e"><span>
  <span class="b">&#160;</span>
  <span class="d">&lt;!DOCTYPE <xsl:value-of select="name()"/><I> (ViewSrcForDoctype)</I>&gt;</span>
  </span></div>
</xsl:template>

<!-- Template for pis not handled elsewhere -->
<xsl:template match="processing-instruction()">
  <div class="e">
  <span class="b">&#160;</span>
  <span class="m">&lt;?</span><span class="pi"><xsl:value-of select="name()"/> <xsl:value-of select="."/></span><span class="m">?&gt;</span>
  </div>
</xsl:template>

<!-- Template for the XML declaration.  Need a separate template because the pseudo-attributes
    are actually exposed as attributes instead of just element content, as in other pis -->
<xsl:template match="processing-instruction('xml')">
  <div class="e">
  <span class="b">&#160;</span>
  <span class="m">&lt;?</span><span class="pi">xml <xsl:for-each select="@*"><xsl:value-of select="name()"/>="<xsl:value-of select="."/>" </xsl:for-each></span><span class="m">?&gt;</span>
  </div>
</xsl:template>

<!-- Template for attributes not handled elsewhere -->
  <!-- Oxygen claims 'The child axis starting at an attribute node will never select anything'
     so comment out this template -->
<!-- xsl:template match="@*" xml:space="preserve">
<span><xsl:attribute name="class"><xsl:if test="xsl:*/@*">x</xsl:if>at</xsl:attribute> <xsl:value-of select="name()"/></span><span class="m">="</span><b><xsl:value-of select="."/></b><span class="m">"</span>
</xsl:template -->

<!-- Template for attributes in the xmlns or xml namespace -->
<!-- can't test for this
<xsl:template match="@xmlns:*|@xmlns|@xml:*"><span class="ns"> <xsl:value-of select="name()"/></span><span class="m">="</span><b class="ns"><xsl:value-of select="."/></b><span class="m">"</span></xsl:template>
-->

<!-- Template for attributes in the dt namespace -->
<xsl:template match="@dt:*|@d2:*"><span class="dt"> <xsl:value-of select="name()"/></span><span class="m">="</span><b class="dt"><xsl:value-of select="."/></b><span class="m">"</span></xsl:template>

<!-- Template for text nodes -->
<xsl:template match="text()">
  <div class="e">
  <span class="b">&#160;</span>
  <span class="tx"><xsl:value-of select="."/></span>
  </div>
</xsl:template>


<!-- Note that in the following templates for comments and cdata, by default we apply a style
  appropriate for single line content (e.g. non-expandable, single line display).  But we also
  inject the attribute 'id="clean"' and a script call 'f(clean)'.  As the output is read by the
  browser, it executes the function immediately.  The function checks to see if the comment or
  cdata has multi-line data, in which case it changes the style to a expandable, multi-line
  display.  Performing this switch in the DHTML instead of from script in the XSL increases
  the performance of the style sheet, especially in the browser's asynchronous case -->
  
<!-- Template for comment nodes -->
<xsl:template match="comment()">
  <div class="k">
  <span><a class="b" onclick="return false" onfocus="h()" style="visibility:hidden">-</a> <span class="m">&lt;!--</span></span>
  <span id="clean" class="ci"><dd><xsl:value-of select="."/></dd><br/></span>
  <span class="b">&#160;</span> <span class="m">--&gt;</span>
  <script>f(clean);</script></div>
</xsl:template>

<!-- Template for cdata nodes -->
<!-- can't test for this
<xsl:template match="cdata()">
  <div class="k">
  <span><a class="b" onclick="return false" onfocus="h()" style="visibility:hidden">-</a> <span class="m">&lt;![CDATA[</span></span>
  <span id="clean" class="di"><pre><xsl:value-of select="."/></dd><br/></span>
  <span class="b">&#160;</span> <span class="m">]]&gt;</span>
  <script>f(clean);</script></div>
</xsl:template>
-->

<!-- Note the following templates for elements may examine children.  This harms to some extent
  the ability to process a document asynchronously - we can't process an element until we have
  read and examined at least some of its children.  Specifically, the first element child must
  be read before any template can be chosen.  And any element that does not have element
  children must be read completely before the correct template can be chosen. This seems 
  an acceptable performance loss in the light of the formatting possibilities available 
  when examining children. -->

<!-- Template for elements not handled elsewhere (leaf nodes) -->
<xsl:template match="*">
  <div class="e"><div style="margin-left:1em;text-indent:-2em">
  <span class="b">&#160;</span>
  <span class="m">&lt;</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span> <xsl:apply-templates select="@*"/><span class="m"> /&gt;</span>
  </div></div>
</xsl:template>
  
<!-- Template for elements with comment, pi and/or cdata children -->
<xsl:template match="*[node()]">
  <div class="e">
  <div class="c"><a href="#" onclick="return false" onfocus="h()" class="b">-</a> <span class="m">&lt;</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span><xsl:apply-templates select="@*"/> <span class="m">&gt;</span></div>
  <div><xsl:apply-templates/>
  <div><span class="b">&#160;</span> <span class="m">&lt;/</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span><span class="m">&gt;</span></div>
  </div></div>
</xsl:template>

<!-- Template for elements with only text children -->
<!-- ideally would also include test for cdata children, but no test for them -->
<xsl:template match="*[text() and not(comment() or processing-instruction())]">
  <div class="e"><div style="margin-left:1em;text-indent:-2em">
  <span class="b">&#160;</span> <span class="m">&lt;</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span><xsl:apply-templates select="@*"/>
  <span class="m">&gt;</span><span class="tx"><xsl:value-of select="."/></span><span class="m">&lt;/</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span><span class="m">&gt;</span>
  </div></div>
</xsl:template>

<!-- Template for elements with element children -->
<xsl:template match="*[*]">
  <div class="e">
  <div class="c" style="margin-left:1em;text-indent:-2em"><a href="#" onclick="return false" onfocus="h()" class="b">-</a> <span class="m">&lt;</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span><xsl:apply-templates select="@*"/> <span class="m">&gt;</span></div>
  <div><xsl:apply-templates/>
  <div><span class="b">&#160;</span> <span class="m">&lt;/</span><span><xsl:attribute name="class"><xsl:if test="xsl:*">x</xsl:if>t</xsl:attribute><xsl:value-of select="name()"/></span><span class="m">&gt;</span></div>
  </div></div>
</xsl:template>

</xsl:stylesheet>