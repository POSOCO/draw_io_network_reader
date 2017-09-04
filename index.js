var DOMParser = require('xmldom').DOMParser;
var url = "";
var filename = "Urtdsm communcation.xml";
fs = require('fs');
var xmlTree;
var numPMUsAttributeStr = "NoofPMUs";
var bandWidthRequiredAttributeStr = "BandwidthReqd";

fs.readFile(filename, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    // console.log(data);
    var parser = new DOMParser();
    xmlTree = parser.parseFromString(data, "text/xml");
    xmlTree.getElementsByTagName("mxCell");
    var xmlRoot = xmlTree.getElementsByTagName("root")[0];
    var graphElements = xmlRoot.childNodes;
    //console.log(graphElements);
    var ssNodes = [];
    var ssLinks = [];
    for (var graphElementIterator = 0; graphElementIterator < graphElements.length; graphElementIterator++) {
        var element = graphElements[graphElementIterator];
        //console.log(element);
        var xmlElementType = element.tagName;
        var elementType;
        var elementId = element.getAttribute("id");
        var elementValue = element.getAttribute("value");
        var elementStyle = element.getAttribute("style");
        var elementLabel = element.getAttribute("label");
        if (xmlElementType == "mxCell") {
            if (elementId == null || elementStyle == "" || elementValue == null || elementValue == "" || elementStyle == null || elementStyle == "") {
                // then it is of no interest to us
                continue;
            }
            var elementStyleStrings = elementStyle.split(";");
            var elementStyles = [];
            for (var k = 0; k < elementStyleStrings.length; k++) {
                elementStyles[elementStyleStrings[k].split("=")[0]] = elementStyleStrings[k].split("=")[1];
            }
            //find if the element styles have an attribute called 'ellipse'
            if (Object.keys(elementStyles).indexOf("ellipse") != -1) {
                // this element is a node
                elementType = "node";
                // add this element to the list of nodes
                ssNodes.push({id: elementId, label: elementValue});
            } else if (Object.keys(elementStyles).indexOf("edgeStyle") != -1) {
                // this element is a link
                elementType = "link";
                var elementSourceId = element.getAttribute("source");
                var elementTargetId = element.getAttribute("target");
                ssLinks.push({
                    bandwidth: parseFloat(elementValue),
                    sourceId: elementSourceId,
                    targetId: elementTargetId
                });
            }
        } else if (xmlElementType == "object") {
            // this can be a node xml element
            // find if this has a child of tag type mxCell
            var nodeMxCell = element.getElementsByTagName("mxCell")[0];
            var nodeStyleStrings = nodeMxCell.getAttribute("style").split(";");
            var nodeStyles = [];
            for (var k = 0; k < nodeStyleStrings.length; k++) {
                nodeStyles[nodeStyleStrings[k].split("=")[0]] = elementStyleStrings[k].split("=")[1];
            }
            //find if the element styles have an attribute called 'ellipse'
            if (Object.keys(nodeStyles).indexOf("ellipse") != -1) {
                // this element is a node
                elementType = "node";
                // find the number of PMUs and bandwidth required attributes
                var elementNumPMUs = element.getAttribute(numPMUsAttributeStr);
                var elementBandWidthRequired = element.getAttribute(bandWidthRequiredAttributeStr);
                // add this element to the list of nodes
                ssNodes.push({
                    id: elementId,
                    label: elementLabel,
                    num_pmu: elementNumPMUs,
                    bandwidth_req: elementBandWidthRequired
                });
            }
        }
    }
    var network = {};
    network.nodes = ssNodes;
    network.links = ssLinks;
    console.log(network);
    fs.writeFileSync("network.json", JSON.stringify(network, null, 4));
});
