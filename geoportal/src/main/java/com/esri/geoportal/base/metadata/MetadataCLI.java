/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.base.metadata;

import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.cli.*;
import org.springframework.context.support.AbstractApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

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
     *  <p><b>Note:</b> mvn command line call is in contrib</p>
     *
     * @author David Valentine
     *
     */
    public static void main( String[] args ) {
        System.err.println("ignore errors. This needs to be reworked as a spring shell application");

        AbstractApplicationContext context = null;
        Option help = Option.builder("h")
                .required(false)
                .longOpt("help")
                .desc("HELP")
                .build();

//        Option metadataJsDir =
//                Option.builder("js")
//                        .required(true)
//                        .hasArg()
//                        .longOpt("jsdir")
//                        .desc("Base metadata javascript directory")
//                      //  .type(File.class)  // test if this is a directory
//                        .build();
        ;
        /* not needed.
        js read from classpath,
        metadata/js/Evaluator.js
        required to be on classpath.
        TODO: test if this works in/on a jar, if not might need to test if
        running in a jar, and set appropriate resource location
         */
        Option metadataFile =
                Option.builder("md")
                        .required(true)
                        .hasArg()
                        .longOpt("metdatafile")
                        .desc("Metadata File")
                        // .type(File.class)
                        .build();
        ;

        Option verbose = Option.builder("v")
                .required(false)

                .longOpt("verboase")
                .build();
        ;

        Options options = new Options();
        options.addOption(help);
        //options.addOption(metadataJsDir);
        options.addOption(metadataFile);
        ;
        options.addOption(verbose);
        ;
        // create the parser
        CommandLineParser parser = new DefaultParser();
        try {
            context = new ClassPathXmlApplicationContext("config/cli-context.xml"

                    ,"**/cli-app-factory.xml"
            );
            // parse the command line arguments
            CommandLine line = parser.parse(options, args);
            Boolean v = line.hasOption("v");


            String mds= line.getOptionValue("md");
            File md = new File(mds);

            if (!md.isFile()) System.err.println("Md Metadata must be a file");

            testScriptEvaluator(md,v);
        } catch (ParseException exp) {
            // oops, something went wrong
            System.err.println("Parsing failed.  Reason: " + exp.getMessage());
        } catch (Exception ex){
            System.err.println("Metadata Evaluation Failed.  Reason: " + ex.getMessage());
        }

    }
    public static void testScriptEvaluator( File metadata, Boolean verbose) throws Exception {
        System.err.println("IGNORE errors above this line. This needs to be reworked as a spring shell application");

        ObjectMapper mapper = new ObjectMapper();
        AppUser user = null;
        boolean pretty = true;
        Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
                "metadata.Evaluator",Evaluator.class,new Evaluator());
        File p = metadata;
        String xml = XmlUtil.readFile(p.getAbsolutePath());
        MetadataDocument mdoc = new MetadataDocument();
        mdoc.setItemId("test");
        mdoc.setXml(xml);
        mdoc.interrogate();
        mdoc.evaluate();
        mdoc.validate();
        System.err.println("typeKey="+mdoc.getMetadataType().getKey());
        /*
         originally the code tested just the javascript evaluators.
         renable with a switch, later. Faster w/o the spring initialization.
          */
        /*
        Evaluator jsEvaluator = new Evaluator();

        // add all files from directory
        //File[] files =  metadataPath.listFiles();
        //String jsPath = metadataPath.getPath() + "metadata/js/Evaluator.js";

        String jsPath ="metadata/js/Evaluator.js";
        jsEvaluator.setJavascriptFile(jsPath);
        //jsEvaluator.setJavascriptFile(metadataPath.getPath() + "IsoEvaluator.js");

        jsEvaluator.interrogate(mdoc);
        System.err.println("typeKey="+mdoc.getMetadataType().getKey());
        System.err.println("detailsXslt=" + jsEvaluator.getDetailsXslt(mdoc.getMetadataType().getKey()));
        jsEvaluator.evaluate(mdoc);
        */
        System.err.println("title="+mdoc.getTitle());
        if (verbose) {
            System.err.println("xml=" + mdoc.getXml());
        }
        Object json = mapper.readValue(mdoc.getEvaluatedJson(), Object.class);
        String indented = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
        System.err.println("evaluatedjson="+indented);


    }
}
