$(document).ready(function () {
    var config = {
        startOnLoad: true,
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true
        }
    };

    mermaid.initialize(config);
});

$(function () {
    var elements = document.getElementsByClassName("language-mermaid");
    for (var i = elements.length; i--;) {
        element = elements[i];
        var graphDefinition = element.innerText;
        if (graphDefinition) {
            var svg = mermaid.render('ha_mermaid_' + i, graphDefinition, function (svg) {});
            if (svg) {
                var svgElement = document.createElement('div');
                preNode = element.parentNode;
                svgElement.innerHTML = svg;
                svgElement.setAttribute('class', 'mermaid');
                svgElement.setAttribute('data-processed', 'true');
                preNode.parentNode.replaceChild(svgElement, preNode);
            }
        }
    }
});
