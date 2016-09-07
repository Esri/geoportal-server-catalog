package com.esri.geoportal.base.metadata;

import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import org.apache.commons.cli.*;
import org.codehaus.jackson.map.ObjectMapper;

import java.io.File;

/**
 *
 * run the javascript Evaluators.js scripts
 * from command line for testing.
 * @implNote mainly tested in JetBrains Intellij
 *
 * @author David Valentine
 *
 */
public class MetadataCLI{


    /**

     * <h1>run the javascript Evaluators.js scripts</h1>
     * from command line for testing.
     *
     * <div> java com.esri.geoportal.base.metadata.MetadataCLI -md={XMLFile_fullpath}
     *</div>
     *
     * <p><b>Note:</b> This only produces the basic JSON elements seen in the
     * elastic search json document. Other steps, such as itemID are found in {@link com.esri.geoportal.lib.elastic.request.PublishMetadataRequest#prePublish(ElasticContext, AccessUtil, AppResponse, MetadataDocument)} </p>
     *
     *<p><b>Note:</b> mainly tested in JetBrains Intellij</p>
     *
     * @author David Valentine
     *
     */
    public static void main( String[] args ) {
        Option help = Option.builder("h")
                .required(false)
                .longOpt("help")
                .desc("HELP")
                .build();

        Option metadataJsDir =
                Option.builder("js")
                        .required(true)
                        .hasArg()
                        .longOpt("jsdir")
                        .desc("Base metadata javascript directory")
                      //  .type(File.class)  // test if this is a directory
                        .build();
        ;
        /* not needed.
        js read from classpath,
        metadata/js/Evaluator.js
        required to be on classpath.
        TODO: test if this works in/on a jar, if not might need to test if
        running in a jar, and set appropriate resource location
         */
//        Option metadataFile =
//                Option.builder("md")
//                        .required(true)
//                        .hasArg()
//                        .longOpt("metdatafile")
//                        .desc("Metadata File")
//                       // .type(File.class)
//                        .build();
        ;
        Option quiet = Option.builder("q")
                .required(false)
                .longOpt("quiet")
                .build();
        ;
        Option verbose = Option.builder("v")
                .required(false)
                .longOpt("verboase")
                .build();
        ;

        Options options = new Options();
        options.addOption(help);
        options.addOption(metadataJsDir);
       // options.addOption(metadataFile);
        options.addOption(quiet);
        options.addOption(verbose);
        ;
        // create the parser
        CommandLineParser parser = new DefaultParser();
        try {
            // parse the command line arguments
            CommandLine line = parser.parse(options, args);
            //File js = (File)line.getParsedOptionValue("js");
           // File md = (File)line.getParsedOptionValue("md");
            String mds= line.getOptionValue("md");
            File md = new File(mds);
            String jss = line.getOptionValue("js");
            File js = new File(jss);
            if (!md.isFile()) System.err.println("Md Metadata must be a file");
            if (!js.isDirectory()) System.err.println("js must be a directory");
            testScriptEvaluator(js,md);
        } catch (ParseException exp) {
            // oops, something went wrong
            System.err.println("Parsing failed.  Reason: " + exp.getMessage());
        } catch (Exception ex){
            System.err.println("Metadata Evaluation Failed.  Reason: " + ex.getMessage());
        }

    }
    public static void testScriptEvaluator(File metadataPath, File metadata) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        AppUser user = null;
        boolean pretty = true;
        File p = metadata;
        String xml = XmlUtil.readFile(p.getAbsolutePath());
        MetadataDocument mdoc = new MetadataDocument();
        mdoc.setXml(xml);
        //mdoc.interrogate();

        Evaluator jsEvaluator = new Evaluator();
        // add all files from directory
        File[] files =  metadataPath.listFiles();
        //String jsPath = metadataPath.getPath() + "metadata/js/Evaluator.js";

        String jsPath ="metadata/js/Evaluator.js";
        jsEvaluator.setJavascriptFile(jsPath);
        //jsEvaluator.setJavascriptFile(metadataPath.getPath() + "IsoEvaluator.js");
        //jsEvaluator.setJavascriptFile("metadata/js/Evaluator.js");
        //jsEvaluator.setJavascriptFile("metadata/js/IsoEvaluator.js");
        jsEvaluator.interrogate(mdoc);
        System.err.println("typeKey="+mdoc.getMetadataType().getKey());
        System.err.println("detailsXslt=" + jsEvaluator.getDetailsXslt("iso19115"));
        jsEvaluator.evaluate(mdoc);
        System.err.println("title="+mdoc.getTitle());
        System.err.println("xml="+mdoc.getXml());
        Object json = mapper.readValue(mdoc.getEvaluatedJson(), Object.class);
        String indented = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
        System.err.println("evaluatedjson="+indented);
        //jsEvaluator.evaluate(mdoc);
        //jsEvaluator.evaluate(mdoc);

    }
}
